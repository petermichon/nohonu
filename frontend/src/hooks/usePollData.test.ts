import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePollData } from './usePollData.ts';
import { SLOT_MS } from '../lib/types.ts';

describe('usePollData', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('polls immediately on mount', () => {
    const fetchFn = vi.fn();
    renderHook(() => usePollData(fetchFn));
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('polls immediately even with a promise-returning fetchFn', async () => {
    const fetchFn = vi.fn(async () => {});
    renderHook(() => usePollData(fetchFn));
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  describe('minute-aligned polling (default)', () => {
    it('polls at the next minute boundary and then every minute', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(60_000));
      const fetchFn = vi.fn();
      renderHook(() => usePollData(fetchFn));

      expect(fetchFn).toHaveBeenCalledTimes(1);

      act(() => vi.advanceTimersByTime(SLOT_MS - 1));
      expect(fetchFn).toHaveBeenCalledTimes(1);

      act(() => vi.advanceTimersByTime(1));
      expect(fetchFn).toHaveBeenCalledTimes(2);

      act(() => vi.advanceTimersByTime(SLOT_MS));
      expect(fetchFn).toHaveBeenCalledTimes(3);
    });

    it('stops polling after unmount', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(60_000));
      const fetchFn = vi.fn();
      const { unmount } = renderHook(() => usePollData(fetchFn));

      unmount();
      act(() => vi.advanceTimersByTime(SLOT_MS * 3));
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('uses the latest fetchFn after a rerender', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(60_000));
      const firstFetch = vi.fn();
      const secondFetch = vi.fn();
      const { rerender } = renderHook(({ fn }) => usePollData(fn), {
        initialProps: { fn: firstFetch },
      });

      rerender({ fn: secondFetch });
      act(() => vi.advanceTimersByTime(SLOT_MS));

      expect(secondFetch).toHaveBeenCalled();
      expect(firstFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('plain interval polling', () => {
    it('polls on a regular interval when alignToMinute is false', () => {
      vi.useFakeTimers();
      const fetchFn = vi.fn();
      renderHook(() => usePollData(fetchFn, SLOT_MS, false));

      expect(fetchFn).toHaveBeenCalledTimes(1);
      act(() => vi.advanceTimersByTime(SLOT_MS));
      expect(fetchFn).toHaveBeenCalledTimes(2);
      act(() => vi.advanceTimersByTime(SLOT_MS));
      expect(fetchFn).toHaveBeenCalledTimes(3);
    });

    it('polls on a custom interval', () => {
      vi.useFakeTimers();
      const fetchFn = vi.fn();
      renderHook(() => usePollData(fetchFn, 1000, false));

      expect(fetchFn).toHaveBeenCalledTimes(1);
      act(() => vi.advanceTimersByTime(1000));
      expect(fetchFn).toHaveBeenCalledTimes(2);
      act(() => vi.advanceTimersByTime(2000));
      expect(fetchFn).toHaveBeenCalledTimes(4);
    });

    it('falls back to a plain interval when a custom interval is given with alignToMinute', () => {
      vi.useFakeTimers();
      const fetchFn = vi.fn();
      renderHook(() => usePollData(fetchFn, 2000, true));

      act(() => vi.advanceTimersByTime(2000));
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('stops polling after unmount', () => {
      vi.useFakeTimers();
      const fetchFn = vi.fn();
      const { unmount } = renderHook(() => usePollData(fetchFn, SLOT_MS, false));

      unmount();
      act(() => vi.advanceTimersByTime(SLOT_MS * 3));
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
  });
});
