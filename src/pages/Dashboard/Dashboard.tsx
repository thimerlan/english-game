// import useCoins from "../../hooks/useCoins/useCoins";
// import coin from "../../assets/coin.svg";
//   const { coins } = useCoins();
import { ChangeEvent, useEffect, useState } from "react";
import { auth, dbChat } from "../../firebaseConfig";
import { get, ref, update } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { PropagateLoader } from "react-spinners";
import { FcEditImage, FcImageFile } from "react-icons/fc";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import NavBar from "../../components/NavBar/NavBar";
import "./Dashboard.scss";

interface IUserProfile {
  displayName: string;
  photo: string;
  uid: string;
  status: string;
  feedback: feedback;
}
const Dashboard = () => {
  const [userProfile, setUserProfile] = useState<IUserProfile>();

  const [userProfileLoading, setUserProfileLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userNameError, setUserNameError] = useState("");
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAvatarZoomed, setIsAvatarZoomed] = useState(false);

  const userUID = auth.currentUser?.uid;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userProfileRef = ref(dbChat, `userProfiles/${userUID}`);

        try {
          const userProfileSnapshot = await get(userProfileRef);
          const userProfileData = userProfileSnapshot.val();

          setUserProfile(userProfileData);
        } catch (error) {
          console.error("Error retrieving user profile:", error);
        } finally {
          setUserProfileLoading(false);
        }
      } else {
        setUserProfileLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth.currentUser]);
  function cleanStatesForEditFeature(): void {
    setUserName("");
    setUserNameError("");
    setEditProfileModal(false);
  }
  const handleUpdateUserProfile = async (): Promise<void> => {
    if (userName.trim() === "") {
      setUserNameError("Username cannot be empty");
      return;
    }
    setUpdatingProfile(true);
    const userProfileRef = ref(dbChat, `userProfiles/${userUID}`);

    try {
      await update(userProfileRef, {
        displayName: userName,
      });
      const userProfileSnapshot = await get(userProfileRef);

      setUserProfile(userProfileSnapshot.val());
      setUpdatingProfile(false);
      cleanStatesForEditFeature();
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };
  const closeEditProfileModal = (): void => {
    cleanStatesForEditFeature();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      handleFileUpload(files[0]);
    }
  };
  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      return;
    }
    setUpdatingProfile(true);

    const storage = getStorage();
    const userPhotoRef = storageRef(storage, `${userUID}/profile-photo.jpg`);
    const userProfileRef = ref(dbChat, `userProfiles/${userUID}`);

    const uploadImage = uploadBytes(userPhotoRef, file);

    try {
      await uploadImage;

      const downloadURL = await getDownloadURL(userPhotoRef);

      await update(userProfileRef, { photo: downloadURL });

      const userProfileSnapshot = await get(userProfileRef);
      setUserProfile(userProfileSnapshot.val());

      setUpdatingProfile(false);
      setSelectedFile(null);
      cleanStatesForEditFeature();

      console.log("Photo uploaded successfully.");
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };
  return (
    <>
      <NavBar goToBack={"Go to back"} />
      <div className="dashboard">
        <div className="dashboardContainer">
          {!auth.currentUser && !userProfileLoading && (
            <h3 className="alert-signIn">
              Welcome ! To access your profile, please sign in
            </h3>
          )}

          <div className="user-profile">
            {!userProfileLoading ? (
              userProfile ? (
                <div className="userProfile-container">
                  <div className="user-photo">
                    {isAvatarZoomed ? (
                      <div className="zoomed-avatar">
                        <img
                          src={userProfile.photo}
                          alt="Zoomed user photo"
                          onClick={() => setIsAvatarZoomed(false)}
                        />
                      </div>
                    ) : (
                      <img
                        src={userProfile.photo}
                        alt="User photo"
                        onClick={() => setIsAvatarZoomed(true)}
                      />
                    )}
                  </div>
                  <h1>Welcome, {userProfile.displayName}!</h1>
                  <div className="editProfile">
                    <button
                      onClick={() => setEditProfileModal(true)}
                      className="editProfile-btn"
                    >
                      edit profile ✏️
                    </button>
                    <div
                      className={
                        editProfileModal
                          ? "editProfile-container-active "
                          : " editProfile-container-inactive"
                      }
                    >
                      <div className="editProfile-content">
                        <button
                          className="close-editProfile-modal"
                          onClick={closeEditProfileModal}
                        >
                          &#10008;
                        </button>
                        <input
                          disabled={updatingProfile}
                          type="text"
                          placeholder="New name:"
                          maxLength={20}
                          value={userName}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setUserName(e.target.value)
                          }
                        />
                        {userName.length >= 20 && (
                          <p className="error-message">
                            Maximum character limit reached.
                          </p>
                        )}
                        {userNameError && (
                          <p className="error-message">{userNameError}!</p>
                        )}
                        <input
                          id="fileInput"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={
                            selectedFile || updatingProfile ? true : false
                          }
                        />
                        <label
                          htmlFor="fileInput"
                          className="custom-file-label"
                          title={
                            selectedFile
                              ? "Updating a new photo..."
                              : "Choose a new photo"
                          }
                        >
                          {selectedFile ? (
                            <>
                              {selectedFile.name}
                              <span>
                                <FcImageFile />
                              </span>
                            </>
                          ) : (
                            <FcEditImage size={28} />
                          )}
                        </label>

                        {updatingProfile && (
                          <p className="updatingProfile-message">
                            Updating your profile...
                          </p>
                        )}
                        <button
                          className="update-userProfile-btn"
                          onClick={handleUpdateUserProfile}
                          disabled={
                            !selectedFile && userName.length > 0 ? false : true
                          }
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
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
