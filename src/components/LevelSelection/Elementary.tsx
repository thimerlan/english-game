import { Link } from "react-router-dom";

const Elementary = () => {
  return (
    <div className="elementary">
      <span>A2</span>
      <h2>Elementary Level</h2>
      <p>
        The Elementary Level is suitable for learners who have a basic
        understanding of English. At this level, you will expand your vocabulary
        and grasp more complex grammar concepts. You will learn to express
        yourself more fluently, engage in basic everyday conversations, and
        enhance your reading and writing skills.
      </p>
      <Link to="/elementary">Go to Elementary level</Link>
    </div>
  );
};

export default Elementary;
