import { useAuthState } from "react-firebase-hooks/auth";
import { auth, dbChat } from "../firebaseConfig";
import "./Auth.scss";
import SignIn from "./SignIn/SignIn";
import SignOut from "./SignOut/SignOut";
import { child, get, ref, set } from "firebase/database";

const Auth = () => {
  const [user] = useAuthState(auth);

  const createUserProfile = async () => {
    const userUID = auth.currentUser?.uid;
    if (userUID) {
      const userProfilesRef = ref(dbChat, "userProfiles");

      const userProfileSnapshot = await get(child(userProfilesRef, userUID));
      if (!userProfileSnapshot.exists()) {
        const { displayName, uid } = user!;
        const userProfileData: IUserProfiles = {
          displayName: displayName!,
          age: "",
          gender: "",
          englishLevel: "",
          photo: auth.currentUser?.photoURL!,
          uid: uid!,
          status: "offline",
          feedback: {
            likes: 0,
            dislikes: 0,
          },
        };

        await set(child(userProfilesRef, userUID), userProfileData);
      }
    }
  };

  auth.onAuthStateChanged((user) => {
    if (user) {
      createUserProfile();
    }
  });

  return (
    <div className="auth">
      {user ? <SignOut /> : <SignIn />}
      {user?.photoURL && <img src={user?.photoURL} alt="Profile photo" />}
    </div>
  );
};

export default Auth;
