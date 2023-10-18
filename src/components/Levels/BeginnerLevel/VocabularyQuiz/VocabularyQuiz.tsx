import { Link } from "react-router-dom";
import NavBar from "../../../NavBar/NavBar";
import { useState, useEffect } from "react";
import "./VocabularyQuiz.scss";
const VocabularyQuiz = () => {
  const [testNumbers, setTestNumbers] = useState<number[]>();

  useEffect(() => {
    const numbersQuiz: number[] = [];
    for (let i = 1; i <= 5; i++) {
      numbersQuiz?.push(i);
    }
    setTestNumbers(numbersQuiz);
  }, []);

  return (
    <>
      <NavBar />
      <div className="vocabularyQuiz">
        <div className="vocabularyQuiz-about">
          <h2>Welcome to Vocabulary Quiz!</h2>
          <p>
            The Vocabulary Quiz at the A1-level is designed to test your
            knowledge of basic vocabulary words. Each quiz includes 10 or 20
            mini questions. For each correct answer, you will earn 1 coin.
          </p>
          <br />
          <p>
            Your goal is to improve your vocabulary skills and score well in the
            quiz. Use your knowledge and understanding of A1-level vocabulary to
            answer the questions correctly and make progress in the game
          </p>
        </div>
        <div className="vocabularyQuiz-tests">
          <h3>Here are 5 tests</h3>
          <div className="testNumbers">
            {testNumbers &&
              testNumbers.map((num) => {
                return (
                  <span key={num} className="circle">
                    <Link to={`/level/beginner/vocabulary-quiz/${num}`}>
                      {num}
                    </Link>
                  </span>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
};
export default VocabularyQuiz;
