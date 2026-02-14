import { RefObject, useEffect, useState } from 'react';

export function useScrollProgress(ref: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handler = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const denominator = scrollHeight - clientHeight;
      if (denominator <= 0) {
        setProgress(0);
        return;
      }
      setProgress(Math.min(scrollTop / denominator, 1));
    };

    handler();
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, [ref]);

  return progress;
}
