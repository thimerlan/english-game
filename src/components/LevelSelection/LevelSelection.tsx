import Beginner from "./Beginner";
import Elementary from "./Elementary";
import Intermediate from "./Intermediate";
import UpperIntermediate from "./UpperIntermediate";
import "./LevelSelection.scss";
const LevelSelection = () => {
  return (
    <div className="levelSelection">
      <div className="gridLevels">
        <Beginner />
        <Elementary />
        <Intermediate />
        <UpperIntermediate />
      </div>
    </div>
  );
};

export default LevelSelection;
