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
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, dbChat } from "../../firebaseConfig";
import { CgGenderFemale, CgGenderMale } from "react-icons/cg";
import { RiRadioButtonLine } from "react-icons/ri";
import { PulseLoader, SyncLoader } from "react-spinners";

import ChatInterface from "../../components/ChatComponents/ChatInterface";
import ChatList from "../../components/ChatComponents/ChatList";
import useChat from "../../hooks/useChat/useChat";
import SignIn from "../../Auth/SignIn/SignIn";
import useAudio from "../../hooks/useAudio/useAudio";

import "./ChatPage.scss";

const ChatPage = () => {
  const { userProfiles, setUserProfiles } = useChat();
  const { play: playReceiveCallSound } = useAudio("/havingCallSound.mp3");

  const navigate = useNavigate();

  const [chatRoomId, setChatRoomId] = useState("");
  const [senderUserInfo, setSenderUserInfo] = useState<IUserInfo>({
    username: "",
    userphoto: "",
    autoCancelTimer: 0,
    callRequestKey: "",
  });
  const [senderIsTyping, setSenderIsTyping] = useState(false);
  const [sender, setSender] = useState("");

  const [recipientUserInfo, setRecipientUserInfo] = useState<IUserInfo>({
    username: "",
    userphoto: "",
    autoCancelTimer: 0,
    callRequestKey: "",
  });
  const [recipient, setRecipient] = useState("");
  const [recipientIsTyping, setRecipientIsTyping] = useState(false);

  const [recipientStatus, setRecipientStatus] = useState("");
  const [pendingCallRequests, setPendingCallRequests] = useState<
    IPendingCallRequestInfo[]
  >([]);

  const [filterUsersByStatus, setFilterUsersByStatus] = useState("all");
  const [showModalFilterUserByLevel, setShowModalFilterUserByLevel] =
    useState(false);
  const [filterUsersByLevel, setFilterUsersByLevel] =
    useState<IFilterUsersByLevel>({
      from: "",
      to: "",
    });

  const [readyToChat, setReadyToChat] = useState(false);
  const [userProfilesLoading, setUserProfilesLoading] = useState(true);
  const [isAvatarZoomed, setIsAvatarZoomed] = useState(false);

  const userUID = auth.currentUser?.uid;

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
  }, [chatRoomId, userUID]);

  const initiateCall = (
    recipientUID: string,
    recipientUserName: string,
    userPhoto: string
  ): void => {
    const callRequestRef = ref(dbChat, "callRequests");
    const senderUID = userUID;
    const newChatRoomId = generateChatRoomId(senderUID || "", recipientUID);
    const currentUserProfile = Object.values(userProfiles).find(
      (user) => user.uid === userUID
    );
    const newCallRequest: ICallRequest = {
      senderName: currentUserProfile?.displayName || "",
      senderPhoto: currentUserProfile?.photo || "",
      sender: senderUID || "",
      recipient: recipientUID || "",
      status: "pending",
      chatRoomId: newChatRoomId,
      autoCancelTimer: 30,
      senderIsTyping: false,
      recipientIsTyping: false,
    };

    push(callRequestRef, newCallRequest);

    setRecipientUserInfo({
      userphoto: userPhoto || "",
      username: recipientUserName || "",
      autoCancelTimer: 30,
      callRequestKey: "",
    });

    setChatRoomIdForSender();
  };

  useEffect(() => {
    let time = recipientUserInfo.autoCancelTimer;
    let timeInterval = setInterval(() => {
      if (recipientUserInfo.username && time > 0) {
        setRecipientUserInfo((prevRecipientUserInfo) => {
          const newTime = prevRecipientUserInfo.autoCancelTimer - 1;
          if (newTime === 0) {
            clearInterval(timeInterval);
            handleCancelCallForRecipient();
          }
          return {
            ...prevRecipientUserInfo,
            autoCancelTimer: newTime,
          };
        });
      } else {
        clearInterval(timeInterval);
      }
    }, 1000);

    if (chatRoomId) {
      clearInterval(timeInterval);
    }

    return () => clearInterval(timeInterval);
  }, [recipientUserInfo, chatRoomId]);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      pendingCallRequests.forEach((user) => {
        let time = user.autoCancelTimer;
        if (user.senderName && time > 0) {
          time -= 1;

          setPendingCallRequests((prevPendingCallRequests) => {
            return prevPendingCallRequests.map((prevUser) => {
              if (prevUser.key === user.key) {
                return { ...prevUser, autoCancelTimer: time };
              }
              return prevUser;
            });
          });
          if (time === 0) {
            clearInterval(timeInterval);
          }
        } else {
          clearInterval(timeInterval);
        }
      });
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [pendingCallRequests]);

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
        setSenderUserInfo({
          username: acceptedCall.senderName,
          userphoto: acceptedCall.senderPhoto,
          autoCancelTimer: acceptedCall.autoCancelTimer,
          callRequestKey,
        });
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

            setRecipientUserInfo((recipientPrevUserInfo) => ({
              ...recipientPrevUserInfo,
              callRequestKey: callRequestKey,
            }));
          }
          if (
            callRequest.sender === userUID &&
            callRequest.status === "rejected"
          ) {
            setRecipientUserInfo({
              username: "",
              userphoto: "",
              autoCancelTimer: 0,
              callRequestKey: "",
            });
          }
          const userIsSender = Object.values(callRequests).find(
            (callRequest: any) => callRequest.sender === userUID
          );

          if (!userIsSender) {
            setRecipientUserInfo({
              username: "",
              userphoto: "",
              autoCancelTimer: 0,
              callRequestKey: "",
            });
          }
        }
      });
    } catch (error) {
      console.error("Error setting chat room ID for recipient:", error);
    }
  };

  useEffect(() => {
    const callRequestRef = ref(dbChat, "callRequests");
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
              playReceiveCallSound();

              const newPendingCall = {
                senderName: callRequest.senderName,
                senderPhoto: callRequest.senderPhoto,
                autoCancelTimer: callRequest.autoCancelTimer,
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
          setRecipientUserInfo({
            username: "",
            userphoto: "",
            autoCancelTimer: 0,
            callRequestKey: "",
          });
        }
      }
    };

    const unsubscribe = onValue(callRequestRef, callback);

    return () => {
      unsubscribe();
    };
  }, [recipientStatus, userUID]);

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
    const isCurrentUser = user.uid === userUID;

    if (isCurrentUser) {
      return false;
    }

    const { status, englishLevel } = user;

    switch (filterUsersByStatus) {
      case "all":
        return filterUsersByLevel.from && filterUsersByLevel.to
          ? englishLevel >= filterUsersByLevel.from &&
              englishLevel <= filterUsersByLevel.to
          : true;

      case "online":
        return (
          status === "online" &&
          (!filterUsersByLevel.from ||
            (englishLevel >= filterUsersByLevel.from &&
              englishLevel <= filterUsersByLevel.to))
        );

      case "chatting":
        return (
          status === "chatting" &&
          (!filterUsersByLevel.from ||
            (englishLevel >= filterUsersByLevel.from &&
              englishLevel <= filterUsersByLevel.to))
        );

      case "ready":
        return (
          status === "ready" &&
          (!filterUsersByLevel.from ||
            (englishLevel >= filterUsersByLevel.from &&
              englishLevel <= filterUsersByLevel.to))
        );

      case "offline":
        return (
          status === "offline" &&
          (!filterUsersByLevel.from ||
            (englishLevel >= filterUsersByLevel.from &&
              englishLevel <= filterUsersByLevel.to))
        );

      default:
        return false;
    }
  });

  useEffect(() => {
    const userProfilesRef = ref(dbChat, "userProfiles");

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
      if (!chatRoomId && isAvatarZoomed) {
        setIsAvatarZoomed(false);
      }
    }

    if (chatRoomId.length) {
      pendingCallRequests.forEach(async (pendingCall) => {
        await deleteCallRequestData(pendingCall.key);
      });
    }
  }, [readyToChat, pendingCallRequests, chatRoomId]);

  const handleFilterModalClose = () => {
    setShowModalFilterUserByLevel(!showModalFilterUserByLevel);

    if (filterUsersByLevel.from === "" || filterUsersByLevel.to === "") {
      setFilterUsersByLevel({
        from: "",
        to: "",
      });
    }
  };

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
                    <p>We are searching a partner for you...</p>
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
                className={
                  filterUsersByStatus === "all"
                    ? "all filter-button"
                    : "filter-button"
                }
                onClick={() => setFilterUsersByStatus("all")}
              >
                All
              </button>
              <button
                className={
                  filterUsersByStatus === "online"
                    ? "online filter-button"
                    : "filter-button"
                }
                onClick={() => setFilterUsersByStatus("online")}
              >
                Online
              </button>
              <button
                className={
                  filterUsersByStatus === "ready"
                    ? "ready filter-button"
                    : "filter-button"
                }
                onClick={() => setFilterUsersByStatus("ready")}
              >
                Ready
              </button>
              <button
                className={
                  filterUsersByStatus === "chatting"
                    ? "chatting filter-button"
                    : "filter-button"
                }
                onClick={() => setFilterUsersByStatus("chatting")}
              >
                Chatting
              </button>
              <button
                className={
                  filterUsersByStatus === "offline"
                    ? "offline filter-button"
                    : "filter-button"
                }
                onClick={() => setFilterUsersByStatus("offline")}
              >
                Offline
              </button>
              <div className="filterUsersByLevel-block">
                {filterUsersByLevel.from && filterUsersByLevel.to ? (
                  <div className="show-selected-levels">
                    <b>
                      {filterUsersByLevel.from + " - " + filterUsersByLevel.to}
                    </b>
                    <div className="fastResetSelectedLevels">
                      <button
                        onClick={() =>
                          setFilterUsersByLevel({ from: "", to: "" })
                        }
                      >
                        reset
                      </button>
                    </div>
                  </div>
                ) : (
                  ""
                )}
                <button
                  className={
                    filterUsersByLevel.from && filterUsersByLevel.to
                      ? "filterByUsersLevel-callModal-active"
                      : "filter-button"
                  }
                  onClick={() =>
                    setShowModalFilterUserByLevel(!showModalFilterUserByLevel)
                  }
                >
                  Filter users by level
                </button>
              </div>

              {showModalFilterUserByLevel ? (
                <div className="filterByUserLevel-section">
                  <div className="filterByUserLevel-container">
                    <button
                      className="filterByUserLevelModalCloseButton"
                      onClick={handleFilterModalClose}
                    >
                      &#10008;
                    </button>
                    <p className="howdoesitwork">
                      <b>
                        To filter users by level, select two level and close the
                        modal.
                        <br />
                        The results will be displayed properly.
                      </b>
                    </p>

                    <p>
                      Selected level{" "}
                      {filterUsersByLevel.from
                        ? `from ${filterUsersByLevel.from}`
                        : "from ... "}{" "}
                      {filterUsersByLevel.to
                        ? ` to ${filterUsersByLevel.to}`
                        : " to ... "}
                    </p>

                    <div className="filterByUserLevel-buttons">
                      {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
                        <button
                          key={level}
                          className={
                            filterUsersByLevel.from === level ||
                            filterUsersByLevel.to === level
                              ? "selectedLevel"
                              : ""
                          }
                          onClick={() => {
                            setFilterUsersByLevel((prevData) => {
                              if (!prevData.from) {
                                return {
                                  ...prevData,
                                  from: level,
                                };
                              } else {
                                return {
                                  ...prevData,
                                  to: level,
                                };
                              }
                            });
                          }}
                          disabled={
                            (filterUsersByLevel.from > level &&
                              filterUsersByLevel.to === "") ||
                            (filterUsersByLevel.from && filterUsersByLevel.to
                              ? true
                              : false)
                          }
                        >
                          {level}
                        </button>
                      ))}
                      <div className="resetSelectedLevel">
                        <button
                          disabled={
                            filterUsersByLevel.from || filterUsersByLevel.to
                              ? false
                              : true
                          }
                          onClick={() =>
                            setFilterUsersByLevel({ from: "", to: "" })
                          }
                        >
                          reset filter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
          </>
        )}

        <div className="chattingUserInfo">
          {senderUserInfo.username && chatRoomId && (
            <>
              <div className="chattingUser-photo">
                {isAvatarZoomed ? (
                  <div className="zoomed-avatar">
                    <img
                      src={senderUserInfo.userphoto}
                      alt="Zoomed user photo"
                      onClick={() => setIsAvatarZoomed(false)}
                    />
                  </div>
                ) : (
                  <img
                    src={senderUserInfo.userphoto}
                    alt="User photo"
                    onClick={() => setIsAvatarZoomed(true)}
                  />
                )}
              </div>
              <p>
                You're chatting to <span>{senderUserInfo.username}</span>
              </p>
              <div className="isTyping">
                <span
                  className={`${
                    userUID !== sender && senderIsTyping
                      ? "isTyping-active"
                      : "isTyping-inactive"
                  }`}
                >
                  Typing
                </span>
              </div>
            </>
          )}
        </div>
        <div className="chattingUserInfo">
          {recipientUserInfo.username && chatRoomId && (
            <>
              <div className="chattingUser-photo">
                <div className="chattingUser-photo">
                  {isAvatarZoomed ? (
                    <div className="zoomed-avatar">
                      <img
                        src={recipientUserInfo.userphoto}
                        alt="Zoomed user photo"
                        onClick={() => setIsAvatarZoomed(false)}
                      />
                    </div>
                  ) : (
                    <img
                      src={recipientUserInfo.userphoto}
                      alt="User photo"
                      onClick={() => setIsAvatarZoomed(true)}
                    />
                  )}
                </div>
              </div>
              <p>
                You're chatting to <span>{recipientUserInfo.username}</span>
              </p>

              <div className="isTyping">
                <span
                  className={`${
                    userUID !== recipient && recipientIsTyping
                      ? "isTyping-active"
                      : "isTyping-inactive"
                  }`}
                >
                  Typing
                </span>
              </div>
            </>
          )}
        </div>
        {chatRoomId.length === 0 && (
          <ul className="users">
            {userProfilesLoading ? (
              <p className="loading-users">
                <PulseLoader color="#36d7b7" size={20} margin={8} />
              </p>
            ) : filteredUsers.length > 0 ? (
              filteredUsers?.map((user) => {
                if (user.uid !== userUID) {
                  return (
                    <li key={user.uid}>
                      <div className="userPhoto-container">
                        <div className="userPhoto-container-main">
                          <img src={user.photo} alt="user photo" />
                        </div>
                        {user.englishLevel ? (
                          <span>{user.englishLevel}</span>
                        ) : (
                          ""
                        )}
                      </div>
                      <div className="user-age-name">
                        <p className="user-name"> {user.displayName}</p>
                        <p className="user-age">
                          {user.age ? "age: " + user.age : ""}
                        </p>
                      </div>
                      <p className="user-gender">
                        <span>
                          {user.gender === "male" ? (
                            <i title="Male" className="g-ma">
                              <CgGenderMale />
                            </i>
                          ) : user.gender === "female" ? (
                            <i title="Female" className="g-fe">
                              <CgGenderFemale />
                            </i>
                          ) : (
                            ""
                          )}
                        </span>
                      </p>
                      <div className="user-feedbacks">
                        <span>👍{user.feedback?.likes}</span>
                        <span>👎{user.feedback?.dislikes}</span>
                      </div>

                      <span className="status-user">
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
                      <div className="invite-btn">
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
                          onClick={() =>
                            initiateCall(user.uid, user.displayName, user.photo)
                          }
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
                      </div>
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
        {!chatRoomId && (
          <div
            className={
              recipientUserInfo.username || senderUserInfo.username.length > 0
                ? "call-notices-active"
                : ""
            }
          >
            <div
              className={
                recipientUserInfo.username
                  ? "recipientUserInfo-active"
                  : "recipientUserInfo-inactive"
              }
            >
              <div className="recipientUser-content">
                <div className="recipientUser-photo">
                  <img src={recipientUserInfo.userphoto} alt="user photo" />
                </div>
                <div
                  className="autoCancelTheCallTimer"
                  style={{
                    backgroundColor: `${
                      recipientUserInfo.autoCancelTimer < 10
                        ? "#3c3b32"
                        : "#d60404"
                    }  `,
                  }}
                >
                  <span>
                    {recipientUserInfo.autoCancelTimer}
                    <span
                      style={{
                        width: `${
                          (recipientUserInfo.autoCancelTimer / 30) * 100
                        }%`,
                        backgroundColor: `${
                          recipientUserInfo.autoCancelTimer < 10
                            ? "#d60404"
                            : "#ffe100"
                        }  `,
                      }}
                    ></span>
                  </span>
                </div>
                <h4>{recipientUserInfo.username}</h4>
                <button
                  className="cancel-button"
                  onClick={handleCancelCallForRecipient}
                >
                  Cancel
                </button>
              </div>
            </div>
            <div
              className={
                pendingCallRequests.length > 0 && !recipientUserInfo.username
                  ? "senderUserContainer-active"
                  : "senderUserContainer-inactive"
              }
            >
              {pendingCallRequests.length !== 0 &&
                pendingCallRequests.map((user) => (
                  <div key={user.key} className="senderUserNotice-active">
                    <div className="senderUserNotice-content">
                      {recipientUserInfo.username && (
                        <div className="info-message">
                          You are currently calling to
                          <span> {recipientUserInfo.username}</span>. Please
                          cancel your current call before accepting a new one.
                        </div>
                      )}
                      <div className="senderUser-photo">
                        <img src={user.senderPhoto} alt="user photo" />
                      </div>
                      <div
                        className="autoCancelTheCallTimer"
                        style={{
                          backgroundColor: `${
                            user.autoCancelTimer < 10 ? "#3c3b32" : "#d60404"
                          }  `,
                        }}
                      >
                        <span>
                          {user.autoCancelTimer}
                          <span
                            style={{
                              width: `${(user.autoCancelTimer / 30) * 100}%`,
                              backgroundColor: `${
                                user.autoCancelTimer < 10
                                  ? "#d60404"
                                  : "#ffe100"
                              }  `,
                            }}
                          ></span>
                        </span>
                      </div>
                      <h4>{user.senderName}</h4>
                      <div className="senderUserNotice-content-buttons">
                        <button
                          className="accept-button"
                          disabled={recipientUserInfo.username ? true : false}
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
          </div>
        )}

        {chatRoomId.length > 0 && (
          <>
            <ChatList chatRoomId={chatRoomId} />
            <ChatInterface
              chatRoomId={chatRoomId}
              setChatRoomId={setChatRoomId}
              senderUserInfo={senderUserInfo}
              recipientUserInfo={recipientUserInfo}
              setSenderUserInfo={setSenderUserInfo}
              setRecipientUserInfo={setRecipientUserInfo}
              setSender={setSender}
              setRecipient={setRecipient}
              setSenderIsTyping={setSenderIsTyping}
              setRecipientIsTyping={setRecipientIsTyping}
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
