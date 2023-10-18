import NavBar from "../../NavBar/NavBar";
import "./BeginnerLevel.scss";
import TestCard from "./TestCard";
const BeginnerLevel = () => {
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };
  return (
    <>
      <NavBar />
      <section className="beginnerLevel">
        <div className="beginnerLevel-content">
          <h2>Welcome to the Beginner Level!</h2>
          <p>
            The Beginner Level is designed for users who are new to the subject.
            Here, you can start building your foundational knowledge and skills.
          </p>
          <br />
          <p>
            To progress to the Elementary Level, we recommend taking tests in
            the Beginner Level and achieving a minimum score of X%. These tests
            will assess your understanding and readiness to move on to the next
            level.
          </p>
          <br />
          <p>
            By completing tests in the Beginner Level and achieving a solid
            understanding of the concepts, you'll be well-prepared to tackle the
            challenges in the Elementary Level.
          </p>
          <br />
          <p>
            In addition, as you progress through the Beginner Level and
            successfully complete tests, you'll collect coins. These coins can
            be used to buy exciting gifts and rewards. Keep up the good work and
            keep collecting those coins!
          </p>
          <br />
          <p>Good luck on your learning journey!</p>
          <div className="bottom-arrow">
            <button onClick={scrollToBottom}>&#11015;</button>
          </div>
        </div>
        <div className="testCards">
          <TestCard
            title="Basic Vocabulary Quiz"
            link="/level/beginner/vocabulary-quiz"
          />
          <TestCard
            title="Grammar Essentials Test"
            link="/level/beginner/soon"
          />
          <TestCard
            title="Reading Comprehension Practice"
            link="/level/beginner/soon"
          />
          <TestCard
            title="Writing Skills Assessment"
            link="/level/beginner/soon"
          />
          <TestCard
            title="Listening Comprehension Exercise"
            link="/level/beginner/soon"
          />
        </div>
      </section>
    </>
  );
};
export default BeginnerLevel;
