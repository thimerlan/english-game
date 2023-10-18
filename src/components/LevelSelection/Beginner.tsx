import { Link } from "react-router-dom";

const Beginner = () => {
  return (
    <div className="beginner">
      <span>A1</span>
      <h2>Beginner Level</h2>
      <p>
        The Beginner Level is designed for individuals who have little to no
        prior knowledge of the English language. In this level, you will be
        introduced to basic vocabulary, grammar, and sentence structures. You
        will focus on developing fundamental skills, such as greetings,
        introductions, and simple conversations.
      </p>
      <Link to="level/beginner">Go to Beginner level</Link>
    </div>
  );
};

export default Beginner;
