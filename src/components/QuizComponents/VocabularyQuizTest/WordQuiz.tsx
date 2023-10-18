import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SyncLoader } from "react-spinners";
import useVocabularyQuizData from "../../../hooks/useVocabularyQuizData/useVocabularyQuizData";
import useCoins from "../../../hooks/useCoins/useCoins";
import coinImage from "../../../assets/coin.svg";
import "./WordQuiz.scss";
type selectWord = {
  lw: string;
  rw: string;
};
const WordQuiz = () => {
  const navigate = useNavigate();
  const { quizQuestions, setQuizQuestions, isLoading, errorMessage } =
    useVocabularyQuizData();
  const { setCoins, incrementCoins } = useCoins();
  const { quizNumber } = useParams<string>();
  const [testIndex, setTestIndex] = useState<number>(0);
  const [correctAnswerCount, setCorrectAnswerCount] = useState<number>(0);
  const [isCorrectAnswerStyle, setIsCorrectAnswerStyle] = useState<
    boolean | null
  >(null);
  const [selectWord, setSelectWord] = useState<selectWord>({
    lw: "",
    rw: "",
  });

  const [counterIncorrectAnswers, setCounterIncorrectAnswers] = useState(0);

  const getQuizQuestions = quizQuestions?.filter((quizItem) => {
    if (Number(quizItem.id) === Number(quizNumber)) {
      return quizItem.questions;
    }
  });
  const singleQuizQuestion = getQuizQuestions[0]?.questions[testIndex];
  const handleAnswerSelection = (
    correctAnswerIndex: number,
    variantIndex: number
  ): void => {
    setTestIndex((prev) => prev + 1);
    if (correctAnswerIndex === variantIndex) {
      incrementCoins();
      setCorrectAnswerCount((prev) => prev + 1);
    }
  };

  const getCorrectAnswer = useCallback((): boolean => {
    if (singleQuizQuestion && selectWord.lw && selectWord.rw) {
      return (
        singleQuizQuestion.correctAnswers.filter((answer) => {
          return (
            answer.includes(selectWord.lw) && answer.includes(selectWord.rw)
          );
        }).length > 0
      );
    }
    return false;
  }, [selectWord]);

  useEffect(() => {
    if (getCorrectAnswer()) {
      setIsCorrectAnswerStyle(false);

      setTimeout(() => {
        handleCorrectAnswer();
        setIsCorrectAnswerStyle(null);
        setSelectWord({ lw: "", rw: "" });
      }, 500);
    }
    if (selectWord.rw && selectWord.lw && !getCorrectAnswer()) {
      setIsCorrectAnswerStyle(true);
      setTimeout(() => {
        setSelectWord({ lw: "", rw: "" });
        setIsCorrectAnswerStyle(null);
      }, 500);
    }

    if (selectWord.rw && selectWord.lw) {
      if (!getCorrectAnswer()) {
        setCounterIncorrectAnswers((prev) => prev + 1);
      } else {
        setCorrectAnswerCount((prev) => prev + 1 - counterIncorrectAnswers);
        setCounterIncorrectAnswers(0);
      }
    }
    if (!singleQuizQuestion) setCoins((prev) => prev + correctAnswerCount);
  }, [getCorrectAnswer]);

  const handleCorrectAnswer = (): void => {
    const updatedQuestions = getQuizQuestions[0]?.questions.map(
      (question, index) => {
        if (index === testIndex) {
          const updatedQuestion = {
            ...question,
            leftVariants: question.leftVariants.filter(
              (variant) => variant !== selectWord.lw
            ),
            rightVariants: question.rightVariants.filter(
              (variant) => variant !== selectWord.rw
            ),
          };

          if (updatedQuestion.leftVariants.length === 0) {
            setTestIndex((prev) => prev + 1);
          }

          return updatedQuestion;
        }

        return question;
      }
    );

    setQuizQuestions([
      {
        ...getQuizQuestions[0],
        questions: updatedQuestions,
      },
    ]);
  };

  const getRightWordClassName = (rw: string): string => {
    if (selectWord.rw === rw && isCorrectAnswerStyle) {
      return "inCorrectAnswerAnimation";
    } else if (selectWord.lw && selectWord.rw === rw && !isCorrectAnswerStyle) {
      return "correctAnswerAnimation";
    } else {
      return "";
    }
  };

  const getLeftWordClassName = (lw: string): string => {
    if (selectWord.lw === lw && isCorrectAnswerStyle) {
      return "inCorrectAnswerAnimation";
    } else if (selectWord.rw && selectWord.lw === lw && !isCorrectAnswerStyle) {
      return "correctAnswerAnimation";
    } else {
      return "";
    }
  };

  const Procentage = Math.round(
    (testIndex / getQuizQuestions[0]?.questions.length) * 100
  );

  return (
    <div className="Quiz">
      <div className="quiz-container">
        <div className="progress-test">
          <div
            className="progress-bar"
            style={{ width: Procentage ? Procentage + "%" : "0%" }}
          ></div>
        </div>
        <h2>Vocabulary Quiz #{quizNumber}</h2>
        {isLoading ? (
          <div className="isLoading">
            <SyncLoader color="#088d8d" size={22} />
          </div>
        ) : singleQuizQuestion ? (
          <>
            <h3>{singleQuizQuestion?.question}</h3>
            {singleQuizQuestion.correctAnswers && (
              <div className="wordMatches-quiz">
                <ul>
                  {singleQuizQuestion?.leftVariants?.map((lw) => (
                    <li
                      style={{
                        background: lw === selectWord.lw ? "#1151f1f8" : "",
                      }}
                      className={getLeftWordClassName(lw)}
                      onClick={() => {
                        setSelectWord((prev) => {
                          return {
                            ...prev,
                            lw: lw,
                          };
                        });
                      }}
                      key={lw}
                    >
                      {lw}
                    </li>
                  ))}
                </ul>
                <ul>
                  {singleQuizQuestion?.rightVariants?.map((rw) => (
                    <li
                      style={{
                        background: rw === selectWord.rw ? "#1194f1f8" : "",
                      }}
                      className={getRightWordClassName(rw)}
                      onClick={() => {
                        setSelectWord((prev) => {
                          return {
                            ...prev,
                            rw: rw,
                          };
                        });
                      }}
                      key={rw}
                    >
                      {rw}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="simpleWord-quiz">
              <ul>
                {singleQuizQuestion?.variants?.map((variant, index) => (
                  <li
                    key={index}
                    onClick={() =>
                      handleAnswerSelection(singleQuizQuestion.correct, index)
                    }
                  >
                    {variant}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : correctAnswerCount > 1 ? (
          <div className="quiz-completed">
            <h4> 🎉 Congratulations 🎉 </h4>
            <p>
              You answered correctly {correctAnswerCount} out of
              {getQuizQuestions[0].questions[0].correctAnswers
                ? 20
                : getQuizQuestions[0]?.questions.length}
            </p>
            <span>
              🎊You got {correctAnswerCount}
              <img src={coinImage} width={21} alt="coin" /> Coins🎊
            </span>
            <p>Keep moving forward!!!</p>
            <button onClick={() => navigate(-1)}>Go to back</button>
          </div>
        ) : (
          <div className="quiz-completed">
            <h4> 🎉 Congratulations 🎉 </h4>
            <p>
              You answered correctly {correctAnswerCount} out of
              {getQuizQuestions[0].questions[0].correctAnswers
                ? 20
                : getQuizQuestions[0]?.questions.length}
            </p>
            <span>
              🎊You got {correctAnswerCount}
              <img src={coinImage} width={21} alt="coin" /> Coins🎊
            </span>
            <p>Keep it up! You can do better next time!</p>
            <button onClick={() => navigate(-1)}>Go to back</button>
          </div>
        )}
        {errorMessage && (
          <div className="ErrorMessage">
            <h3>{errorMessage}</h3>
          </div>
        )}
      </div>
      {singleQuizQuestion && (
        <button className="GoToBackButton" onClick={() => navigate(-1)}>
          Go to back
        </button>
      )}
    </div>
  );
};

export default WordQuiz;
