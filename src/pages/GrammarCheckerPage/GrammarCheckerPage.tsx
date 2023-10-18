import GrammarChecker from "../../components/GrammerChecker/GrammarChecker";

import "./GrammarCheckerPage.scss";
import { useNavigate } from "react-router-dom";

const GrammarCheckerPage = () => {
  const navigate = useNavigate();
  return (
    <section className="grammar-checker">
      <button className="goToBack" onClick={() => navigate(-1)}>
        Go to back
      </button>
      <br />
      <br />
      <h1>Grammar Checker </h1>
      <p className="grammar-checker-about">
        Check the grammar of your sentences here! Enter your sentence andyou
        will get suggestions for improvements. Improve your writing and
        communicate effectively. Happy grammar checking!
      </p>

      <GrammarChecker />
    </section>
  );
};

export default GrammarCheckerPage;
