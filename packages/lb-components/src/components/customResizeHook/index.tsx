import {
  editStepWidth,
  footerHeight,
  headerHeight,
  sidebarWidth,
} from '@/data/enums/AnnotationSize';
import { cKeyCode, toolUtils } from '@labelbee/lb-annotation';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { AppState } from '@/store';
import {
  UpdateRotate,
  PageBackward,
  PageForward,
  UpdateToolInstance,
  CopyBackWordResult,
  // UpdateValid,
} from '@/store/annotation/actionCreators';
import { ISize } from '@/types/main';
import { message } from 'antd';
import { LabelBeeContext } from '@/store/ctx';

const EKeyCode = cKeyCode.default;

export const viewportContext = React.createContext<{
  width: number;
  height: number;
}>({
  width: window.innerWidth,
  height: window.innerHeight,
});

export const ViewportProviderComponent = (props: any) => {
  const {
    children,
    dispatch,
    annotation: { skipBeforePageTurning, checkMode },
  } = props;
  const [width] = useState(window.innerWidth);
  const [height] = useState(window.innerHeight);

  const keydown = (e: KeyboardEvent) => {
    if (!toolUtils.hotkeyFilter(e) || checkMode) {
      return;
    }

    if (!e.shiftKey && !e.ctrlKey) {
      if (e.keyCode === EKeyCode.A) {
        if (skipBeforePageTurning) {
          skipBeforePageTurning(() => dispatch(PageBackward()));
          return;
        }

        dispatch(PageBackward());
      }

      if (e.keyCode === EKeyCode.D) {
        if (skipBeforePageTurning) {
          skipBeforePageTurning(() => dispatch(PageForward()));
          return;
        }
        dispatch(PageForward());
      }
      if (e.keyCode === EKeyCode.R) {
        dispatch(UpdateRotate());
      }

      if (e.keyCode === EKeyCode.C && e.altKey === true) {
        dispatch(CopyBackWordResult());
      }

      // Temporarily hide. Because there is something wrong with i18n.
      // if (e.keyCode === EKeyCode.Y) {
      //   dispatch(UpdateValid());
      // }
    }

    /**
     * Hidden Feature
     *
     * User: Software Engineer
     */
    if (
      e.shiftKey === true &&
      e.ctrlKey === true &&
      e.altKey === true &&
      e.keyCode === EKeyCode.C
    ) {
      message.success('DEVELOPMENT TESTING - Switch Last Two Canvas');
      const newInstance = props.annotation?.annotationEngine.switchLastTwoCanvas();
      if (!newInstance) {
        return;
      }
      dispatch(UpdateToolInstance(newInstance));
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', keydown);

    return () => {
      window.removeEventListener('keydown', keydown);
    };
  }, [props.annotation.annotationEngine, props.annotation.skipBeforePageTurning, checkMode]);

  const size = useMemo(() => ({ width, height }), [width, height]);

  return <viewportContext.Provider value={size}>{children}</viewportContext.Provider>;
};
export const ViewportProvider = connect(
  (state: AppState) => ({
    annotation: state.annotation,
  }),
  null,
  null,
  { context: LabelBeeContext },
)(ViewportProviderComponent);

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
