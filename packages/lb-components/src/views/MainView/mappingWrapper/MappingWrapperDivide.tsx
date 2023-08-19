/**
 * @author lijingchi <lijingchi1@sensetime.com>
 * @file 映射视图的分割线
 * @date 2021-12-15
 */
import React from 'react';
import { MAPPING_WRAPPER_DIVIDE_ZINDEX } from '@/constant/zIndex';

export const MappingWrapperDivide = (props: {
  left: string;
  onMouseDown: () => void;
  onMouseUp: () => void;
}) => {
  const { left, onMouseDown, onMouseUp } = props;
  return (
    <div
      onMouseDown={() => onMouseDown()}
      onMouseUp={() => onMouseUp()}
      style={{
        position: 'absolute',
        zIndex: MAPPING_WRAPPER_DIVIDE_ZINDEX,
        top: 0,
        cursor: 'ew-resize',
        width: 4,
        bottom: 0,
        left,
        background: 'white',
        transform: 'translateX(-2px)',
      }}
    />
  );
};
