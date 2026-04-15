import { useRef, useState } from 'react';

export function useGlobalTimer() {
  const startTimestamp = useRef<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    if (!startTimestamp.current) {
      startTimestamp.current = Date.now();
    }

    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(
          Math.floor((Date.now() - startTimestamp.current!) / 1000)
        );
      }, 1000);
    }
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return {
    elapsedSeconds,
    start,
    stop,
    getStartTime: () => startTimestamp.current
  };
}
