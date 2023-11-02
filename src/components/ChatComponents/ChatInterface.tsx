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
import useEmojiAPI from "../../hooks/useEmojiApi/useEmojiApi";
import "./Chat.scss";
interface ChatInterfaceProps {
  chatRoomId: string;
  setChatRoomId: (chatRoomId: string) => void;
  senderUserInfo: IUserInfo;
  recipientUserInfo: IUserInfo;
  setSenderUserInfo: (senderUserInfo: IUserInfo) => void;
  setRecipientUserInfo: (recipientUserInfo: IUserInfo) => void;
}

const ChatInterface = ({
  chatRoomId,
  setChatRoomId,
  senderUserInfo,
  recipientUserInfo,
  setSenderUserInfo,
  setRecipientUserInfo,
}: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [feedbackType, setFeedbackType] = useState("");
  const [showFeedbackComponent, setShowFeedbackComponent] = useState(false);
  const [chattingUserInfo, setChattingUserInfo] = useState<IChattingUserInfo>();
  const { emojis, loadingEmojis } = useEmojiAPI();
  const inputRef = useRef<HTMLInputElement>(null);
  const userUID = auth.currentUser?.uid;

  const handleSendMessage = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!chatRoomId) {
      alert("Chat room ID is not available.");
      return;
    }

    const newMessageRef = push(ref(dbChat, `chatRooms/${chatRoomId}`));
    const newMessage: Messages = {
      uid: auth.currentUser?.uid,
      id: newMessageRef.key!,
      message,
    };
    if (message) {
      try {
        await set(newMessageRef, newMessage);
        setMessage("");
        inputRef.current?.focus();
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      alert("Please enter a text!");
      inputRef.current?.focus();
    }
  };

  const deleteCallRequestData = async () => {
    const callRequestRef = ref(dbChat, "callRequests");
    setSenderUserInfo({ username: "", userphoto: "" });
    setRecipientUserInfo({ username: "", userphoto: "" });

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
          setChattingUserInfo({
            uid: `${
              (callRequest.recipient !== userUID && callRequest.recipient) ||
              (callRequest.sender !== userUID && callRequest.sender)
            }`,
            username: senderUserInfo.username || recipientUserInfo.username,
          });
        }
      }
    };

    const unsubscribe = onValue(callRequestRef, callback);

    return () => {
      unsubscribe();
    };
  }, [auth.currentUser?.uid]);

  window.addEventListener("beforeunload", () => {
    deleteCallRequestData();
  });
  const handleAddingEmoji = (emoji: string): void => {
    setMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };
  const handleGiveFeedback = async (): Promise<void> => {
    const userProfileRef = ref(dbChat, `userProfiles/${chattingUserInfo?.uid}`);

    try {
      const userProfileSnapshot = await get(userProfileRef);
      const userProfileData = userProfileSnapshot.val();

      if (userProfileData && feedbackType) {
        const feedbackCount = userProfileData.feedback[feedbackType + "s"] || 0;

        const updatedFeedback = {
          ...userProfileData.feedback,
          [feedbackType + "s"]: feedbackCount + 1,
        };

        await update(userProfileRef, {
          feedback: updatedFeedback,
        });

        setFeedbackType("");
        setChatRoomId("");
        setShowFeedbackComponent(!showFeedbackComponent);

        console.log(`Feedback (${feedbackType}) submitted successfully.`);
      } else if (userProfileData && feedbackType === "") {
        alert("Please select feedback!");
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
          <h3>Select Feedback:</h3>
          <div className="emoji-options">
            <button
              className={feedbackType === "like" ? "isActive" : ""}
              onClick={() => setFeedbackType("like")}
            >
              👍
            </button>
            <button
              className={feedbackType === "dislike" ? "isActive" : ""}
              onClick={() => setFeedbackType("dislike")}
            >
              👎
            </button>
          </div>
          <button className="submit-feedback" onClick={handleGiveFeedback}>
            Give
          </button>
          <p>Or You can leave without giving feedback:</p>
          <button onClick={() => setChatRoomId("")}>Leave</button>
        </div>
      )}
      {chattingUserInfo && (
        <div className="quited-user">
          <p>
            <span>{chattingUserInfo.username} </span>
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
          onClick={() => {
            setShowFeedbackComponent(true);
            deleteCallRequestData();
          }}
        >
          Leave chat
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
        <input
          type="text"
          value={message}
          ref={inputRef}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setMessage(e.target.value)
          }
          placeholder="Type your message..."
        />
        <button type="submit">
          <BiSolidSend />
        </button>
      </form>
    </div>
  );
};
export default ChatInterface;
