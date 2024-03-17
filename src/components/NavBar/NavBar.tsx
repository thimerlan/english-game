import NavigationButton from "./NavigationButton";
import { Link } from "react-router-dom";
import { useState } from "react";
import Auth from "../../Auth/Auth";
import Logo from "./Logo";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";

import "./NavBar.scss";

interface INavBarProps {
  goToBack?: string;
  goToBeginnerLevel?: string;
}
const NavBar = ({ goToBeginnerLevel, goToBack }: INavBarProps) => {
  const [activeBurgerMenu, setActiveBurgerMenu] = useState(false);

  return (
    <header>
      <nav className="navBar">
        <Logo />
        <ul
          className={
            activeBurgerMenu ? "menu-list-active" : "menu-list-inactive"
          }
        >
          <li>
            <Link className="navigateDictionary-page" to={"/dictionary"}>
              Dictionary
            </Link>
          </li>
          <li>
            <Link
              className="navigateGrammarChecker-page"
              to={"/grammar-checker"}
            >
              Grammar checker
            </Link>
          </li>
          <li>
            <Link className="navigateGrammarChecker-page" to={"/chat"}>
              Chat
            </Link>
          </li>
          <Auth />
        </ul>

        <NavigationButton
          goToBack={goToBack}
          goToBeginnerLevel={goToBeginnerLevel}
        />
        <Auth />

        <div className="burger-btn">
          <button onClick={() => setActiveBurgerMenu((prev) => !prev)}>
            {activeBurgerMenu ? (
              <IoClose size={42} color="red" />
            ) : (
              <HiMenuAlt3 size={40} color="white" />
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
