import { useNavigate } from "react-router-dom";
import "./ErrorRoute.scss";
const ErrorRoute = () => {
  const navigate = useNavigate();
  return (
    <div className="ErrorRoute">
      <h1>404 Not Found!</h1>
      <p>Oops! 🤭 The page you're looking for does not exist.</p>
      <button onClick={() => navigate(-1)}>Go to back!</button>
    </div>
  );
};

export default ErrorRoute;
