import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig"; // Update the path to your firebase config

const useFavoriteWords = () => {
  const [favoriteWords, setFavoriteWords] = useState<string[]>([]);
  const [loadingFavoriteWords, setLoadingFavoriteWords] =
    useState<boolean>(true);
  const user = auth.currentUser;
  useEffect(() => {
    if (user) {
      const userFavoriteVocabularyCollectionRef = doc(
        db,
        `users/${user.uid}/favoriteVocabulary/words`
      );

      const unsubscribe = onSnapshot(
        userFavoriteVocabularyCollectionRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setLoadingFavoriteWords(false);

            setFavoriteWords(data.favoriteWords || []);
          }
        }
      );

      return () => {
        unsubscribe();
      };
    } else {
    }
  }, [user]);

  return {
    favoriteWords,
    setFavoriteWords,
    loadingFavoriteWords,
  };
};

export default useFavoriteWords;
