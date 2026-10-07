import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePullToRefresh } from "./usePullToRefresh";

describe("usePullToRefresh", () => {
  let mockOnRefresh: vi.Mock;

  beforeEach(() => {
    mockOnRefresh = vi.fn().mockResolvedValue(undefined);
    vi.useFakeTimers();
    // Reset window properties
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1024 });
    Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns initial state with isPulling false", () => {
    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh: mockOnRefresh, threshold: 60 })
    );

    expect(result.current.isPulling).toBe(false);
    expect(result.current.pullDistance).toBe(0);
    expect(result.current.isRefreshing).toBe(false);
  });

  it("tracks pull distance on touch move", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 375 });

    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh: mockOnRefresh, threshold: 60 })
    );

    // Simulate touch start at top of page
    act(() => {
      result.current.onTouchStart({ touches: [{ clientY: 100 }] } as any);
    });

    // Simulate touch move down
    act(() => {
      result.current.onTouchMove({ touches: [{ clientY: 150 }] } as any);
    });

    expect(result.current.pullDistance).toBe(50);
    expect(result.current.isPulling).toBe(true);
  });

  it("triggers refresh when pull distance exceeds threshold", async () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 375 });

    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh: mockOnRefresh, threshold: 60 })
    );

    act(() => {
      result.current.onTouchStart({ touches: [{ clientY: 100 }] } as any);
    });

    act(() => {
      result.current.onTouchMove({ touches: [{ clientY: 170 }] } as any); // 70px pull
    });

    expect(result.current.pullDistance).toBe(70);

    // Release - should trigger refresh
    let refreshPromise: Promise<void> | null = null;
    act(() => {
      refreshPromise = result.current.onTouchEnd({} as any);
    });

    // isRefreshing should be true immediately after onTouchEnd starts
    expect(result.current.isRefreshing).toBe(true);
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);

    // Wait for refresh to complete
    if (refreshPromise) {
      await act(async () => {
        await refreshPromise;
      });
    }

    expect(result.current.isRefreshing).toBe(false);
  });

  it("does not trigger refresh when pull distance is below threshold", async () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 375 });

    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh: mockOnRefresh, threshold: 60 })
    );

    act(() => {
      result.current.onTouchStart({ touches: [{ clientY: 100 }] } as any);
    });

    act(() => {
      result.current.onTouchMove({ touches: [{ clientY: 140 }] } as any); // 40px pull
    });

    await act(async () => {
      result.current.onTouchEnd({} as any);
    });

    expect(mockOnRefresh).not.toHaveBeenCalled();
    expect(result.current.isRefreshing).toBe(false);
  });

  it("resets state after refresh completes", async () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 375 });

    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh: mockOnRefresh, threshold: 60 })
    );

    act(() => {
      result.current.onTouchStart({ touches: [{ clientY: 100 }] } as any);
    });

    act(() => {
      result.current.onTouchMove({ touches: [{ clientY: 170 }] } as any);
    });

    let refreshPromise: Promise<void> | null = null;
    act(() => {
      refreshPromise = result.current.onTouchEnd({} as any);
    });

    expect(result.current.isRefreshing).toBe(true);

    // Wait for refresh to complete
    if (refreshPromise) {
      await act(async () => {
        await refreshPromise;
      });
    }

    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.pullDistance).toBe(0);
  });

  it("only works on mobile viewport (< 768px)", () => {
    // Mock window.innerWidth
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1024 });

    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh: mockOnRefresh, threshold: 60 })
    );

    act(() => {
      result.current.onTouchStart({ touches: [{ clientY: 100 }] } as any);
    });

    act(() => {
      result.current.onTouchMove({ touches: [{ clientY: 170 }] } as any);
    });

    // On desktop, pull-to-refresh should not activate
    expect(result.current.isPulling).toBe(false);
    expect(result.current.pullDistance).toBe(0);
  });

  it("works on mobile viewport (< 768px)", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 375 });

    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh: mockOnRefresh, threshold: 60 })
    );

    act(() => {
      result.current.onTouchStart({ touches: [{ clientY: 100 }] } as any);
    });

    act(() => {
      result.current.onTouchMove({ touches: [{ clientY: 170 }] } as any);
    });

    // On mobile, pull-to-refresh should activate
    expect(result.current.isPulling).toBe(true);
    expect(result.current.pullDistance).toBe(70);
  });

  it("does not activate when not at top of page", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 375 });
    Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: 100 });

    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh: mockOnRefresh, threshold: 60 })
    );

    act(() => {
      result.current.onTouchStart({ touches: [{ clientY: 100 }] } as any);
    });

    act(() => {
      result.current.onTouchMove({ touches: [{ clientY: 170 }] } as any);
    });

    // Should not activate when not at top
    expect(result.current.isPulling).toBe(false);
    expect(result.current.pullDistance).toBe(0);
  });

  it("calls onRefresh with correct context", async () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 375 });

    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh: mockOnRefresh, threshold: 60 })
    );

    act(() => {
      result.current.onTouchStart({ touches: [{ clientY: 100 }] } as any);
    });

    act(() => {
      result.current.onTouchMove({ touches: [{ clientY: 170 }] } as any);
    });

    let refreshPromise: Promise<void> | null = null;
    act(() => {
      refreshPromise = result.current.onTouchEnd({} as any);
    });

    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    expect(mockOnRefresh).toHaveBeenCalledWith();

    if (refreshPromise) {
      await act(async () => {
        await refreshPromise;
      });
    }
  });

  it("handles multiple rapid touch events", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 375 });

    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh: mockOnRefresh, threshold: 60 })
    );

    act(() => {
      result.current.onTouchStart({ touches: [{ clientY: 100 }] } as any);
    });

    // Multiple rapid moves
    act(() => {
      result.current.onTouchMove({ touches: [{ clientY: 120 }] } as any);
    });
    act(() => {
      result.current.onTouchMove({ touches: [{ clientY: 140 }] } as any);
    });
    act(() => {
      result.current.onTouchMove({ touches: [{ clientY: 160 }] } as any);
    });

    expect(result.current.pullDistance).toBe(60);
  });
});