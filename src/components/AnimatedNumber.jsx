import { useState, useEffect } from 'react';

export function AnimatedNumber({ value, isFloat = false }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 2000;
    const endValue = parseFloat(value);

    if (isNaN(endValue)) {
      setCurrent(value);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const nextVal = ease * endValue;
      setCurrent(isFloat ? nextVal.toFixed(1) : Math.floor(nextVal));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCurrent(isFloat ? endValue.toFixed(1) : endValue);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, isFloat]);

  return <>{current}</>;
}
