import { useEffect, useRef, useState } from 'react';

export default function AnimatedCounter({ value, duration = 1200, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const displayValRef = useRef(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    displayValRef.current = display;
  }, [display]);

  useEffect(() => {
    const target = typeof value === 'number' ? value : parseFloat(value) || 0;
    const startVal = displayValRef.current;
    if (hasAnimated.current && target === startVal) return;
    hasAnimated.current = true;

    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * eased);
      setDisplay(current);
      if (progress < 1) {
        ref.current = requestAnimationFrame(tick);
      }
    };

    ref.current = requestAnimationFrame(tick);
    return () => ref.current && cancelAnimationFrame(ref.current);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}
