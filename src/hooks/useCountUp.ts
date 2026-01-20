import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
    start?: number;
    end: number;
    duration?: number;
    decimals?: number;
    delay?: number;
}

export function useCountUp({
    start = 0,
    end,
    duration = 1500,
    decimals = 0,
    delay = 0,
}: UseCountUpOptions) {
    const [count, setCount] = useState(start);
    const countRef = useRef(start);
    const startTimeRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const startAnimation = () => {
            const animate = (currentTime: number) => {
                if (startTimeRef.current === null) {
                    startTimeRef.current = currentTime;
                }

                const elapsed = currentTime - startTimeRef.current;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function for smooth deceleration
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);

                const currentValue = start + (end - start) * easeOutQuart;
                countRef.current = currentValue;
                setCount(currentValue);

                if (progress < 1) {
                    rafRef.current = requestAnimationFrame(animate);
                }
            };

            rafRef.current = requestAnimationFrame(animate);
        };

        const timeoutId = setTimeout(startAnimation, delay);

        return () => {
            clearTimeout(timeoutId);
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [start, end, duration, delay]);

    return decimals > 0 ? count.toFixed(decimals) : Math.round(count);
}
