import { useState } from "react";
import { auth, dbChat } from "../../firebaseConfig";
import { ref, update, onDisconnect, child } from "firebase/database";
import { useLocation } from "react-router-dom";

const useChat = () => {
  const [userProfiles, setUserProfiles] = useState<
    Record<string, IUserProfiles>
  >({});

  const userUID = auth?.currentUser?.uid;
  const userProfilesRef = ref(dbChat, "userProfiles");
  const location = useLocation();
  if (userUID) {
    onDisconnect(child(userProfilesRef, userUID)).update({
      status: "offline",
    });
    if (location.pathname !== "/chat") {
      update(child(userProfilesRef, userUID), {
        status: "offline",
      });
    }
  }

  return {
    userProfiles,
    setUserProfiles,
  };
};
export default useChat;
//   const sendMessage = async (text: string) => {
//     const newMessageRef = push(ref(dbChat, "chats"));
//     const newMessage: Message = { id: newMessageRef.key!, text };

//     try {
//       await update(newMessageRef, newMessage);
//     } catch (error) {
//       console.error("Error sending message:", error);
//     }
//   };
//  const [userProfiles, setUserProfiles] = useState({});

//  // Fetch user profiles when the component mounts
//  useEffect(() => {
//    const userProfilesRef = ref(dbChat, "userProfiles");
//    get(userProfilesRef).then((snapshot) => {
//      setUserProfiles(snapshot.val());
//    });
//  }, []);
//   useEffect(() => {
//     const userProfilesRef = ref(dbChat, "userProfiles");
//     get(userProfilesRef).then((snapshot) => {
//       const userProfilesData: Record<string, IUserProfiles> = snapshot.val();
//       setUserProfiles(userProfilesData);
//     });
//   }, []);
