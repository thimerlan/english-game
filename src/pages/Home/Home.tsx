import NavBar from "../../components/NavBar/NavBar";
import "./Home.scss";
const Home = () => {
  return (
    <div className="home">
      <NavBar />
      <div className="welcome-message">
        <h2>Welcome to the Sweet English Game platform</h2>
        <p>
          Join the fun! Engage in exciting features with other users on our
          platform.
        </p>
        <br />
        <p>
          Our developer is constantly adding new features (
          <span className="highlight-text">
            English games to play with other users
          </span>
          ), so stay tuned for more interactive experiences!
        </p>
      </div>
    </div>
  );
};

export default Home;
