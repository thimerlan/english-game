import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import GoogleButton from "react-google-button";
import app, { auth } from "../../firebaseConfig";
import { useEffect, useState } from "react";
import LoadingAuth from "../../components/LoadingAuthUpdate/LoadingAuth";

const SignIn = ({ reloadPage }: { reloadPage?: () => void }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleGoogleSignIn = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (reloadPage) {
        reloadPage();
      }
      console.log("User signed in with Google:", user);
    } catch (error: any) {
      console.error("Error signing in with Google:", error.message);
    }
  };
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      } else {
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth.currentUser]);
  return (
    <>
      {isLoading ? (
        <LoadingAuth />
      ) : (
        <GoogleButton onClick={handleGoogleSignIn}>
          Sign In with Google
        </GoogleButton>
      )}
    </>
  );
};

export default SignIn;
