/**
 * @author lijingchi <lijingchi1@sensetime.com>
 * @file 映射视图的resize蒙版，当前的调整参数传递到上层
 * @date 2021-12-15
 */

import React, { useState } from 'react';
import { MAPPING_WRAPPER_RESIZE_LAYER_ZINDEX } from '@/constant/zIndex';

export const ResizeLayer = (props: {
  onResize: boolean;
  cancelResize: () => void;
  updateOffset: (offsetPercent: number) => void;
}) => {
  const { onResize, cancelResize, updateOffset } = props;

  const [prevClientX, setPrevClientX] = useState<null | number>(null);

  const mouseLeave = () => {
    cancelResize();
  };

  const mouseup = () => {
    cancelResize();
  };

  const mousemove = (e: React.MouseEvent) => {
    const curClientX = e.clientX;
    setPrevClientX(curClientX);

    const offsetX = prevClientX ? curClientX - prevClientX : 0;

    if (offsetX !== 0) {
      const targetWidth = e.target.clientWidth;
      updateOffset(offsetX / targetWidth);
    }
  };

  if (!onResize) {
    return null;
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        cursor: 'ew-resize',
        zIndex: MAPPING_WRAPPER_RESIZE_LAYER_ZINDEX,
      }}
      onMouseLeave={mouseLeave}
      onMouseUp={mouseup}
      onMouseMove={mousemove}
    />
  );
};
