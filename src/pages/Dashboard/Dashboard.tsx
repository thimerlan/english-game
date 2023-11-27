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
  age: string;
  photo: string;
  uid: string;
  status: string;
  feedback: feedback;
}
interface IUserProfileData {
  userName: string;
  userAge: string;
}
const Dashboard = () => {
  const [userProfile, setUserProfile] = useState<IUserProfile>();

  const [userProfileLoading, setUserProfileLoading] = useState(true);
  const [userProfileData, setUserProfileData] = useState<IUserProfileData>({
    userName: "",
    userAge: "",
  });
  const [errorMessages, setErrorMessages] = useState<IUserProfileData>({
    userName: "",
    userAge: "",
  });

  const [editProfileModal, setEditProfileModal] = useState(false);
  const [updatingProfileLoading, setUpdatingProfileLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAvatarZoomed, setIsAvatarZoomed] = useState(false);

  const userUID = auth.currentUser?.uid;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userProfileRef = ref(dbChat, `userProfiles/${userUID}`);

        try {
          const userProfileSnapshot = await get(userProfileRef);
          const userProfileDatas = userProfileSnapshot.val();

          setUserProfile(userProfileDatas);
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

  function resetEditProfileAndModalStates(): void {
    setUserProfileData({ userName: "", userAge: "" });
    setErrorMessages({ userName: "", userAge: "" });
    setEditProfileModal(false);
  }
  function closeEditProfileModal(): void {
    resetEditProfileAndModalStates();
  }
  const handleUpdateUserDate = (e: ChangeEvent<HTMLInputElement>): void => {
    const { value, name } = e.target;
    setUserProfileData((prevValues) => ({
      ...prevValues,
      [e.target.name]: e.target.value,
    }));
    if (name === "userName") {
      setErrorMessages((prevErrorMessages) => ({
        ...prevErrorMessages,
        userName:
          value && value.trim() === "" ? "Username cannot be empty" : "",
      }));
    }

    if (name === "userAge") {
      const ageNumber = Number(value);
      setErrorMessages((prevErrorMessages) => ({
        ...prevErrorMessages,
        userAge:
          ageNumber > 100 || (ageNumber < 8 && value.length > 0)
            ? "Age must be between 8 and 100"
            : "",
      }));
    }
  };

  const handleUpdateUserProfile = async (): Promise<void> => {
    const { userName, userAge } = userProfileData;

    setUpdatingProfileLoading(true);

    const userProfileRef = ref(dbChat, `userProfiles/${userUID}`);

    try {
      await update(userProfileRef, {
        displayName: userName.trim() || userProfile?.displayName,
        age: userAge || userProfile?.age,
      });

      const userProfileSnapshot = await get(userProfileRef);

      setUserProfile(userProfileSnapshot.val());
      setUpdatingProfileLoading(false);
      closeEditProfileModal();
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
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
    setUpdatingProfileLoading(true);

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

      setUpdatingProfileLoading(false);
      setSelectedFile(null);
      resetEditProfileAndModalStates();

      console.log("Photo uploaded successfully.");
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };

  const isDisableUpdateButton = (): boolean => {
    const { userName, userAge } = userProfileData;
    const trimmedUserName = userName.trim();
    const numericAge = Number(userAge);
    const isNameEmpty = trimmedUserName === "";
    const isAgeInvalid = numericAge < 7 || numericAge > 100;

    if (selectedFile) return true;

    if (!isNameEmpty && errorMessages.userAge.length === 0) return false;

    if (userName.length > 0 && isAgeInvalid) return true;

    if (userName.length && isNameEmpty && !isAgeInvalid) return true;

    if (!isAgeInvalid) {
      return false;
    } else {
      return true;
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
                  <div className="user__data">
                    <p>
                      name: <span>{userProfile.displayName}</span>
                    </p>
                    <p>
                      age:
                      <span>{userProfile.age ? userProfile.age : "-"}</span>
                    </p>
                  </div>
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
                          disabled={updatingProfileLoading}
                          type="text"
                          name="userName"
                          placeholder="New name:"
                          autoComplete="off"
                          maxLength={18}
                          value={userProfileData.userName}
                          onChange={handleUpdateUserDate}
                        />

                        {userProfileData.userName.length === 18 && (
                          <p className="error-message">
                            Maximum character limit reached.
                          </p>
                        )}
                        {errorMessages.userName && (
                          <p className="error-message">
                            {errorMessages.userName}!
                          </p>
                        )}

                        <input
                          disabled={updatingProfileLoading}
                          type="number"
                          minLength={1}
                          maxLength={3}
                          min="8"
                          max="100"
                          name="userAge"
                          placeholder="New age:"
                          autoComplete="off"
                          value={userProfileData.userAge}
                          onChange={handleUpdateUserDate}
                        />

                        {errorMessages.userAge && (
                          <p className="error-message">
                            {errorMessages.userAge}!
                          </p>
                        )}
                        <input
                          id="fileInput"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={
                            selectedFile || updatingProfileLoading
                              ? true
                              : false
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

                        {updatingProfileLoading && (
                          <p className="updatingProfile-message">
                            Updating your profile...
                          </p>
                        )}
                        <button
                          className="update-userProfile-btn"
                          onClick={handleUpdateUserProfile}
                          disabled={isDisableUpdateButton()}
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
