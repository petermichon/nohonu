import { useEffect, useCallback, useRef } from 'react';
import { SLOT_MS } from './types';
import { getNextMinuteMs } from './utils';

export function usePollData(
  fetchFn: () => void | Promise<void>,
  intervalMs: number = SLOT_MS,
  alignToMinute: boolean = true
) {
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  const poll = useCallback(() => {
    fetchRef.current();
  }, []);

  useEffect(() => {
    poll();

    if (alignToMinute && intervalMs === SLOT_MS) {
      const msToNext = getNextMinuteMs();
      const timeout = setTimeout(() => {
        poll();
        const interval = setInterval(poll, intervalMs);
        return () => clearInterval(interval);
      }, msToNext);
      return () => clearTimeout(timeout);
    }

    const interval = setInterval(poll, intervalMs);
    return () => clearInterval(interval);
  }, [poll, intervalMs, alignToMinute]);
}
