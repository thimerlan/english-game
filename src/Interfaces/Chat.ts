interface Messages {
  uid: string | undefined;
  id: string;
  message: string;
}
interface feedback {
  likes: number;
  dislikes: number;
}
interface IUserProfiles {
  displayName: string;
  age: string;
  gender: "female" | "male" | "";
  englishLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "";
  photo: string;
  uid: string;
  status: string;
  feedback: feedback;
}
interface IChattingUserInfo {
  uid: string;
  username: string;
}
interface IUserInfo {
  username: string;
  userphoto: string;
}
interface ICallRequest {
  sender: string;
  senderName: string;
  senderPhoto: string;
  recipient: string;
  status: string;
  chatRoomId: string;
}
interface IPendingCallRequestInfo {
  senderName: string;
  senderPhoto: string;
  status: string;
  key: string;
}
interface Emoji {
  slug: string;
  character: string;
  unicodeName: string;
  codePoint: string;
  group: string;
  subGroup: string;
}
