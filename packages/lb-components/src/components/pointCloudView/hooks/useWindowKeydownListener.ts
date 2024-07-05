/**
 * Proivde the `useWindowKeydownListener` hook (more power except `https://github.com/alibaba/hooks/blob/master/packages/hooks/src/useEventListener/index.ts`)
 * which will have `preappend` or `append` event in your order.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import '../utils/event-polyfill'

type KeydownListener = (e: KeyboardEvent) => void;

type Caller = (fn: KeydownListener) => () => void;

export interface WindowKeydownListenerHooker {
  appendEventListener: Caller;
  preappendEventListener: Caller;

  /** Alias for `appendEventListener`, user-friendly name */
  addEventListener: Caller;
}

const EmptyCaller = () => () => {};

export const getEmptyUseWindowKeydownListener = (): WindowKeydownListenerHooker => {
  return {
    appendEventListener: EmptyCaller,
    preappendEventListener: EmptyCaller,
    addEventListener: EmptyCaller,
  };
};

const ctor = () => {};

const useWindowKeydownListener: () => WindowKeydownListenerHooker = () => {
  const keydownListeners = useRef<KeydownListener[]>([]);

  /**
   * Dispose handler
   *
   * @private
   */
  const disposeListener = useCallback((fn: KeydownListener) => {
    const fns = keydownListeners.current;
    const idx = fns.findIndex((value) => value === fn);
    if (idx > -1) {
      fns.splice(idx, 1);
    }
  }, []);

  /**
   * @private
   */
  const registerListener = useCallback<
    (fn: KeydownListener, process: (fn: KeydownListener) => void) => () => void
  >(
    (fn, process) => {
      if (!fn) {
        console.warn('invalid listener');
        return ctor;
      }

      process(fn);

      return () => {
        disposeListener(fn);
      };
    },
    [disposeListener],
  );

  /**
   * @returns dispose handler
   */
  const appendEventListener = useCallback<Caller>(
    (fn: KeydownListener) => {
      return registerListener(fn, (fn) => {
        // Append the list
        keydownListeners.current.push(fn);
      });
    },
    [registerListener],
  );

  /**
   * @returns dispose handler
   */
  const preappendEventListener = useCallback<Caller>(
    (fn: KeydownListener) => {
      return registerListener(fn, (fn) => {
        // Preappend the list
        keydownListeners.current.unshift(fn);
      });
    },
    [registerListener],
  );

  useEffect(() => {
    return () => {
      // Clear the array
      keydownListeners.current.length = 0;
    };
  }, []);

  useEffect(() => {
    const fn: KeydownListener = (e: KeyboardEvent) => {
      const listeners = keydownListeners.current.slice(0);

      for (let listener of listeners) {
        if (e.isImmediatePropagationStopped()) {
          break;
        }

        listener(e);
      }
    };

    window.addEventListener('keydown', fn, false);

    return () => {
      window.removeEventListener('keydown', fn, false);
    };
  }, []);

  return useMemo<WindowKeydownListenerHooker>(
    () => ({
      appendEventListener,
      preappendEventListener,
      addEventListener: appendEventListener,
    }),
    [appendEventListener, preappendEventListener],
  );
};

export default useWindowKeydownListener;
