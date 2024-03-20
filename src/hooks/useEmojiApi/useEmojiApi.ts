import axios from "axios";
import { useEffect, useState } from "react";

const useEmojiAPI = () => {
  const [emojis, setEmojis] = useState<Emoji[]>();
  const [loadingEmojis, setLoadingEmojis] = useState(true);

  useEffect(() => {
    const isMobileDevice = () => {
      return /Mobi|Android/i.test(navigator.userAgent);
    };

    const fetchEmojis = async () => {
      try {
        if (isMobileDevice()) {
          setLoadingEmojis(false);
          return;
        }

        const response = await axios.get<Emoji[]>(
          "https://emoji-api.com/emojis?access_key=d919239a0302dbe84fd9d72b692602bc26588c9d"
        );

        if (response.status !== 200) {
          throw new Error("Failed to fetch emojis");
        }

        const data = response.data;
        setEmojis(data);
        setLoadingEmojis(false);
      } catch (error) {
        console.error("Error fetching emojis:", error);
        setLoadingEmojis(false);
      }
    };

    fetchEmojis();
  }, []);

  return { emojis, loadingEmojis };
};

export default useEmojiAPI;
