import { useCallback, useEffect, useRef, useState } from "react";
import { useBlocker, useBeforeUnload, UNSAFE_DataRouterContext } from "react-router-dom";
import { useContext } from "react";

interface UseDirtyFormOptions {
  onDirtyChange?: (dirty: boolean) => void;
  message?: string;
}

interface UseDirtyFormReturn {
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  resetDirty: () => void;
}

/**
 * useDirtyForm - Hook to track unsaved form changes and block navigation
 *
 * Features:
 * - Tracks dirty state
 * - Integrates with React Router's useBlocker to prevent navigation (when in data router)
 * - Shows beforeunload warning on page close/refresh
 * - Calls optional callback on dirty state change
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const { isDirty, setDirty, resetDirty } = useDirtyForm({
 *     onDirtyChange: (dirty) => console.log("Form dirty:", dirty),
 *   });
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <Input onChange={(e) => setDirty(true)} />
 *       <Button type="submit" onClick={() => resetDirty()}>Save</Button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useDirtyForm({
  onDirtyChange,
  message = "Tiene cambios sin guardar. ¿Desea salir sin guardar?",
}: UseDirtyFormOptions = {}): UseDirtyFormReturn {
  const [isDirty, setIsDirty] = useState(false);
  const messageRef = useRef(message);
  const onDirtyChangeRef = useRef(onDirtyChange);

  // Check if we're in a data router context (for useBlocker)
  const dataRouterContext = useContext(UNSAFE_DataRouterContext);
  const isInDataRouter = dataRouterContext !== null;

  // Keep refs in sync with props
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  useEffect(() => {
    onDirtyChangeRef.current = onDirtyChange;
  }, [onDirtyChange]);

  const setDirty = useCallback((dirty: boolean) => {
    if (dirty !== isDirty) {
      setIsDirty(dirty);
      onDirtyChangeRef.current?.(dirty);
    }
  }, [isDirty]);

  const resetDirty = useCallback(() => {
    setDirty(false);
  }, [setDirty]);

  // Handle beforeunload (page refresh/close) using React Router's useBeforeUnload
  useBeforeUnload(
    useCallback(() => {
      if (isDirty) {
        return messageRef.current;
      }
    }, [isDirty])
  );

  // React Router navigation blocker (only works in data router context)
  let blocker: ReturnType<typeof useBlocker> | null = null;
  if (isInDataRouter) {
    blocker = useBlocker(
      useCallback(
        ({ currentLocation, nextLocation }) => {
          if (isDirty && currentLocation.pathname !== nextLocation.pathname) {
            return true; // Block navigation
          }
          return false; // Allow navigation
        },
        [isDirty]
      )
    );
  }

  // Handle the blocker's proceed/confirm logic
  useEffect(() => {
    if (blocker && blocker.state === "blocked") {
      const confirmLeave = window.confirm(messageRef.current);
      if (confirmLeave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  return {
    isDirty,
    setDirty,
    resetDirty,
  };
}