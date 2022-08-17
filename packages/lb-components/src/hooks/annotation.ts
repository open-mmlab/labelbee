/**
 * @file Annotation related hook
 * @createDate 2022-08-04
 * @author Ron <ron.f.luo@gmail.com>
 */
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { ANNOTATION_ACTIONS } from '@/store/Actions';

export interface ICustomToolInstance {
  exportData: () => [any[], {}];
  singleOn: () => void;
  setResult: () => void;
  history: {
    initRecord: () => void;
  };
  setDefaultAttribute: (attribute: string) => void;

  // PointCloud Exclusive function
  setSubAttribute: (key: string, value: string) => void;
}

/**
 * Custom an empty toolInstance to adapt old use.
 * @returns
 */
const useCustomToolInstance = () => {
  const dispatch = useDispatch();
  const toolInstanceRef = useRef<ICustomToolInstance>({
    exportData: () => {
      return [[], {}];
    },
    singleOn: () => {},
    setResult: () => {
      // Rerender Data
    },
    history: {
      initRecord: () => {},
    },
    setDefaultAttribute: (attribute: string) => {},

    // PointCloud Exclusive function
    setSubAttribute: (key: string, value: string) => {},
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
