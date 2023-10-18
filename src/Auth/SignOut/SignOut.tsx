import { auth } from "../../firebaseConfig";

const SignOut = () => {
  const handleGoogleSignOut = async () => {
    auth.signOut();
  };
  return <button onClick={handleGoogleSignOut}>signOut</button>;
};

export default SignOut;
