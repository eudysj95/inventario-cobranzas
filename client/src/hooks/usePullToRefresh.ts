import { useState, useCallback, useEffect, useRef } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  enabled?: boolean;
}

interface UsePullToRefreshReturn {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => Promise<void>;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 60,
  enabled = true,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef(0);
  const isAtTop = useRef(false);
  const isActive = useRef(false);

  // Check if we're on mobile and at top of page
  const checkConditions = useCallback(() => {
    const isMobile = window.innerWidth < 768;
    const atTop = window.scrollY === 0;
    return isMobile && atTop && enabled;
  }, [enabled]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!checkConditions()) return;

    startY.current = e.touches[0].clientY;
    isAtTop.current = window.scrollY === 0;
    isActive.current = true;
    setIsPulling(true);
    setPullDistance(0);
  }, [checkConditions]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isActive.current || !isAtTop.current) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    // Only pull down (positive distance)
    if (distance > 0) {
      setPullDistance(distance);
    }
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (!isActive.current || !isAtTop.current) {
      isActive.current = false;
      setIsPulling(false);
      setPullDistance(0);
      return;
    }

    isActive.current = false;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh]);

  // Reset on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        isActive.current = false;
        setIsPulling(false);
        setPullDistance(0);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}