import React, { useCallback, useMemo } from 'react';
import Draggable from 'react-draggable';
import type { DraggableEventHandler } from 'react-draggable';
import { DragProps } from '../types/interface';
import { useLocalStorageState } from 'ahooks';
import useUpdateHeight from './useUpdateHeight';
import topToZeroIcon from '../assets/topToZero.svg';
import bottomToZeroIcon from '../assets/bottomToZero.svg';
import dividerIcon from '../assets/divider.svg';

const useDrag = ({
  containerRef,
  minTopHeight = 0,
  minBottomHeight = 0,
  defaultHeight = 50,
  axis,
  localKey,
  isShortcutButton = false,
}: DragProps) => {
  const cacheKey = localKey || 'dynamicResizerHeights';
  const {
    topHeight,
    position,
    bounds,
    topStyle,
    bottomStyle,
    updateELHeight,
    setTopHeightToZero,
    setBottomHeightToZero,
  } = useUpdateHeight(containerRef, minTopHeight, minBottomHeight, defaultHeight, cacheKey);
  const [localTopHeight, setLocalTopHeight] = useLocalStorageState<number | undefined>(cacheKey);

  // Hide scrollbar at the beginning of drag and drop
  const onDragStart: DraggableEventHandler = useCallback(
    (e) => {
      e.stopPropagation();
      if (containerRef.current) {
        containerRef.current.classList.add('hide-scrollbar');
      }
    },
    [containerRef],
  );

  const onDrag: DraggableEventHandler = useCallback(
    (e, node) => {
      e.stopPropagation();
      updateELHeight(node.y);
    },
    [updateELHeight],
  );

  // Show scroll bar at the end of drag and drop
  const onDragStop: DraggableEventHandler = useCallback(
    (e) => {
      e.stopPropagation();
      if (containerRef.current) {
        containerRef.current.classList.remove('hide-scrollbar');
      }
      setLocalTopHeight(topHeight);
    },
    [containerRef, setLocalTopHeight, topHeight],
  );

  // render shortcut button
  const renderContentBtn = useMemo(() => {
    if (isShortcutButton) {
      return (
        <>
          <img
            src={topToZeroIcon}
            className='divider-top'
            draggable='false'
            onClick={setTopHeightToZero}
          />
          <div className='divider-icon' draggable='false' />
          <img
            src={bottomToZeroIcon}
            className='divider-bottom'
            draggable='false'
            onClick={setBottomHeightToZero}
          />
        </>
      );
    } else {
      return (
        <>
          <img src={dividerIcon} className='divider-all' draggable='false' />
          <div className='divider-icon' draggable='false' />
        </>
      );
    }
  }, [isShortcutButton, setTopHeightToZero, setBottomHeightToZero]);

  const rendered = useMemo(() => {
    const divider = <div className='divider'>{renderContentBtn}</div>;

    return (
      <Draggable
        axis={axis}
        position={position}
        handle='.divider'
        onStart={onDragStart}
        onDrag={onDrag}
        onStop={onDragStop}
        bounds={bounds}
      >
        {divider}
      </Draggable>
    );
  }, [axis, position, onDrag, onDragStop, bounds]);

  return { rendered, topStyle, bottomStyle };
};

export default useDrag;
