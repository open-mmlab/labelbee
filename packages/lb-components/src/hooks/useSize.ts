import { useLayoutEffect, useMemo } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import type { BasicTarget } from '../utils/dom';
import { getTargetElement } from '../utils/dom';
import useRafState from './useRafState';
import { debounce } from 'lodash';
interface Size {
  width: number;
  height: number;
}

function useSize(target: BasicTarget): Size {
  const [state, setState] = useRafState<Size>(() => {
    const el = getTargetElement(target);
    return {
      width: ((el || {}) as HTMLElement).clientWidth ?? 0,
      height: ((el || {}) as HTMLElement).clientHeight ?? 0,
    };
  });

  const onChangeSize = useMemo(() => {
    return debounce((entry) => {
      setState({
        width: entry.target.clientWidth ?? 0,
        height: entry.target.clientHeight ?? 0,
      });
    }, 100);
  }, []);

  useLayoutEffect(() => {
    const el = getTargetElement(target);
    if (!el) {
      return () => {};
    }

    const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      entries.forEach((entry: ResizeObserverEntry) => {
        onChangeSize(entry);
      });
    });

    resizeObserver.observe(el as HTMLElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [target]);

  return state;
}

export default useSize;
