import { useNavigate } from "react-router-dom";

import "./UnderConstruction.scss";

const UnderConstruction = () => {
  const navigate = useNavigate();

  return (
    <div className="UnderConstructionRoute">
      <h1>Under Construction 🚧</h1>
      <p>
        We're working hard to improve this page and make it even better for you.
        Please check back soon!
      </p>
      <button onClick={() => navigate("/")}>Go to the home page </button>
    </div>
  );
};

export default UnderConstruction;
