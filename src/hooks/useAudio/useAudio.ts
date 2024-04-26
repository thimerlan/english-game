import { useCallback, useEffect, useRef } from "react";

const useAudio = (file: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const load = useCallback(() => {
    const audio = new Audio(file);
    audioRef.current = audio;
  }, [file]);

  const play = useCallback(() => {
    try {
      audioRef.current?.play();
    } catch (err) {
      console.error("Failed to play audio:", err);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { play };
};
export default useAudio;
