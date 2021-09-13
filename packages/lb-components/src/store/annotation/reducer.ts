import { ANNOTATION_ACTIONS } from '@/store/Actions';
import _ from 'lodash';
import { EPageTurningOperation } from '@/data/enums/AnnotationSize';
import { composeResultWithBasicImgInfo, composeResult } from '@/utils/data';
import { jsonParser } from '@/utils';
import StepUtils from '@/utils/StepUtils';
import AnnotationDataUtils from '@/utils/AnnotationDataUtils';
import { EToolName } from '@/data/enums/ToolType';
import { ConfigUtils } from '@/utils/ConfigUtils';
import styleString from '@/constant/styleString';
import { getFormatSize } from '@/components/customResizeHook';
import { toolUtils, AnnotationEngine } from '@sensetime/annotation';
import { ESubmitType } from '@/constant';
import { AnnotationState, AnnotationActionTypes, ToolInstance } from './types';

const { getCurrentOperation } = toolUtils;

const initialState: AnnotationState = {
  toolInstance: null,
  imgList: [],
  config: '{}',
  imgIndex: -1,
  imgPageSize: 1,
  step: 1,
  stepList: [],
  imgNode: new Image(),
};

const getNewImgIndex = (
  state: AnnotationState,
  pageTurningOperation: EPageTurningOperation,
  index?: number,
) => {
  const { imgIndex } = state;
  const totalPage = getTotalPage(state);
  let newIndex = index !== undefined ? index : imgIndex;
  switch (pageTurningOperation) {
    case EPageTurningOperation.Forward:
      newIndex = imgIndex + 1;
      break;
    case EPageTurningOperation.Backward:
      newIndex = imgIndex - 1;
      break;
    case EPageTurningOperation.Jump:
      break;
  }

  if (_.inRange(newIndex, 0, totalPage)) {
    return newIndex;
  }

  return imgIndex;
};

/**
 * 获取当前文件列表的总页数
 * @param state
 */
export const getTotalPage = (state: AnnotationState) => {
  const { imgList, imgPageSize } = state;
  return Math.ceil(imgList.length / imgPageSize);
};

const pageChanged = (dispatch: any, nextIndex: number, submitType: ESubmitType) => [
  dispatch({ type: ANNOTATION_ACTIONS.SUBMIT_FILE_DATA, payload: { submitType } }),
  dispatch(loadFileData(nextIndex)),
];

export const pageBackwardActions = () => (dispatch: any, getState: any) => {
  const nextIndex = getNewImgIndex(getState().annotation, EPageTurningOperation.Backward);
  return pageChanged(dispatch, nextIndex, ESubmitType.Backward);
};

export const pageForwardActions = () => (dispatch: any, getState: any) => {
  const nextIndex = getNewImgIndex(getState().annotation, EPageTurningOperation.Forward);
  return pageChanged(dispatch, nextIndex, ESubmitType.Forward);
};

export const pageJumpActions = (nIndex: number) => (dispatch: any, getState: any) => {
  const { annotation } = getState();

  if (nIndex === annotation.imgIndex) {
    return;
  }

  const nextIndex = getNewImgIndex(annotation, EPageTurningOperation.Jump, nIndex);
  return pageChanged(dispatch, nextIndex, ESubmitType.Jump);
};


const updateToolInstance = (annotation: AnnotationState, imgNode: HTMLImageElement) => {
  const { step, stepList } = annotation;
  const stepConfig = StepUtils.getCurrentStepInfo(step, stepList);
  const config = ConfigUtils.jsonParser(stepConfig.config);

  const container = document.getElementById('toolContainer');

  if (!container) {
    throw `Not exist dom named id-toolContainer`;
  }

  const canvasSize = getFormatSize({ width: window.innerWidth, height: window.innerHeight });
  const annotationEngine = new AnnotationEngine({
    container,
    toolName: stepConfig.tool,
    size: canvasSize,
    imgNode,
    config,
    style: JSON.parse(styleString),
  });

  return { toolInstance: annotationEngine.toolInstance, annotationEngine };
};

export const loadFileData = (nextIndex: number) => async (dispatch: any, getState: any) => {
  const { getFileData, imgList } = getState().annotation;
  /** 支持外部传入获取文件接口 */
  if (getFileData) {
    const fileData = await getFileData(imgList[nextIndex], nextIndex);

    dispatch({
      type: ANNOTATION_ACTIONS.SET_FILE_DATA,
      payload: {
        fileData,
        index: nextIndex,
      },
    });
  }

  const { url } = imgList[nextIndex];

  return new Promise((reslove, reject) => {
    const imgNode = new Image();
    imgNode.src = url;
    imgNode.onload = () => {
      reslove(imgNode);
    };
  }).then((imgNode) => {
    dispatch({
      type: ANNOTATION_ACTIONS.LOAD_FILE_DATA,
      payload: {
        imgNode,
        nextIndex,
      },
    });
  });
};

export const annotationReducer = (
  state = initialState,
  action: AnnotationActionTypes,
): AnnotationState => {
  switch (action.type) {
    case ANNOTATION_ACTIONS.UPDATE_TOOL_INSTANCE: {
      return {
        ...state,
        toolInstance: action.payload.toolInstance,
      };
    }

    case ANNOTATION_ACTIONS.UPDATE_IMG_LIST: {
      return {
        ...state,
        imgList: action.payload.imgList,
      };
    }

    case ANNOTATION_ACTIONS.SUBMIT_FILE_DATA: {
      const { imgList, imgIndex, step, stepList, toolInstance, onSubmit } = state;
      const resultString = imgList[imgIndex]?.result || '';
      const [exportResult, basicImgInfo] = toolInstance.exportData();
      const resultWithBasicInfo = composeResultWithBasicImgInfo(resultString, basicImgInfo);
      imgList[imgIndex].result = composeResult(
        resultWithBasicInfo,
        { step, stepList },
        { rect: exportResult },
      );

      if (onSubmit) {
        onSubmit([imgList[imgIndex]], action.payload?.submitType, imgIndex);
      }

      return {
        ...state,
        imgList,
      };
    }

    case ANNOTATION_ACTIONS.LOAD_FILE_DATA: {
      const { imgList, step, toolInstance, annotationEngine } = state;
      if (!toolInstance) {
        return state;
      }

      const { nextIndex, imgNode } = action.payload;
      const fileResult = jsonParser(imgList[nextIndex]?.result);
      const stepResult = fileResult[`step_${step}`];
      const isInitData = !stepResult; // 是否为初始化数据

      const basicImgInfo = {
        rotate: fileResult.rotate ?? 0,
        valid: fileResult.valid ?? true,
      };

      toolInstance.setImgNode(imgNode, basicImgInfo);
      annotationEngine.setImgNode(imgNode);
      const result = stepResult?.result || [];
      toolInstance.setResult(result, isInitData);

      // 拉框工具
      annotationEngine.setBasicInfo(EToolName.Rect,{ width: 100, height: 100, x: 10, y: 10} )

      // 多边形工具
      // annotationEngine.setBasicInfo(EToolName.Polygon, {
      //   pointList: [
      //     { x: 123, y: 123 },
      //     { x: 523, y: 423 },
      //     { x: 233, y: 443 },
      //   ],
      // });

      toolInstance.history.initRecord(result, true);

      return {
        ...state,
        imgIndex: nextIndex,
      };
    }

    case ANNOTATION_ACTIONS.PAGE_FORWARD: {
      return {
        ...state,
        imgIndex: getNewImgIndex(state, EPageTurningOperation.Forward),
      };
    }

    case ANNOTATION_ACTIONS.PAGE_BACKWARD: {
      return {
        ...state,
        imgIndex: getNewImgIndex(state, EPageTurningOperation.Backward),
      };
    }

    case ANNOTATION_ACTIONS.PAGE_JUMP: {
      const { imgIndex } = action.payload;
      if (imgIndex === state.imgIndex) {
        return state;
      }

      return {
        ...state,
        imgIndex: getNewImgIndex(state, EPageTurningOperation.Jump, imgIndex),
      };
    }

    case ANNOTATION_ACTIONS.UPDATE_ANNOTATION_CONFIG: {
      return {
        ...state,
        config: action.payload.config ?? '{}',
      };
    }

    case ANNOTATION_ACTIONS.SET_TASK_CONFIG: {
      const { stepList, step } = action.payload;
      return {
        ...state,
        stepList,
        step,
      };
    }

    case ANNOTATION_ACTIONS.INIT_TOOL: {
      const { imgNode } = state;
      const { toolInstance, annotationEngine } = updateToolInstance(state, imgNode);
      return {
        ...state,
        toolInstance,
        annotationEngine,
      };
    }

    case ANNOTATION_ACTIONS.UPDATE_ON_SUBMIT: {
      return {
        ...state,
        onSubmit: action.payload.onSubmit,
      };
    }

    case ANNOTATION_ACTIONS.UPDATE_GET_FILE_DATA: {
      return {
        ...state,
        getFileData: action.payload.getFileData,
      };
    }

    case ANNOTATION_ACTIONS.SET_FILE_DATA: {
      const { fileData, index } = action.payload;
      const { imgList } = state;
      imgList[index] = { ...imgList[index], ...fileData };

      return {
        ...state,
        imgList,
      };
    }

    case ANNOTATION_ACTIONS.UPDATE_ROTATE: {
      const { toolInstance } = state;
      toolInstance?.updateRotate();

      return state;
    }

    case ANNOTATION_ACTIONS.COPY_BACKWARD_RESULT: {
      const { toolInstance, imgIndex, imgList, step } = state;
      if (imgIndex === 0 || imgIndex >= imgList.length) {
        console.error('无法复制边界外的内容');
        return state;
      }
      const backwardResult = imgList[imgIndex - 1].result;
      if (!backwardResult) {
        return state;
      }

      const newResult = AnnotationDataUtils.copyResultChange(
        backwardResult,
        step,
        imgList[imgIndex].result ?? '',
      );
      imgList[imgIndex].result = newResult;

      // 更新当前的结果
      const fileResult = jsonParser(newResult);
      const stepResult = fileResult[`step_${step}`];
      const result = stepResult?.result || [];

      toolInstance.setResult(result);
      toolInstance.history.pushHistory(result);

      return {
        ...state,
        imgList: [...imgList],
      };
    }

    default:
      return state;
  }
};
