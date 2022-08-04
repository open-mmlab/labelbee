/**
 * @file Annotation related hook
 * @createDate 2022-08-04
 * @author Ron <ron.f.luo@gmail.com>
 */
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { ANNOTATION_ACTIONS } from '@/store/Actions';

/**
 * Custom an empty toolInstance to adapt old use.
 * @returns 
 */
const useCustomToolInstance = () => {
  const dispatch = useDispatch();
  const toolInstanceRef = useRef({
    exportData: () => {
      return [[], {}];
    },
    singleOn: () => { },
    setResult: () => {
      // Rerender Data
    },
    history: {
      initRecord: () => { },
    },
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
    toolInstanceRef
  }
}

export { useCustomToolInstance }
