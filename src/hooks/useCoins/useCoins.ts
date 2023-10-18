import { useState, useEffect } from "react";

const useCoins = () => {
  const [coins, setCoins] = useState<number>(() => {
    const storedCoins = localStorage.getItem("coins");
    return storedCoins ? parseInt(storedCoins) : 0;
  });

  useEffect(() => {
    localStorage.setItem("coins", String(coins));
  }, [coins]);

  return {
    coins,
    setCoins,
    incrementCoins: () => setCoins((prevCoins) => prevCoins + 1),
    decrementCoins: () => setCoins((prevCoins) => prevCoins - 1),
  };
};

export default useCoins;
