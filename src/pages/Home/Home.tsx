import LevelSelection from "../../components/LevelSelection/LevelSelection";
import NavBar from "../../components/NavBar/NavBar";
import "./Home.scss";
const Home = () => {
  return (
    <div className="home">
      <NavBar />
      <h2>SELECT YOUR LEVEL AND LET'S GO!!!</h2>
      <LevelSelection />
    </div>
  );
};

export default Home;
