import { useEffect, useRef } from 'react';
import { SLOT_MS } from '../lib/types.ts';
import { getNextMinuteMs } from '../lib/utils.ts';

export function usePollData(
  fetchFn: () => void | Promise<void>,
  intervalMs: number = SLOT_MS,
  alignToMinute: boolean = true
) {
  const fetchRef = useRef(fetchFn);

  useEffect(() => {
    fetchRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    const poll = () => fetchRef.current();
    poll();

    if (alignToMinute && intervalMs === SLOT_MS) {
      let interval: ReturnType<typeof setInterval> | undefined;
      const msToNext = getNextMinuteMs();
      const timeout = setTimeout(() => {
        poll();
        interval = setInterval(poll, intervalMs);
      }, msToNext);
      return () => {
        clearTimeout(timeout);
        clearInterval(interval);
      };
    }

    const interval = setInterval(poll, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs, alignToMinute]);
}
