import { useEffect, useRef, useState } from "react";
import { auth, dbChat } from "../../firebaseConfig";
import { ref, onChildAdded } from "firebase/database";
import useAudio from "../../hooks/useAudio/useAudio";

import "./Chat.scss";

interface ChatListProps {
  chatRoomId: string;
}

const ChatList = ({ chatRoomId }: ChatListProps) => {
  const [messages, setMessages] = useState<Messages[]>([]);
  const chatListRef = useRef<HTMLDivElement>(null);

  const { play: playReceiveMessageSound } = useAudio("/havingMessageSound.mp3");

  useEffect(() => {
    const messagesRef = ref(dbChat, `chatRooms/${chatRoomId}`);

    const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
      const newMessage = snapshot.val();

      if (chatRoomId.length) {
        playReceiveMessageSound();
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [chatRoomId]);

  const scrollToBottom = () => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  return (
    <div className="chat-list" ref={chatListRef}>
      <div className="chat-message">
        {messages?.map((message) => (
          <p
            key={message.id}
            className={
              auth?.currentUser?.uid === message.uid
                ? "myMessage"
                : "theirMessage"
            }
          >
            {message.message}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
