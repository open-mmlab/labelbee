import {
  editStepWidth,
  footerHeight,
  headerHeight,
  sidebarWidth,
} from '@/data/enums/AnnotationSize';
import { cKeyCode, toolUtils } from '@sensetime/annotation';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { AppState } from '@/store';
import { UpdateRotate, PageBackward, PageForward } from '@/store/annotation/actionCreators';
import { ISize } from '@/types/main';

const EKeyCode = cKeyCode.default;

export const viewportContext = React.createContext<{
  width: number;
  height: number;
}>({
  width: window.innerWidth,
  height: window.innerHeight,
});

export const ViewportProviderComponent = (props: any) => {
  const { children, dispatch } = props;
  const [width] = useState(window.innerWidth);
  const [height] = useState(window.innerHeight);

  // const handleWindowResize = () => {
  //   setWidth(window.innerWidth);
  //   setHeight(window.innerHeight);
  // };

  const keydown = (e: KeyboardEvent) => {
    if (!toolUtils.hotkeyFilter(e)) {
      return;
    }
    if (e.keyCode === EKeyCode.A) {
      dispatch(PageBackward());
    }

    if (e.keyCode === EKeyCode.D) {
      dispatch(PageForward());
    }
    if (e.keyCode === EKeyCode.R) {
      dispatch(UpdateRotate());
    }
  };

  useEffect(() => {
    // window.addEventListener('resize', handleWindowResize);
    window.addEventListener('keydown', keydown);

    return () => {
      // window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('keydown', keydown);
    };
  }, []);

  const size = useMemo(() => ({ width, height }), [width, height]);

  return <viewportContext.Provider value={size}>{children}</viewportContext.Provider>;
};

export const ViewportProvider = connect((state: AppState) => ({
  annotation: state.annotation,
}))(ViewportProviderComponent);

export const useViewport = () => {
  const { width, height } = useContext(viewportContext);
  return { width, height };
};

/**
 * 获取当前 canvas 的大小
 * @param isEdit 是否为编辑模式
 * @param isTips 是否有 tips
 */
export const useCanvasViewPort = (isEdit = false, isTips = false) => {
  const { width, height } = useContext(viewportContext);
  const otherHeight = headerHeight + footerHeight;
  const placeholderHeight = isTips ? 40 + otherHeight + 40 : otherHeight;
  const placeholderWidth = isEdit ? editStepWidth + sidebarWidth : sidebarWidth;

  return {
    width: width - placeholderWidth,
    height: height - placeholderHeight,
  };
};

/**
 * 解析当前 windowSize 下的 canvasSize
 * @param size
 * @param isEdit
 * @param isTips
 */
export const getFormatSize = (windowSize: ISize, isEdit = false, isTips = false) => {
  const { width, height } = windowSize;
  const otherHeight = headerHeight + footerHeight;
  const placeholderHeight = isTips ? 40 + otherHeight + 40 : otherHeight;
  const placeholderWidth = isEdit ? editStepWidth + sidebarWidth : sidebarWidth;

  return {
    width: width - placeholderWidth,
    height: height - placeholderHeight,
  };
};
