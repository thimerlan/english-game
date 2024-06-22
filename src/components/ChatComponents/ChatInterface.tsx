import { useEffect, useRef, useState } from "react";
import emojiIcon from "../../assets/emojiI.png";
import { BiSolidSend } from "react-icons/bi";
import { auth, dbChat } from "../../firebaseConfig";
import {
  push,
  ref,
  set,
  remove,
  get,
  DataSnapshot,
  onValue,
  update,
} from "firebase/database";
import { PulseLoader } from "react-spinners";
import { MdOutlineExitToApp } from "react-icons/md";
import useEmojiAPI from "../../hooks/useEmojiApi/useEmojiApi";
import useAudio from "../../hooks/useAudio/useAudio";

import "./Chat.scss";

interface ChatInterfaceProps {
  chatRoomId: string;
  setChatRoomId: (chatRoomId: string) => void;
  senderUserInfo: IUserInfo;
  recipientUserInfo: IUserInfo;
  setSenderUserInfo: (senderUserInfo: IUserInfo) => void;
  setRecipientUserInfo: (recipientUserInfo: IUserInfo) => void;
  setSender: (sender: string) => void;
  setRecipient: (recipient: string) => void;
  setSenderIsTyping: (senderIsTyping: boolean) => void;
  setRecipientIsTyping: (setRecipientIsTyping: boolean) => void;
}

const ChatInterface = ({
  chatRoomId,
  setChatRoomId,
  senderUserInfo,
  recipientUserInfo,
  setSenderUserInfo,
  setRecipientUserInfo,
  setSender,
  setRecipient,
  setSenderIsTyping,
  setRecipientIsTyping,
}: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [feedbackType, setFeedbackType] = useState("");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [showFeedbackComponent, setShowFeedbackComponent] = useState(false);
  const [chattingUserInfo, setChattingUserInfo] = useState<IChattingUserInfo>();
  const { emojis, loadingEmojis } = useEmojiAPI();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { play: playSendMessageSound } = useAudio("/sendingMessageSound.mp3");

  const userUID = auth.currentUser?.uid;

  useEffect(() => {
    const callRequestKey =
      senderUserInfo.callRequestKey || recipientUserInfo.callRequestKey;

    if (!callRequestKey) {
      return;
    }

    const callRequestRef = ref(dbChat, `callRequests/${callRequestKey}`);

    const callback = (snapshot: DataSnapshot) => {
      const callRequestData = snapshot.val();

      if (!callRequestData) {
        return;
      }

      const { sender, recipient, senderIsTyping, recipientIsTyping } =
        callRequestData;

      setSender(sender);
      setRecipient(recipient);

      if (senderIsTyping) {
        setSenderIsTyping(true);
      } else {
        setSenderIsTyping(false);
      }

      if (recipientIsTyping) {
        setRecipientIsTyping(true);
      } else {
        setRecipientIsTyping(false);
      }

      if (message.length > 0 && sender === userUID) {
        update(callRequestRef, {
          senderIsTyping: true,
        });
      }

      if (message.length === 0 && sender === userUID) {
        update(callRequestRef, {
          senderIsTyping: false,
        });
      }

      if (message.length > 0 && recipient === userUID) {
        update(callRequestRef, {
          recipientIsTyping: true,
        });
      }

      if (message.length === 0 && recipient === userUID) {
        update(callRequestRef, {
          recipientIsTyping: false,
        });
      }
    };

    const unsubscribe = onValue(callRequestRef, callback);

    return () => {
      unsubscribe();
    };
  }, [message.length, chatRoomId]);

  const handleSendMessage = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    textareaRef.current?.focus();
    if (!chatRoomId) {
      alert("Chat room ID is not available.");
      return;
    }

    const newMessageRef = push(ref(dbChat, `chatRooms/${chatRoomId}`));
    const newMessage: Messages = {
      uid: userUID,
      id: newMessageRef.key!,
      message,
    };
    if (message) {
      try {
        playSendMessageSound();

        setMessage("");
        await set(newMessageRef, newMessage);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const deleteCallRequestData = async () => {
    const callRequestRef = ref(dbChat, "callRequests");
    setSenderUserInfo({
      username: "",
      userphoto: "",
      autoCancelTimer: 0,
      callRequestKey: "",
    });
    setRecipientUserInfo({
      username: "",
      userphoto: "",
      autoCancelTimer: 0,
      callRequestKey: "",
    });

    try {
      const snapshot = await get(callRequestRef);
      const callRequests = snapshot.val();

      for (const callRequestKey in callRequests) {
        const callRequest = callRequests[callRequestKey];

        if (
          callRequest.recipient === userUID ||
          (callRequest.sender === userUID && callRequest.status === "accepted")
        ) {
          const requestToDeleteRef = ref(
            dbChat,
            `callRequests/${callRequestKey}`
          );
          await update(requestToDeleteRef, { status: "rejected" });
          await remove(requestToDeleteRef);

          console.log("Call request data deleted successfully");
        }
        if (
          callRequest.recipient === userUID ||
          (callRequest.sender === userUID &&
            callRequest.status === "rejected" &&
            chattingUserInfo)
        ) {
          const requestToDeleteRef = ref(
            dbChat,
            `callRequests/${callRequestKey}`
          );
          await remove(requestToDeleteRef);
        }
      }
    } catch (error) {
      console.error("Error in loop:", error);
    }
  };
  useEffect(() => {
    const callRequestRef = ref(dbChat, "callRequests");
    const callback = (snapshot: DataSnapshot) => {
      const callRequests = snapshot.val();
      for (const callRequestKey in callRequests) {
        const callRequest = callRequests[callRequestKey];

        if (
          (callRequest.recipient === userUID &&
            callRequest.status === "rejected") ||
          (callRequest.sender === userUID && callRequest.status === "rejected")
        ) {
          let isSender = callRequest.sender === userUID;

          setChattingUserInfo({
            userId: isSender ? callRequest.recipient : callRequest.sender,
            userName: isSender
              ? recipientUserInfo.username
              : senderUserInfo.username,
          });
        }
      }
    };

    const unsubscribe = onValue(callRequestRef, callback);

    return () => {
      unsubscribe();
    };
  }, [userUID]);

  window.addEventListener("beforeunload", () => {
    deleteCallRequestData();
  });
  const handleAddingEmoji = (emoji: string): void => {
    setMessage((prev) => prev + emoji);
    textareaRef.current?.focus();
  };
  const handleGiveFeedback = async (): Promise<void> => {
    const chattingUserProfileRef = ref(
      dbChat,
      `userProfiles/${chattingUserInfo?.userId}`
    );
    const currentUserProfileRef = ref(dbChat, `userProfiles/${userUID}`);

    const newFeedbackRef = push(
      ref(dbChat, `userProfiles/${chattingUserInfo?.userId}/detailedFeedback`)
    );

    try {
      const [chattingUserProfileSnapshot, currentUserProfileSnapshot] =
        await Promise.all([
          get(chattingUserProfileRef),
          get(currentUserProfileRef),
        ]);

      const chattingUserProfileData = chattingUserProfileSnapshot.val();
      const currentUserProfileData = currentUserProfileSnapshot.val();

      if (chattingUserProfileData && currentUserProfileData) {
        const feedbackCount =
          chattingUserProfileData.feedback[feedbackType + "s"] || 0;

        const updatedFeedback = {
          ...chattingUserProfileData.feedback,
          [feedbackType + "s"]: feedbackCount + 1,
        };

        await update(chattingUserProfileRef, {
          feedback: updatedFeedback,
        });

        if (chattingUserInfo) {
          const { uid, displayName, photo } = currentUserProfileData;

          let newDetailedFeedback = {
            userId: uid,
            userName: displayName,
            userPhoto: photo,
            feedbackType,
            comment: feedbackComment,
          };

          await set(newFeedbackRef, newDetailedFeedback);
        }

        setFeedbackType("");
        setFeedbackComment("");
        setChatRoomId("");
        setShowFeedbackComponent(!showFeedbackComponent);

        console.log(`Feedback (${feedbackType}) submitted successfully.`);
      } else {
        console.error("User profile not found.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <div className="chat-interface">
      {showFeedbackComponent && (
        <div className="feedback-container">
          <h3>Did you like talking to this user:</h3>
          <div className="feedback-options">
            <button
              className={`feedback-option-like ${
                feedbackType === "like" ? "isActive" : ""
              }`}
              onClick={() => setFeedbackType("like")}
            >
              👍 <b>(Yes, I did)</b>
            </button>
            <button
              className={`feedback-option-dislike ${
                feedbackType === "dislike" ? "isActive" : ""
              }`}
              onClick={() => setFeedbackType("dislike")}
            >
              👎 <b>(No, I didn't)</b>
            </button>
          </div>
          <textarea
            className="feedback-comment"
            placeholder="Additional comments (optional)"
            maxLength={250}
            value={feedbackComment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFeedbackComment(e.target.value)
            }
          />
          <div className="feedback-length-counter">
            <span
              className={
                feedbackComment.length === 250
                  ? "counter-red"
                  : "counter-normal"
              }
            >
              {250 - feedbackComment.length}
            </span>

            {feedbackComment.length === 250 && (
              <b className="max-char-warning">Max characters reached</b>
            )}
          </div>

          <button
            disabled={!feedbackType}
            className="submit-feedback"
            onClick={handleGiveFeedback}
          >
            Submit Feedback
          </button>
          <p>Or You can leave without giving feedback:</p>
          <button
            className="skipFeedback-btn"
            onClick={() => setChatRoomId("")}
          >
            Leave
          </button>
        </div>
      )}
      {chattingUserInfo && (
        <div className="quited-user">
          <p>
            <span>{chattingUserInfo.userName} </span>
            has left this chat. You can also leave this chat by clicking the
            button below:
            <button
              onClick={() => {
                setShowFeedbackComponent(true);
                deleteCallRequestData();
              }}
            >
              Leave Chat
            </button>
          </p>
        </div>
      )}
      <div className="quitChat">
        <button
          title="leave chat"
          onClick={() => {
            setShowFeedbackComponent(true);
            deleteCallRequestData();
          }}
        >
          <MdOutlineExitToApp size={25} />
        </button>
      </div>
      <div className="callEmojisList">
        <button onClick={() => setShowEmojis((prev) => !prev)}>
          <img width={40} height={59} src={emojiIcon} alt="Emoji" />
        </button>
      </div>
      <div className={showEmojis ? "emojis-active" : " emojis-inactive"}>
        <div className="emojis-container">
          {loadingEmojis ? (
            <PulseLoader size={23} color="#222" />
          ) : (
            emojis?.map((emoji) => (
              <span
                key={emoji.unicodeName}
                className="emoji"
                onClick={() => handleAddingEmoji(emoji.character)}
              >
                {emoji.character}
              </span>
            ))
          )}
        </div>
      </div>
      <form onSubmit={handleSendMessage}>
        <textarea
          name="messageInput"
          value={message}
          ref={textareaRef}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setMessage(e.target.value)
          }
          style={{
            height: `${37 + message.length}px`,
          }}
          placeholder="Type your message..."
        />
        <button disabled={message.trim().length ? false : true} type="submit">
          <BiSolidSend />
        </button>
      </form>
    </div>
  );
};
export default ChatInterface;
