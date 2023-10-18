// import useCoins from "../../hooks/useCoins/useCoins";
// import coin from "../../assets/coin.svg";
//   const { coins } = useCoins();
import { useEffect, useState } from "react";
import { auth, dbChat } from "../../firebaseConfig";
import { get, ref } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { PropagateLoader } from "react-spinners";
import NavBar from "../../components/NavBar/NavBar";
import "./Dashboard.scss";

interface IUserProfile {
  uid: string;
  displayName: string;
  status: string;
  feedback: feedback;
}
const Dashboard = () => {
  const [userProfile, setUserProfile] = useState<IUserProfile>();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userUID = user.uid;
        const userProfileRef = ref(dbChat, `userProfiles/${userUID}`);

        try {
          const userProfileSnapshot = await get(userProfileRef);
          const userProfileData = userProfileSnapshot.val();

          setUserProfile(userProfileData);
        } catch (error) {
          console.error("Error retrieving user profile:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth.currentUser]);

  return (
    <>
      <NavBar goToBack={"Go to back"} />
      <div className="dashboard">
        <div className="dashboardContainer">
          {!auth.currentUser && !loading && (
            <h3 className="alert-signIn">
              Welcome ! To access your profile, please sign in
            </h3>
          )}

          <div className="user-profile">
            {!loading ? (
              userProfile ? (
                <div className="userProfile-container">
                  <h1>Welcome, {userProfile.displayName}!</h1>
                  <div className="feedbacks-container">
                    <h3>Your Feedbacks:</h3>
                    <p>
                      Likes: 👍
                      <span>{userProfile.feedback.likes || 0}</span>
                    </p>
                    <p>
                      Dislikes: 👎
                      <span>{userProfile.feedback.dislikes || 0}</span>
                    </p>
                  </div>
                </div>
              ) : (
                ""
              )
            ) : (
              <div className="user-profileLoading">
                <PropagateLoader color="#ff5500" size={30} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default Dashboard;
