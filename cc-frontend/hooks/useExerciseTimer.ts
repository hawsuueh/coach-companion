import { useRef, useState } from 'react';

export function useExerciseTimer() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const start = (durationSeconds: number) => {
    clear();

    startTimeRef.current = Date.now();
    setRemainingSeconds(durationSeconds);

    intervalRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clear();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stop = () => {
    if (!startTimeRef.current) return 0;

    const elapsedSeconds = Math.floor(
      (Date.now() - startTimeRef.current) / 1000
    );

    clear();
    startTimeRef.current = null;

    return elapsedSeconds;
  };

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return {
    remainingSeconds,
    start,
    stop,
    clear
  };
}
