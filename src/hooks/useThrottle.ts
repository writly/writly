import { throttle } from "lodash-es";
import { useMemo, useRef } from "react";

export function useThrottle<T extends (...args: never[]) => void>(
  fn: T,
  ms: number,
) {
  const funcRef = useRef<T | null>(null);
  funcRef.current = fn;

  return useMemo(
    () =>
      throttle((...args: Parameters<T>) => {
        if (funcRef.current) {
          funcRef.current(...args);
        }
      }, ms),
    [ms],
  );
}
