// import useCoins from "../../hooks/useCoins/useCoins";
// import coin from "../../assets/coin.svg";
//   const { coins } = useCoins();
import { ChangeEvent, useEffect, useState } from "react";
import { auth, dbChat } from "../../firebaseConfig";
import { get, ref, update } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { PropagateLoader } from "react-spinners";
import { FcEditImage, FcImageFile } from "react-icons/fc";
import { CgGenderMale, CgGenderFemale } from "react-icons/cg";

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
  gender: TypeGender;
  photo: string;
  uid: string;
  status: string;
  feedback: feedback;
}
interface IUserProfileData {
  userName: string;
  userAge: string;
  userGender: string;
}

interface IUserProfileDataErros extends Omit<IUserProfileData, "userGender"> {}

type TypeGender = "female" | "male" | "";

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState<IUserProfile>();

  const [userProfileLoading, setUserProfileLoading] = useState(true);
  const [userProfileData, setUserProfileData] = useState<IUserProfileData>({
    userName: "",
    userAge: "",
    userGender: "",
  });
  const [errorMessages, setErrorMessages] = useState<IUserProfileDataErros>({
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
    setUserProfileData({ userName: "", userAge: "", userGender: "" });
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

  const handleGenderSelection = (gender: TypeGender): void => {
    setUserProfileData((prevData) => ({
      ...prevData,
      userGender: gender,
    }));
  };

  const handleUpdateUserProfile = async (): Promise<void> => {
    const { userName, userAge, userGender } = userProfileData;

    setUpdatingProfileLoading(true);

    const userProfileRef = ref(dbChat, `userProfiles/${userUID}`);

    try {
      await update(userProfileRef, {
        displayName: userName.trim() || userProfile?.displayName,
        age: userAge || userProfile?.age || "",
        gender: userGender || userProfile?.gender || "",
      });

      const userProfileSnapshot = await get(userProfileRef);

      setUserProfile(userProfileSnapshot.val());
      setUpdatingProfileLoading(false);
      closeEditProfileModal();
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      handleFileUpload(files[0]);
    }
  };
  const handleFileUpload = async (file: File | null): Promise<void> => {
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
    const { userName, userAge, userGender } = userProfileData;
    const trimmedUserName = userName.trim();
    const numericAge = Number(userAge);
    const isNameEmpty = trimmedUserName === "";
    const isAgeInvalid = numericAge < 8 || numericAge > 100;

    if (selectedFile) return true;

    if (!isNameEmpty && errorMessages.userAge.length === 0) return false;

    if (userName.length > 0 && isAgeInvalid) return true;

    if (userName.length && isNameEmpty && !isAgeInvalid) return true;

    if (userGender && errorMessages.userAge) return true;

    if (userGender) return false;

    if (userGender && !isNameEmpty && errorMessages.userAge.length === 0)
      return false;

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
                    <p>
                      gender:
                      <span>
                        {userProfile.gender === "male" ? (
                          <i title="Male" className="g-ma">
                            <CgGenderMale />
                          </i>
                        ) : userProfile.gender === "female" ? (
                          <i title="Female" className="g-fe">
                            <CgGenderFemale />
                          </i>
                        ) : (
                          "-"
                        )}
                      </span>
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
                          disabled={updatingProfileLoading}
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
                        <div className="selectionGender">
                          <p>Select a new gender:</p>
                          <button
                            disabled={updatingProfileLoading}
                            className={
                              userProfileData.userGender === "female"
                                ? "selected-gender"
                                : ""
                            }
                            onClick={() =>
                              userProfileData.userGender === "female"
                                ? handleGenderSelection("")
                                : handleGenderSelection("female")
                            }
                          >
                            Female
                            <span className="g-fe">
                              <CgGenderFemale />
                            </span>
                          </button>
                          <button
                            disabled={updatingProfileLoading}
                            className={
                              userProfileData.userGender === "male"
                                ? "selected-gender"
                                : ""
                            }
                            onClick={() =>
                              userProfileData.userGender === "male"
                                ? handleGenderSelection("")
                                : handleGenderSelection("male")
                            }
                          >
                            Male
                            <span className="g-ma">
                              <CgGenderMale />
                            </span>
                          </button>
                        </div>
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
