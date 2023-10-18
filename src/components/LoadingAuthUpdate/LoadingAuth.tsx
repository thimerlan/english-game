import { PulseLoader } from "react-spinners";

const LoadingAuth = () => {
  return (
    <div className="loading-screen">
      <PulseLoader size={20} color="#6a5be2" />
    </div>
  );
};

export default LoadingAuth;
