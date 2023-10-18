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
  uid: string;
  displayName: string;
  status: string;
  feedback: feedback;
}
interface IQuittedUser {
  uid: string;
  username: string;
}
interface ICallRequest {
  chatRoomId: string;
  recipient: string;
  sender: string;
  senderName: string;
  status: string;
}
interface Emoji {
  slug: string;
  character: string;
  unicodeName: string;
  codePoint: string;
  group: string;
  subGroup: string;
}
