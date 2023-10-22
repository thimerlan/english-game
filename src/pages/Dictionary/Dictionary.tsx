import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { BsFillPlayFill } from "react-icons/bs";
import { BiSolidBookBookmark, BiSolidBookmark } from "react-icons/bi";
import axios from "axios";
import "./dictionary.scss";
import { useNavigate } from "react-router-dom";
import useFavoriteWords from "../../hooks/useFavoriteWords/useFavoriteWords";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import AlertSignIn from "../../components/Alert/AlertSignIn";
import { ClipLoader } from "react-spinners";

type typeErrorMessage = {
  message: string;
  resolution: string;
  title: string;
};

const Dictionary = () => {
  const { favoriteWords, setFavoriteWords, loadingFavoriteWords } =
    useFavoriteWords();
  const [showAlert, setShowAlert] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dictionaryData, setdictionaryData] = useState<IDictionaryData | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<typeErrorMessage | null>();
  const dictionaryContainerRef = useRef<HTMLDivElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [rerunSearch, setRerunSearch] = useState<boolean>(false);
  const [openFavorites, setOpenFavorites] = useState<boolean>(false);
  const [searchFavoriteWord, setSearchFavoriteWord] = useState<string>("");
  const navigate = useNavigate();
  const [user] = useAuthState(auth); // GET USER INFO

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (searchTerm) {
      try {
        const response = await axios.get(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${searchTerm}`
        );

        setdictionaryData(response.data[0]);
        setErrorMessage(null);
      } catch (error: any) {
        setdictionaryData(null);
        setErrorMessage(error.response.data);
      }
    }
  };

  const playAudio = (audioSrc: string) => {
    const audio = new Audio(audioSrc);
    audio.play();
  };

  useEffect(() => {
    if (dictionaryContainerRef.current && submitButtonRef) {
      dictionaryContainerRef.current.scrollTop = 0;
      submitButtonRef.current?.click();
    }
    setSearchFavoriteWord("");
  }, [rerunSearch]);
  const filteredFavoriteWord = useCallback(() => {
    return favoriteWords.filter((fw) =>
      fw.toLocaleLowerCase().includes(searchFavoriteWord.toLocaleLowerCase())
    );
  }, [searchFavoriteWord, favoriteWords]);

  const addFavoriteVocabularyWordToUserDataBase = async (
    userId: string,
    updatedFavoriteWords: string[]
  ) => {
    if (!userId) {
      console.error("User ID is missing or undefined.");
      return;
    }

    const userFavoriteVocabularyCollectionRef = doc(
      db,
      `users/${userId}/favoriteVocabulary/words`
    );

    try {
      await setDoc(
        userFavoriteVocabularyCollectionRef,
        { favoriteWords: updatedFavoriteWords },
        {
          merge: true,
        }
      );
      console.log("Vocabulary word updeted successfully!");
    } catch (error) {
      console.error("Error adding vocabulary word:", error);
    }
  };

  const addToFavoriteWords = (word: string): void => {
    if (user)
      setFavoriteWords((prevFavotireWords) => {
        const updatedFavoriteWords = [...prevFavotireWords, word];
        addFavoriteVocabularyWordToUserDataBase(
          user?.uid,
          updatedFavoriteWords
        );
        return updatedFavoriteWords;
      });
  };

  const removeFromFavoriteWords = (word: string): void => {
    if (user)
      setFavoriteWords((prevFavoriteWords) => {
        const updatedFavoriteWords = prevFavoriteWords.filter(
          (favoriteWord) => favoriteWord !== word
        );
        addFavoriteVocabularyWordToUserDataBase(
          user?.uid,
          updatedFavoriteWords
        );
        return updatedFavoriteWords;
      });
  };

  return (
    <div className="dictionary">
      <div className="showFavorites-button">
        <button onClick={() => setOpenFavorites((prev) => !prev)}>
          <BiSolidBookBookmark />
          <span style={{ padding: loadingFavoriteWords ? "0px" : "1.5px" }}>
            {loadingFavoriteWords
              ? user && <ClipLoader color="red" size={12} />
              : favoriteWords.length}
          </span>
        </button>
      </div>
      <div
        className={openFavorites ? "favoriteWords-show" : "favoriteWords-hide"}
      >
        <button
          onClick={() => {
            setOpenFavorites((prev) => !prev);
            setSearchFavoriteWord("");
          }}
        >
          &#10008;
        </button>
        {favoriteWords.length !== 0 && (
          <input
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchFavoriteWord(e.target.value)
            }
            value={searchFavoriteWord}
            type="text"
            placeholder="search word:"
          />
        )}
        <ul>
          {filteredFavoriteWord().length > 0
            ? filteredFavoriteWord().map((w) => (
                <li
                  key={w}
                  onClick={() => {
                    {
                      setOpenFavorites((prev) => !prev);
                      setSearchTerm(w);
                      setRerunSearch((prev) => !prev);
                    }
                  }}
                >
                  {w}
                </li>
              ))
            : ""}
          {searchFavoriteWord && filteredFavoriteWord().length === 0 && (
            <li>No matching words found.</li>
          )}
        </ul>
        {favoriteWords.length === 0 && <p>There are no favorite words yet.</p>}
      </div>
      <div
        ref={dictionaryContainerRef}
        style={{ height: dictionaryData || errorMessage ? "" : "110px" }}
        className={"dictionary-container"}
      >
        <h1>Dictionary </h1>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Enter a word"
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          />
          <button
            disabled={searchTerm ? false : true}
            ref={submitButtonRef}
            type="submit"
          >
            Search
          </button>
        </form>
        {dictionaryData && (
          <div className="dictionary-content">
            <h2>
              {dictionaryData.word}
              <button
                title={
                  favoriteWords.find((fw) => fw === dictionaryData.word)
                    ? "Remove from favorite words"
                    : "Add to favorite words"
                }
                className="addTofavorites"
                onClick={() => {
                  if (user) {
                    if (
                      favoriteWords.find((fw) => fw === dictionaryData.word)
                    ) {
                      removeFromFavoriteWords(dictionaryData.word);
                    } else {
                      addToFavoriteWords(dictionaryData.word);
                    }
                  } else {
                    setShowAlert(true);
                  }
                }}
              >
                {user ? (
                  favoriteWords.find((fw) => fw === dictionaryData.word) ? (
                    <BiSolidBookmark color="#ff0a0a" size={25} />
                  ) : (
                    <BiSolidBookmark color="#ff5100" size={25} />
                  )
                ) : (
                  <BiSolidBookmark color="gray" size={25} />
                )}
              </button>
            </h2>
            {showAlert && !auth.currentUser && (
              <AlertSignIn onClose={(): void => setShowAlert(false)} />
            )}
            <span>{!dictionaryData.phonetics && dictionaryData.phonetic}</span>
            <div className="phonetics">
              <ul>
                {dictionaryData.phonetics?.map((phonetic) => (
                  <li key={phonetic?.sourceUrl}>
                    {phonetic?.text}
                    <button
                      title={phonetic.audio ? "" : "Audio is not available"}
                      disabled={phonetic.audio ? false : true}
                      onClick={() => playAudio(phonetic.audio)}
                    >
                      <BsFillPlayFill size={21} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {dictionaryData.meanings && (
              <div className="meanings">
                <h3>Definitions:</h3>
                <ul>
                  {dictionaryData.meanings.map((meaning, index) => (
                    <li key={index}>
                      <strong>{meaning.partOfSpeech}</strong>:
                      {meaning.definitions.map((definition) => (
                        <div
                          key={definition.definition}
                          className="definitions"
                        >
                          <p className="definition">{definition.definition}</p>
                          <p>
                            Example:
                            <span>
                              {definition.example ? definition.example : "none"}
                            </span>
                          </p>
                        </div>
                      ))}
                      {meaning.synonyms?.length
                        ? "Synonyms:"
                        : "Synonyms: none"}
                      {Array.from(new Set(meaning.synonyms)).map((synonym) => (
                        <div key={synonym} className="synonyms">
                          <span
                            onClick={() => {
                              {
                                setSearchTerm(synonym);
                                setRerunSearch((prev) => !prev);
                              }
                            }}
                          >
                            {synonym}
                          </span>
                        </div>
                      ))}
                      <br />
                      {meaning.antonyms?.length
                        ? "Antonyms:"
                        : "Antonyms: none"}
                      {Array.from(new Set(meaning.antonyms)).map((antonym) => (
                        <div key={antonym} className="antonyms">
                          <span
                            onClick={() => {
                              {
                                setSearchTerm(antonym);
                                setRerunSearch((prev) => !prev);
                              }
                            }}
                          >
                            {antonym}
                          </span>
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {errorMessage && (
          <div className="errorMessage-content">
            <h2>{errorMessage.title} 😢</h2>
            <p>{errorMessage.message}</p>
          </div>
        )}
      </div>
      <button
        className="goToBack"
        onClick={() => {
          navigate(-1);
        }}
      >
        Go to back
      </button>
    </div>
  );
};

export default Dictionary;
