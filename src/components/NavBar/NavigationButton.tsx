import { Link, useNavigate } from "react-router-dom";
interface INavigationButton {
  goToBack?: string;
  goToBeginnerLevel?: string;
}
const NavigationButton = ({ goToBack }: INavigationButton) => {
  const navigate = useNavigate();

  return (
    <div className="navigationButton">
      {goToBack ? (
        <button onClick={() => navigate(-1)}>{goToBack}</button>
      ) : (
        <Link to={"/dashboard"}>Go to dashboard </Link>
      )}
    </div>
  );
};

export default NavigationButton;
