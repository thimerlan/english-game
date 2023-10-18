import Logo from "./Logo";
import NavigationButton from "./NavigationButton";
import "./NavBar.scss";
import { Link } from "react-router-dom";
import Auth from "../../Auth/Auth";

interface INavBarProps {
  goToBack?: string;
  goToBeginnerLevel?: string;
}
const NavBar = ({ goToBeginnerLevel, goToBack }: INavBarProps) => {
  return (
    <header>
      <nav className="navBar">
        <Logo />
        <Link className="navigateDictionary-page" to={"/dictionary"}>
          Dictionary
        </Link>
        <Link className="navigateGrammarChecker-page" to={"/grammar-checker"}>
          Grammar checker
        </Link>
        <Link className="navigateGrammarChecker-page" to={"/chat"}>
          Chat
        </Link>
        <NavigationButton
          goToBack={goToBack}
          goToBeginnerLevel={goToBeginnerLevel}
        />
        <Auth />
      </nav>
    </header>
  );
};

export default NavBar;
