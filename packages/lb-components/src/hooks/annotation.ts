/**
 * @file Annotation related hook
 * @createDate 2022-08-04
 * @author Ron <ron.f.luo@gmail.com>
 */
import { useEffect, useRef } from 'react';
import { useDispatch } from '@/store/ctx';
import { ANNOTATION_ACTIONS } from '@/store/Actions';
import { EPointCloudPattern } from '@labelbee/lb-utils';

export interface ICustomToolInstance {
  valid: boolean;
  exportData: () => [any, {}];
  exportCustomData: () => {};
  singleOn: (eventName: string, callback: (...args: any[]) => void) => void;
  clearResult: () => void;
  on: (eventName: string, callback: (...args: any[]) => void) => void;
  unbind: () => void;
  setResult: (result: any) => void;
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

  undo: () => void;
  redo: () => void;
  setPointCloudGlobalPattern: (globalPattern: EPointCloudPattern) => void;

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
  const initialCustomToolInstance: ICustomToolInstance = {
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
    setPointCloudGlobalPattern: (globalPattern: EPointCloudPattern) => {},
  };

  const toolInstanceRef = useRef<ICustomToolInstance>(initialCustomToolInstance);

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

  const clearToolInstance = () => {
    Object.assign(toolInstanceRef.current, initialCustomToolInstance);
  };

  const initEventEmitter = () => {
    toolInstanceRef.current.emit = (event: string) => {
      const listener = toolInstanceRef.current.fns.get(event);
      if (listener) {
        listener.forEach((fn: any) => {
          if (fn) {
            fn?.();
          }
        });
      }
    }
    toolInstanceRef.current.fns = new Map()
    toolInstanceRef.current.singleOn = (event: string, func: () => void) => {
      toolInstanceRef.current.fns.set(event, [func]);
    };

    toolInstanceRef.current.on = (event: string, func: () => void) => {
      toolInstanceRef.current.singleOn(event, func);
    };

    toolInstanceRef.current.unbindAll = (eventName: string) => {
      toolInstanceRef.current.fns.delete(eventName);
    };
  }

  useEffect(() => {
    // Initial toolInstance
    initEventEmitter()
    onMounted(toolInstanceRef.current);
    return () => {
      onUnmounted();
    };
  }, []);

  return {
    toolInstanceRef,
    clearToolInstance,
    initEventEmitter,
  };
};

export { useCustomToolInstance };
