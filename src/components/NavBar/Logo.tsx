import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
const Logo = () => {
  return (
    <Link to={"/"}>
      <img src={logo} width={240} height={70} alt="English game logo" />
    </Link>
  );
};

export default Logo;
