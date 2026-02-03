import { useEffect, useRef, useCallback } from "react"

/**
 * Debounce hook for delaying function execution
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay],
  ) as T

  return debouncedCallback
}

/**
 * Throttle hook for limiting function execution frequency
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): T {
  const lastRun = useRef<number>(0)

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastRun.current >= delay) {
        lastRun.current = now
        callback(...args)
      }
    },
    [callback, delay],
  ) as T

  return throttledCallback
}

