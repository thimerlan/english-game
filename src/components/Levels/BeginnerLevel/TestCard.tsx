import { Link } from "react-router-dom";

interface ITestCard {
  title: string;
  link: string;
}

const TestCard = ({ title, link }: ITestCard) => {
  const handleStartTest = () => {
    // Add logic to handle starting the test
  };
  let testCardContent;

  if (title === "Basic Vocabulary Quiz") {
    testCardContent = (
      <p>This quiz assesses your knowledge of basic vocabulary in English.</p>
    );
  } else if (title === "Grammar Essentials Test") {
    testCardContent = (
      <p>
        This test evaluates your understanding of grammar essentials in English.
      </p>
    );
  } else if (title === "Reading Comprehension Practice") {
    testCardContent = (
      <p>
        This practice test focuses on improving your reading comprehension
        skills in English.
      </p>
    );
  } else if (title === "Writing Skills Assessment") {
    testCardContent = (
      <p>This assessment evaluates your writing skills in English.</p>
    );
  } else if (title === "Listening Comprehension Exercise") {
    testCardContent = (
      <p>
        This exercise aims to enhance your listening comprehension in English.
      </p>
    );
  }
  return (
    <div className="testCard">
      <h3>{title}</h3>
      {testCardContent}
      <div className="testCardButtons">
        <button onClick={handleStartTest}>
          <Link to={link}>Start Test</Link>
        </button>
      </div>
    </div>
  );
};

export default TestCard;
