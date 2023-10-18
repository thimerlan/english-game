import { useState } from "react";
import { GrammarlyEditorPlugin } from "@grammarly/editor-sdk-react";
import "./GrammarChecker.scss";
// import { ScaleLoader } from "react-spinners";
import { BiCopy } from "react-icons/bi";

const GrammarChecker = () => {
  const [showCopiedText, setShowCopiedText] = useState(false);
  const [text, setText] = useState("");
  async function copyThetext(text: string): Promise<void> {
    try {
      if (text) await navigator.clipboard.writeText(text);
      setShowCopiedText(true);
      setTimeout(() => {
        setShowCopiedText(false);
      }, 400);
    } catch (error) {
      console.error("Error copying text to clipboard:", error);
    }
  }

  return (
    <div className="GrammarChecker">
      <div className="GrammarChecker-container">
        <GrammarlyEditorPlugin clientId="client_HGu1p4bnjopAHi1vpAgB1x">
          <textarea
            placeholder="Write your mind.."
            onChange={(e) => setText(e.target.value)}
          />
        </GrammarlyEditorPlugin>
        <div>
          <button
            title="Copy text"
            onClick={() => copyThetext(text)}
            className="copyTheCorrectAnswer"
          >
            {showCopiedText && <span>copied!</span>}
            <BiCopy />
          </button>
        </div>
      </div>
    </div>
  );
};
export default GrammarChecker;
