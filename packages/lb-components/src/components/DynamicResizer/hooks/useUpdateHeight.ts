import { useEffect, useMemo, useState, RefObject, useCallback } from 'react';
import { useLocalStorageState } from 'ahooks';
// Set minimum height to avoid magic numbers
const MINIMUM_HEIGHT = 0.00001;

const useUpdateHeight = (
  containerRef: RefObject<HTMLDivElement>,
  minTopHeight: number,
  minBottomHeight: number,
  defaultHeight: number,
  cacheKey: string,
) => {
  // The height of the top and bottom areas
  const [topHeight, setTopHeight] = useState<number>(0);
  const [bottomHeight, setBottomHeight] = useState<number>(0);
  // Maximum and minimum height restrictions
  const [limitMinTopHeight, setLimitMinTopHeight] = useState<number>(0);
  const [limitMinBottomHeight, setLimitMinBottomHeight] = useState<number>(0);
  // Cache height
  const [localTopHeight, setLocalTopHeight] = useLocalStorageState<number | undefined>(cacheKey);
  // Flag to track first render
  const [isInitialSetupDone, setIsInitialSetupDone] = useState<boolean>(false);

  // init top height
  useEffect(() => {
    initPropHeight();
    setIsInitialSetupDone(true);
  }, []);

  useEffect(() => {
    if (isInitialSetupDone) {
      const newTopHeight = calcHeightPriority();
      updateELHeight(newTopHeight);
      setLocalTopHeight(newTopHeight);
    }
  }, [isInitialSetupDone]);

  // divider‘s position
  const position = useMemo(() => ({ x: 0, y: topHeight }), [topHeight]);

  // Restrict the drag range of react-dragble
  const bounds = useMemo(
    () => ({
      top: limitMinTopHeight,
      bottom: (containerRef.current?.offsetHeight || 0) - limitMinBottomHeight,
    }),
    [limitMinTopHeight, containerRef],
  );

  /* -----------------------calc style-------------------------- */
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
      setLimitMinTopHeight(calcMinTopHeight || MINIMUM_HEIGHT);
      setLimitMinBottomHeight(calcMinBottomHeight);
    }
  };

  // calc Height's priority
  const calcHeightPriority = useCallback(() => {
    let newTopHeight = 0;
    // Determine if there is a cached value
    if (localTopHeight !== undefined && localTopHeight !== null) {
      const cacheHeight = isNaN(Number(localTopHeight)) ? 0 : Number(localTopHeight);
      newTopHeight = cacheHeight;
    } else {
      newTopHeight = defaultHeight;
    }
    // If it is less than the minimum value, then take the minimum value
    if (newTopHeight < limitMinTopHeight) {
      newTopHeight = limitMinTopHeight;
    }
    // If it is greater than the outer container, then take the height/2 of the outer container
    if (containerRef) {
      if (newTopHeight >= (containerRef?.current?.offsetHeight || 0)) {
        newTopHeight = (containerRef.current?.offsetHeight || 0) / 2;
      }
    }
    // Limit cannot be 0
    return newTopHeight || MINIMUM_HEIGHT;
  }, [containerRef, topHeight, limitMinTopHeight, localTopHeight, defaultHeight]);

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
