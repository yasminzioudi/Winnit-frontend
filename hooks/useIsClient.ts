import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * React 18/19 safe hook to detect if component has mounted on client
 * without triggering ESLint react-hooks/set-state-in-effect errors.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
