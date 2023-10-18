import { useAuthState } from "react-firebase-hooks/auth";
import SignIn from "../../Auth/SignIn/SignIn";
import "./AlertSignIn.scss";
import { auth } from "../../firebaseConfig";
interface IAlertSignIn {
  onClose: () => void;
}
const AlertSignIn = ({ onClose }: IAlertSignIn) => {
  const [user] = useAuthState(auth);
  return (
    <div onClick={onClose} className="alertSignIn">
      <div
        onClick={(e) => e.stopPropagation()}
        className="alertSignInContainer"
      >
        <p>Please sign in to add words to your favorites.</p>
        {!user && <SignIn />}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
export default AlertSignIn;
