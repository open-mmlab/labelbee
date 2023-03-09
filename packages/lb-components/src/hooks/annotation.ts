/**
 * @file Annotation related hook
 * @createDate 2022-08-04
 * @author Ron <ron.f.luo@gmail.com>
 */
import { useEffect, useRef } from 'react';
import { useDispatch } from '@/store/ctx';
import { ANNOTATION_ACTIONS } from '@/store/Actions';

export interface ICustomToolInstance {
  valid: boolean;
  exportData: () => [any[], {}];
  exportCustomData: () => {};
  singleOn: () => void;
  clearResult: () => void;
  on: () => void;
  unbind: () => void;
  setResult: () => void;
  setValid: (valid: boolean) => void;
  history: {
    initRecord: (action: any) => void;
    pushHistory: (action: any) => void;
  };
  setDefaultAttribute: (attribute: string) => void;
  setForbidOperation: (forbidOperation: boolean) => void;
  setShowDefaultCursor: (forbidOperation: boolean) => void;

  // PointCloud Exclusive function
  setSubAttribute: (key: string, value: string) => void;

  updateRotate: () => void;

  undo: () => void,
  redo: () => void,

  [str: string]: any;
}

export interface ICustomToolInstanceProps {
  basicInfo?: { [v: string]: any };
}

/**
 * @returns
 * Custom an empty toolInstance to adapt old use.
 */
const useCustomToolInstance = ({ basicInfo }: ICustomToolInstanceProps = {}) => {
  const dispatch = useDispatch();
  const toolInstanceRef = useRef<ICustomToolInstance>({
    valid: basicInfo?.valid ?? true,
    exportData: () => {
      return [[], {}];
    },
    exportCustomData: () => {
      return {};
    },
    clearResult: () => {},
    singleOn: () => {},
    on: () => {},
    unbind: () => {},
    setResult: () => {
      // Rerender Data
    },
    history: {
      initRecord: () => {},
      pushHistory: () => {},
    },
    setDefaultAttribute: (attribute: string) => {},
    setForbidOperation: () => {},
    setShowDefaultCursor: () => {},

    // PointCloud Exclusive function
    setSubAttribute: (key: string, value: string) => {},
    setValid: () => {},
    updateRotate: () => {},
    redo: () => {},
    undo: () => {},
  });

  const onMounted = (instance: any) => {
    dispatch({
      type: ANNOTATION_ACTIONS.SET_TOOL,
      payload: {
        instance,
      },
    });
  };

  const onUnmounted = () => {
    dispatch({
      type: ANNOTATION_ACTIONS.SET_TOOL,
      payload: {
        instance: undefined,
      },
    });
  };

  useEffect(() => {
    // Initial toolInstance
    onMounted(toolInstanceRef.current);
    return () => {
      onUnmounted();
    };
  }, []);

  return {
    toolInstanceRef,
  };
};

export { useCustomToolInstance };
