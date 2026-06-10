import { useEffect, useRef, useState } from 'react';

export default function AnimatedCounter({ value, duration = 1200, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const target = typeof value === 'number' ? value : parseFloat(value) || 0;
    if (hasAnimated.current && target === display) return;
    hasAnimated.current = true;

    const startTime = performance.now();
    const startVal = 0;

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
