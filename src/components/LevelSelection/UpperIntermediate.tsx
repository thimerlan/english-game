import { Link } from "react-router-dom";

const UpperIntermediate = () => {
  return (
    <div className="upperIntermediate">
      <span>B2</span>

      <h2>Upper Intermediate Level</h2>
      <p>
        The Upper Intermediate Level is for learners who are already proficient
        in English but aim to reach a more advanced level. At this stage, you
        will work on refining your language skills and expanding your vocabulary
        further. You will tackle complex grammar concepts, engage in debates and
        discussions, and enhance your reading and writing abilities to express
        more nuanced ideas.
      </p>
      <Link to="/upperIntermediate">Go to Upper Intermediate level</Link>
    </div>
  );
};

export default UpperIntermediate;
