import { useEffect, useMemo, useState, RefObject, useCallback } from 'react';
import { useLocalStorageState } from 'ahooks';

const useUpdateHeight = (
  containerRef: RefObject<HTMLDivElement>,
  minTopHeight: number,
  minBottomHeight: number,
  defaultHeight: number,
  cacheKey: string,
) => {
  const [topHeight, setTopHeight] = useState<number>(0);
  const [bottomHeight, setBottomHeight] = useState<number>(0);
  const [limitMinTopHeight, setLimitMinTopHeight] = useState<number>(0);
  const [limitMinBottomHeight, setLimitMinBottomHeight] = useState<number>(0);
  const [localTopHeight, setLocalTopHeight] = useLocalStorageState<number | undefined>(cacheKey);

  // init top height
  useEffect(() => {
    initPropHeight();
    const cacheTopHeight = localTopHeight;
    let newTopHeight = 0;

    if (cacheTopHeight !== undefined && cacheTopHeight !== null) {
      const cacheHeight = isNaN(Number(cacheTopHeight)) ? 0 : Number(cacheTopHeight);
      newTopHeight = cacheHeight;
    } else {
      newTopHeight = topHeight || defaultHeight;
    }

    updateELHeight(newTopHeight);
  }, []);

  // divider‘s position
  const position = useMemo(() => ({ x: 0, y: topHeight }), [topHeight]);

  // Restrict the drag range of react-dragble
  const bounds = useMemo(
    () => ({
      top: limitMinTopHeight,
      bottom: (containerRef.current?.offsetHeight || 0) - limitMinBottomHeight,
    }),
    [topHeight, containerRef],
  );

  // calc style
  const topStyle = useMemo(() => {
    return {
      height: topHeight + 'px',
    };
  }, [topHeight]);

  const bottomStyle = useMemo(() => {
    return {
      height: bottomHeight + 'px',
    };
  }, [bottomHeight]);

  /* -----------------------Events-------------------------- */
  // Initialize the height passed in externally and set a maximum limit. If it exceeds half of the container, take half
  const initPropHeight = () => {
    if (containerRef) {
      let calcMinTopHeight = minTopHeight;
      let calcMinBottomHeight = minBottomHeight;

      if (minTopHeight >= (containerRef.current?.offsetHeight || 0) / 2) {
        calcMinTopHeight = (containerRef.current?.offsetHeight || 0) / 2;
      }

      if (minBottomHeight >= (containerRef.current?.offsetHeight || 0) / 2) {
        calcMinBottomHeight = (containerRef.current?.offsetHeight || 0) / 2;
      }

      // The minTopHeight value cannot be set to 0, otherwise the draggable cannot be dragged. The solution is to add a minimum decimal
      setLimitMinTopHeight(calcMinTopHeight || 0.00001);
      setLimitMinBottomHeight(calcMinBottomHeight);
    }
  };

  // Update top and bottom height
  const updateELHeight = useCallback(
    (newTopHeight: number) => {
      if (containerRef) {
        const containerHeight = containerRef?.current?.offsetHeight || 0;
        const maxResizeHeight = containerHeight - limitMinBottomHeight;
        if (newTopHeight >= limitMinTopHeight && newTopHeight <= maxResizeHeight) {
          setTopHeight(newTopHeight);
          setBottomHeight(containerHeight - newTopHeight);
        }
      }
    },
    [containerRef, limitMinTopHeight, limitMinBottomHeight],
  );

  // set top height to 0
  const setTopHeightToZero = () => {
    if (containerRef) {
      updateELHeight(limitMinTopHeight || 0);
      setLocalTopHeight(limitMinTopHeight || 0);
    }
  };

  // set bottom height to 0
  const setBottomHeightToZero = () => {
    if (containerRef) {
      const containerHeight = containerRef?.current?.offsetHeight || 0;
      updateELHeight(containerHeight - limitMinBottomHeight || 0);
      setLocalTopHeight(containerHeight - limitMinBottomHeight || 0);
    }
  };

  return {
    topHeight,
    bottomHeight,
    position,
    bounds,
    topStyle,
    bottomStyle,
    updateELHeight,
    setBottomHeightToZero,
    setTopHeightToZero,
  };
};

export default useUpdateHeight;
