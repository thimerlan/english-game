import { Link } from "react-router-dom";

const Intermediate = () => {
  return (
    <div className="intermediate">
      <span>B1</span>
      <h2>Intermediate Level</h2>
      <p>
        The Intermediate Level is aimed at learners who have a solid foundation
        in English. In this level, you will build upon your existing knowledge
        to improve your fluency and accuracy. You will focus on more
        sophisticated grammar structures, expand your vocabulary, and engage in
        discussions on various topics. Reading comprehension and writing skills
        will also be emphasized.
      </p>
      <Link to="/soon">Go to Intermediate level</Link>
    </div>
  );
};

export default Intermediate;
