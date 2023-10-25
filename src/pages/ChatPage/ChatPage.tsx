import {
  DataSnapshot,
  child,
  get,
  onDisconnect,
  onValue,
  push,
  ref,
  remove,
  update,
} from "firebase/database";
import ChatInput from "../../components/ChatComponents/ChatInput";
import ChatList from "../../components/ChatComponents/ChatList";
import { useEffect, useState } from "react";
import { auth, dbChat } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { RiRadioButtonLine } from "react-icons/ri";
import { PulseLoader, SyncLoader } from "react-spinners";

import useChat from "../../hooks/useChat/useChat";
import SignIn from "../../Auth/SignIn/SignIn";

import "./ChatPage.scss";

const ChatPage = () => {
  const { userProfiles, setUserProfiles } = useChat();

  const navigate = useNavigate();

  const [chatRoomId, setChatRoomId] = useState("");
  const [senderUserInfo, setSenderUserInfo] = useState("");
  const [recipientUserInfo, setRecipientUserInfo] = useState("");
  const [recipientStatus, setRecipientStatus] = useState("");
  const [pendingCallRequests, setPendingCallRequests] = useState<
    IPendingCallRequestInfo[]
  >([]);
  const [filterUsersBy, setFilterUsersBy] = useState("all");
  const [readyToChat, setReadyToChat] = useState(false);
  const [userProfilesLoading, setUserProfilesLoading] = useState(true);
  useEffect(() => {
    const userProfilesRef = ref(dbChat, "userProfiles");
    const userUID = auth?.currentUser?.uid;

    const unsubscribe = onValue(userProfilesRef, (snapshot) => {
      const userProfilesData: Record<string, IUserProfiles> = snapshot.val();
      setUserProfiles(userProfilesData);
      setUserProfilesLoading(false);
    });

    if (userUID) {
      update(child(userProfilesRef, userUID), {
        status: "online",
      });

      onDisconnect(child(userProfilesRef, userUID)).update({
        status: "offline",
      });
    }
    if (userUID && chatRoomId.length) {
      update(child(userProfilesRef, userUID), {
        status: "chatting",
      });
    }
    return () => {
      unsubscribe();
      if (userUID)
        update(child(userProfilesRef, userUID), {
          status: "offline",
        });
    };
  }, [chatRoomId, auth.currentUser?.uid]);

  const initiateCall = (
    recipientUID: string,
    recipientUserName: string
  ): void => {
    const callRequestRef = ref(dbChat, "callRequests");
    const senderUID = auth.currentUser?.uid;
    const newChatRoomId = generateChatRoomId(senderUID || "", recipientUID);
    const currentUserProfile = Object.values(userProfiles).find(
      (user) => user.uid === auth.currentUser?.uid
    );
    const newCallRequest: ICallRequest = {
      senderName: currentUserProfile?.displayName || "",
      sender: senderUID || "",
      recipient: recipientUID || "",
      status: "pending",
      chatRoomId: newChatRoomId,
    };

    push(callRequestRef, newCallRequest);

    setRecipientUserInfo(recipientUserName);

    setChatRoomIdForSender();
  };

  const handleStatusEmptyForRecipient = (): void => {
    setRecipientStatus("");
  };
  const handleCancelCallForRecipient = (): void => {
    setRecipientStatus("rejected");
  };
  const acceptCall = async (callRequestKey: string): Promise<void> => {
    const callRequestRef = ref(dbChat, `callRequests/${callRequestKey}`);

    try {
      await update(callRequestRef, { status: "accepted" });

      const newChatRoomId = (await get(callRequestRef)).val().chatRoomId;

      setReadyToChat(false);

      handleStatusEmptyForRecipient();

      setChatRoomId(newChatRoomId);

      setPendingCallRequests((pendingCalls) =>
        pendingCalls.filter(({ key }) => key !== callRequestKey)
      );

      const acceptedCall = pendingCallRequests.find(
        (pendingCall) => pendingCall.key === callRequestKey
      );

      if (acceptedCall) {
        setSenderUserInfo(acceptedCall.senderName);
      }

      pendingCallRequests.forEach(async (pendingCall) => {
        if (pendingCall.key !== callRequestKey) {
          await deleteCallRequestData(pendingCall.key);
        }
      });
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  };

  const deleteCallRequestData = async (
    callRequestKey: string
  ): Promise<void> => {
    const requestToDeleteRef = ref(dbChat, `callRequests/${callRequestKey}`);

    setPendingCallRequests((pendingCalls) =>
      pendingCalls.filter(({ key }) => key !== callRequestKey)
    );

    try {
      await remove(requestToDeleteRef);

      handleStatusEmptyForRecipient();
      console.log("Call request data deleted successfully");
    } catch (error) {
      console.error("Error deleting call request data:", error);
    }
  };

  const rejectCall = async (callRequestKey: string): Promise<void> => {
    const callRequestRef = ref(dbChat, `callRequests/${callRequestKey}`);
    try {
      await update(callRequestRef, { status: "rejected" });
      console.log("Call request rejected successfully");
      await deleteCallRequestData(callRequestKey);
    } catch (error) {
      console.error("Error rejecting call request:", error);
    }
  };

  function generateChatRoomId(recipientId: string, senderId: string) {
    const separator = "-";
    const chatRoomId = `${recipientId}${separator}${senderId}`;

    return chatRoomId;
  }
  const setChatRoomIdForSender = async (): Promise<void> => {
    const userUID = auth.currentUser?.uid;

    const callRequestRef = ref(dbChat, `callRequests`);

    try {
      onValue(callRequestRef, (snapshot: DataSnapshot) => {
        const callRequests = snapshot.val();

        for (const callRequestKey in callRequests) {
          const callRequest = callRequests[callRequestKey];

          if (
            callRequest.sender === userUID &&
            callRequest.status === "accepted"
          ) {
            setChatRoomId(callRequest.chatRoomId);
          }
          if (
            callRequest.sender === userUID &&
            callRequest.status === "rejected"
          ) {
            setRecipientUserInfo("");
          }
          const userIsSender = Object.values(callRequests).find(
            (callRequest: any) => callRequest.sender === userUID
          );

          if (!userIsSender) {
            setRecipientUserInfo("");
          }
        }
      });
    } catch (error) {
      console.error("Error setting chat room ID for recipient:", error);
    }
  };
  useEffect(() => {
    const callRequestRef = ref(dbChat, "callRequests");
    const userUID = auth.currentUser?.uid;

    const callback = (snapshot: DataSnapshot) => {
      const callRequests = snapshot.val();
      for (const callRequestKey in callRequests) {
        const callRequest = callRequests[callRequestKey];
        if (
          callRequest.recipient === userUID &&
          callRequest.status === "pending"
        ) {
          setPendingCallRequests((prevPendingCallRequests) => {
            const exists = prevPendingCallRequests.some(
              (pendingCall) => pendingCall.key === callRequestKey
            );

            if (!exists) {
              const newPendingCall = {
                senderName: callRequest.senderName,
                status: callRequest.status,
                key: callRequestKey,
              };
              const updatedPendingCalls = [
                ...prevPendingCallRequests,
                newPendingCall,
              ];

              return updatedPendingCalls;
            } else {
              return prevPendingCallRequests;
            }
          });
        }

        if (
          callRequest.recipient === userUID &&
          callRequest.status === "rejected"
        ) {
          rejectCall(callRequestKey);
          setPendingCallRequests((pendingCalls) =>
            pendingCalls.filter(({ key }) => key !== callRequestKey)
          );
        }
        if (callRequest.sender === userUID && recipientStatus === "rejected") {
          rejectCall(callRequestKey);
          setRecipientUserInfo("");
        }
      }
    };

    const unsubscribe = onValue(callRequestRef, callback);

    return () => {
      unsubscribe();
    };
  }, [recipientStatus, auth.currentUser?.uid]);

  window.addEventListener("beforeunload", function () {
    handleCleanup();
  });

  const handleCleanup = async () => {
    handleCancelCallForRecipient();

    if (pendingCallRequests.length > 0) {
      for (const pendingCall of pendingCallRequests) {
        await rejectCall(pendingCall.key);
      }
    }
  };

  const filteredUsers = Object.values(userProfiles).filter((user) => {
    const isCurrentUser = user.uid === auth.currentUser?.uid;

    if (isCurrentUser) {
      return false;
    }

    if (filterUsersBy === "all") {
      return true;
    } else if (filterUsersBy === "online") {
      return user.status === "online";
    } else if (filterUsersBy === "chatting") {
      return user.status === "chatting";
    } else if (filterUsersBy === "ready") {
      return user.status === "ready";
    } else if (filterUsersBy === "offline") {
      return user.status === "offline";
    }
    return false;
  });

  useEffect(() => {
    const userProfilesRef = ref(dbChat, "userProfiles");
    const userUID = auth.currentUser?.uid;

    if (readyToChat && pendingCallRequests.length > 0) {
      const firstPendingRequest = pendingCallRequests[0];
      acceptCall(firstPendingRequest.key);
    }

    if (userUID) {
      if (readyToChat) {
        update(child(userProfilesRef, userUID), {
          status: "ready",
        });
      }

      if (!chatRoomId.length && !readyToChat) {
        update(child(userProfilesRef, userUID), {
          status: "online",
        });
      }
    }

    if (chatRoomId.length) {
      pendingCallRequests.forEach(async (pendingCall) => {
        await deleteCallRequestData(pendingCall.key);
      });
    }
  }, [readyToChat, pendingCallRequests]);

  const isChatRoomEmpty = () => chatRoomId.length === 0;

  if (auth.currentUser) {
    return (
      <div className="chat-page">
        {isChatRoomEmpty() && (
          <div className="navigationButtons">
            <button className="navigateToHome" onClick={() => navigate("/")}>
              Go to Home
            </button>
            <button
              className="navigateToDashboard"
              onClick={() => navigate("/dashboard")}
            >
              My profile
            </button>
          </div>
        )}

        {isChatRoomEmpty() && (
          <div className="chatPage-info">
            <h1>Welcome to the Chat Page! 😊</h1>
            <p>
              This is your space to connect, chat, and share with friends and
              fellow chat enthusiasts. Feel free to start a conversation, send
              messages, and even use emojis to express yourself. Have a great
              time chatting!
            </p>
          </div>
        )}
        {isChatRoomEmpty() && (
          <>
            <div className="beReadyToChat">
              <button
                className="activate-readyToChat-btn"
                onClick={() => setReadyToChat(true)}
              >
                Find a partner
              </button>

              <div
                className={
                  readyToChat
                    ? "beReadytoChat-container-active"
                    : "beReadytoChat-container-inactive"
                }
              >
                <div className="beReadyToChat-content">
                  <p className="info-ReadyToChatFeature">
                    Now you are available for chat. Others can send you chat
                    requests, and the first request you get will start the
                    conversation. It's a quick and easy way to connect with
                    fellow users.
                  </p>
                  <div className="searching-ui">
                    <div className="searching-ui-loading">
                      <SyncLoader color="#00b3ff" size={28} />
                    </div>
                    <p>We are searching a parkner for you...</p>
                  </div>
                  <button
                    className="inactivate-readyToChat-btn"
                    onClick={() => setReadyToChat(false)}
                  >
                    Cancel searching
                  </button>
                </div>
              </div>
            </div>
            <div className="filterUsersBy">
              <p>Filter users by: </p>
              <button
                className={filterUsersBy === "all" ? "all" : ""}
                onClick={() => setFilterUsersBy("all")}
              >
                All
              </button>
              <button
                className={filterUsersBy === "online" ? "online" : ""}
                onClick={() => setFilterUsersBy("online")}
              >
                Online
              </button>
              <button
                className={filterUsersBy === "ready" ? "ready" : ""}
                onClick={() => setFilterUsersBy("ready")}
              >
                Ready
              </button>
              <button
                className={filterUsersBy === "chatting" ? "chatting" : ""}
                onClick={() => setFilterUsersBy("chatting")}
              >
                Chatting
              </button>
              <button
                className={filterUsersBy === "offline" ? "offline" : ""}
                onClick={() => setFilterUsersBy("offline")}
              >
                Offline
              </button>
            </div>
          </>
        )}
        <h3 className="userInfo">
          {senderUserInfo && chatRoomId && (
            <>
              You're chatting to <span>{senderUserInfo}</span>
            </>
          )}
        </h3>
        <h3 className="userInfo">
          {recipientUserInfo && chatRoomId && (
            <>
              You're chatting to <span>{recipientUserInfo}</span>
            </>
          )}
        </h3>
        {chatRoomId.length === 0 && (
          <ul className="users">
            {userProfilesLoading ? (
              <p className="loading-users">
                <PulseLoader color="#36d7b7" size={20} margin={8} />
              </p>
            ) : filteredUsers.length > 0 ? (
              filteredUsers?.map((user) => {
                if (user.uid !== auth.currentUser?.uid) {
                  return (
                    <li key={user.uid}>
                      {user.displayName}

                      <b>👍{user.feedback?.likes}</b>
                      <b>👎{user.feedback?.dislikes}</b>

                      <span>
                        <RiRadioButtonLine
                          color={
                            user.status === "online"
                              ? "#11ff00"
                              : user.status === "ready"
                              ? "#11ff00"
                              : "#14144d"
                          }
                        />
                      </span>

                      <button
                        title={
                          user.status === "online"
                            ? "This user is Online"
                            : user.status === "chatting"
                            ? "This user is Chatting already"
                            : user.status === "ready"
                            ? "This user is ready"
                            : "This user is Offline"
                        }
                        onClick={() => initiateCall(user.uid, user.displayName)}
                        disabled={
                          user.status === "offline" ||
                          user.status === "chatting"
                        }
                      >
                        {user.status === "online"
                          ? "Call"
                          : user.status === "chatting"
                          ? "Chatting"
                          : user.status === "ready"
                          ? "Ready"
                          : "Offline"}
                      </button>
                    </li>
                  );
                }
              })
            ) : (
              <p className="no-results-found">
                Sorry, we couldn't find any users. 😢
              </p>
            )}
          </ul>
        )}
        {recipientUserInfo.length !== 0 && !chatRoomId && (
          <div className="recipientUserInfo-active">
            <div className="recipientUser-content">
              <h4>{recipientUserInfo}</h4>
              <button
                className="cancel-button"
                onClick={handleCancelCallForRecipient}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div
          className={
            pendingCallRequests.length > 0 && !chatRoomId
              ? "senderUserContainer-active"
              : "senderUserContainer-inactive"
          }
        >
          {pendingCallRequests.length !== 0 &&
            !chatRoomId &&
            pendingCallRequests.map((user) => (
              <div key={user.key} className="senderUserNotice-active">
                <div className="senderUserNotice-content">
                  <h4>{user.senderName}</h4>
                  <div className="senderUserNotice-content-buttons">
                    <button
                      className="accept-button"
                      onClick={() => acceptCall(user.key)}
                    >
                      Accept
                    </button>
                    <button
                      className="cancel-button"
                      onClick={() => rejectCall(user.key)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
        {chatRoomId.length > 0 && (
          <>
            <ChatList chatRoomId={chatRoomId} />
            <ChatInput
              chatRoomId={chatRoomId}
              setChatRoomId={setChatRoomId}
              senderUserInfo={senderUserInfo}
              recipientUserInfo={recipientUserInfo}
              setSenderUserInfo={setSenderUserInfo}
              setRecipientUserInfo={setRecipientUserInfo}
            />
          </>
        )}
      </div>
    );
  } else {
    return (
      <div className="alertSignIn">
        <p>To chat with other users, please sign in!</p>
        <SignIn reloadPage={() => window.location.reload()} />
        <button onClick={() => navigate(-1)}>Go to back</button>
      </div>
    );
  }
};

export default ChatPage;
