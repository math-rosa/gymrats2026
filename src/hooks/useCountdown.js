import { useState, useEffect } from 'react';

export function useCountdown(startDate, endDate) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState({ pct: 0, currentDay: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalDuration = end - start;
      const elapsed = now - start;

      let pct = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      const currentDay = Math.min(45, Math.max(0, Math.ceil(elapsed / (1000 * 60 * 60 * 24))));

      const remaining = end - now;
      if (remaining > 0) {
        setTimeLeft({
          days: Math.floor(remaining / (1000 * 60 * 60 * 24)),
          hours: Math.floor((remaining / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((remaining / 1000 / 60) % 60),
          seconds: Math.floor((remaining / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
      setProgress({ pct, currentDay });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [startDate, endDate]);

  return { timeLeft, progress };
}
