interface Messages {
  uid: string | undefined;
  id: string;
  message: string;
}
interface IFeedbackDetail {
  userId: string;
  userName: string;
  userPhoto: string;
  feedbackType: string;
  comment?: string;
}

interface IFeedback {
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
  feedback: IFeedback;
  detailedFeedback?: { [key: string]: IFeedbackDetail };
}
interface IChattingUserInfo {
  userId: string;
  userName: string;
}
interface IUserInfo {
  username: string;
  userphoto: string;
  autoCancelTimer: number;
  callRequestKey: string;
}
interface ICallRequest {
  sender: string;
  senderName: string;
  senderPhoto: string;
  recipient: string;
  status: string;
  chatRoomId: string;
  autoCancelTimer: number;
  senderIsTyping: boolean;
  recipientIsTyping: boolean;
}
interface IPendingCallRequestInfo {
  senderName: string;
  senderPhoto: string;
  autoCancelTimer: number;
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
interface IFilterUsersByLevel {
  from: string;
  to: string;
}
