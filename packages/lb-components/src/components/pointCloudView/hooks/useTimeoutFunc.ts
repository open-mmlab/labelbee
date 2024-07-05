/**
 * Provide the `useTimeoutFunc` hook (like https://ahooks.js.org/hooks/use-timeout/),
 * but the external `delayFunc` can be used arbitrarily.
 */
import { useCallback, useEffect, useRef } from 'react';
import { useMemoizedFn } from 'ahooks';

export const isNumber = (value: unknown): value is number => typeof value === 'number';

const useTimeoutFunc = <T extends (...args: any[]) => void>(fn: T, delay?: number) => {
  const timerCallback = useMemoizedFn(fn);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const delayFunc = useCallback(((...args: any[]) => {
    if (!isNumber(delay) || delay < 0) {
      return;
    }

    clear();
    timerRef.current = setTimeout(() => timerCallback(...args), delay);
  }) as T, [delay]);

  useEffect(() => {
    return clear;
  }, [clear]);

  return { fn: delayFunc, clear };
};

export default useTimeoutFunc;
