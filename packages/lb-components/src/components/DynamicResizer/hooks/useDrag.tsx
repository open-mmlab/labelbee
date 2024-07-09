import React, { useCallback, useMemo } from 'react';
import Draggable1 from 'react-draggable';
import type { DraggableEventHandler } from 'react-draggable';
import useLocalStorage from './useLocalStorage';
import useUpdateHeight from './useUpdateHeight';
import { DragProps } from '../types/interface';
import topToZero from '../assets/topToZero.svg';
import bottomToZero from '../assets/bottomToZero.svg';

const Draggable: any = Draggable1;

const useDrag = ({
  containerRef,
  minTopHeight = 0,
  minBottomHeight = 0,
  defaultHeight = 50,
  axis,
  localKey,
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

  const { setLocalTopHeight } = useLocalStorage(cacheKey);

  const onDragStart: DraggableEventHandler = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.classList.add('hide-scrollbar');
    }
  }, [containerRef]);

  const onDrag: DraggableEventHandler = useCallback(
    (e, node) => {
      e.stopPropagation();
      updateELHeight(node.y);
    },
    [updateELHeight],
  );

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

  const rendered = useMemo(() => {
    const divider = (
      <div className='divider'>
        <img
          src={topToZero}
          className='divider-top'
          draggable='false'
          onClick={setTopHeightToZero}
        />
        <div className='divider-icon' draggable='false' />
        <img
          src={bottomToZero}
          className='divider-bottom'
          draggable='false'
          onClick={setBottomHeightToZero}
        />
      </div>
    );

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
