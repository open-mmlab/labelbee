import React, { FC, useRef } from 'react';
import './DynamicResizer.scss';
import useDrag from './hooks/useDrag';
import { DynamicResizerProps } from './types/interface';

const DynamicResizer: FC<DynamicResizerProps> = (props) => {
  const {
    minTopHeight = 0,
    minBottomHeight = 0,
    defaultHeight = 50,
    axis = 'y',
    children,
    localKey = 'dynamicResizerHeights',
    customDivider,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  const { rendered, topStyle, bottomStyle } = useDrag({
    containerRef,
    minTopHeight,
    minBottomHeight,
    defaultHeight,
    axis,
    localKey,
    customDivider,
  });

  return (
    <div className='dynamic-resizer-content' ref={containerRef}>
      <div className='dynamic-resizer-top' style={topStyle}>
        {children[0]}
      </div>
      {rendered}
      <div className='dynamic-resizer-bottom' style={bottomStyle}>
        {children[1]}
      </div>
    </div>
  );
};

export default DynamicResizer;
