import { ANNOTATION_ACTIONS } from '@/store/Actions';
import _ from 'lodash';
import { composeResultWithBasicImgInfo, composeResult } from '@/utils/data';
import { jsonParser } from '@/utils';
import StepUtils from '@/utils/StepUtils';
import AnnotationDataUtils from '@/utils/AnnotationDataUtils';
import { ConfigUtils } from '@/utils/ConfigUtils';
import styleString from '@/constant/styleString';
import { getFormatSize } from '@/components/customResizeHook';
import { AnnotationEngine } from '@sensetime/annotation';
import { AnnotationState, AnnotationActionTypes } from './types';
import { message } from 'antd';

const getStepConfig = (stepList: any[], step: number) => stepList.find((i) => i.step === step);

const initialState: AnnotationState = {
  toolInstance: null,
  imgList: [],
  config: '{}',
  imgIndex: -1,
  basicIndex: 0,
  imgPageSize: 1,
  step: 1,
  stepList: [],
  imgNode: new Image(),
  basicResultList: [],
  resultList: [],
  stepProgress: 0,
};

/**
 * 获取当前文件列表的总页数
 * @param state
 */
export const getTotalPage = (state: AnnotationState) => {
  const { imgList, imgPageSize } = state;
  return Math.ceil(imgList.length / imgPageSize);
};

const calcStepProgress = (fileList: any[], step: number) =>
  fileList.reduce((pre, i) => {
    const resultStr = i.result;
    const resultObject = jsonParser(resultStr);
    if (resultObject[`step_${step}`]) {
      return pre + 1;
    }
    return pre;
  }, 0) / fileList.length;



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

export const loadFileData =
  (nextIndex: number, nextBasicIndex?: number) => async (dispatch: any, getState: any) => {
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

    return new Promise((reslove) => {
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
          nextBasicIndex,
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

    case ANNOTATION_ACTIONS.CALC_STEP_PROGRESS: {
      const { imgList, step } = state;

      const stepProgress = calcStepProgress(imgList, step);

      return {
        ...state,
        stepProgress,
      };
    }

    case ANNOTATION_ACTIONS.SUBMIT_FILE_DATA: {
      const { imgList, imgIndex, step, stepList, toolInstance, onSubmit, resultList } = state;
      const resultString = imgList[imgIndex]?.result || '';
      const [basicImgInfo] = toolInstance.exportData();

      const resultWithBasicInfo = composeResultWithBasicImgInfo(resultString, basicImgInfo);

      const stepProgress = calcStepProgress(imgList, step);

      imgList[imgIndex].result = composeResult(
        resultWithBasicInfo,
        { step, stepList },
        { rect: resultList },
      );

      if (onSubmit) {
        onSubmit([imgList[imgIndex]], action.payload?.submitType, imgIndex);
      }

      return {
        ...state,
        stepProgress,
        imgList,
      };
    }

    case ANNOTATION_ACTIONS.SUBMIT_RESULT: {
      const { imgList, basicIndex, resultList, annotationEngine, basicResultList } = state;
      const [exportResult] = annotationEngine.toolInstance.exportData();

      let previousResultList = exportResult;

      if (basicResultList.length > 0) {
        const sourceID = basicResultList[basicIndex]?.id;
        const newResultData = exportResult.map((i: any) => ({ ...i, i, sourceID }));
        previousResultList = _.cloneDeep(resultList).filter((i: any) => i.sourceID !== sourceID);
        previousResultList.push(...newResultData);
      }

      return {
        ...state,
        resultList: previousResultList,
        imgList,
      };
    }

    case ANNOTATION_ACTIONS.SET_BASIC_INDEX: {
      const {
        toolInstance,
        step,
        imgList,
        imgIndex,
        stepList,
        annotationEngine,
        resultList,
        basicResultList,
      } = state;
      const nextBasicIndex = action.payload.basicIndex;
      const sourceID = basicResultList[nextBasicIndex]?.id;

      const fileResult = jsonParser(imgList[imgIndex]?.result);
      const result = (resultList || []).filter((i) => i.sourceID === sourceID);

      const stepConfig = getStepConfig(stepList, step);

      const { dataSourceStep, tool } = stepConfig;
      const dependStepConfig = getStepConfig(stepList, dataSourceStep);
      let stepBasicResultList = [];

      if (dataSourceStep && tool) {
        stepBasicResultList = fileResult[`step_${dataSourceStep}`].result;

        if (stepBasicResultList.length > 0) {
          annotationEngine.setBasicInfo(dependStepConfig.tool, stepBasicResultList[nextBasicIndex]);
        } else {
          annotationEngine.setBasicInfo();
          message.info('当前文件不存在依赖数据');
        }
      }

      toolInstance.setResult(result);

      toolInstance.history.initRecord(result, true);

      return {
        ...state,
        basicIndex: nextBasicIndex,
      };
    }

    case ANNOTATION_ACTIONS.LOAD_FILE_DATA: {
      const { imgList, step, toolInstance, annotationEngine, stepList } = state;
      if (!toolInstance) {
        return state;
      }

      const { nextIndex, imgNode, nextBasicIndex } = action.payload;
      const basicIndex = nextBasicIndex ?? 0;

      const fileResult = jsonParser(imgList[nextIndex]?.result);

      const stepResult = fileResult[`step_${step}`];

      const isInitData = !stepResult; // 是否为初始化数据

      const basicImgInfo = {
        rotate: fileResult.rotate ?? 0,
        valid: fileResult.valid ?? true,
      };

      toolInstance.setImgNode(imgNode, basicImgInfo);
      annotationEngine.setImgNode(imgNode);
      let result = stepResult?.result || [];
      const stepConfig = getStepConfig(stepList, step);

      const { dataSourceStep, tool } = stepConfig;
      const dependStepConfig = getStepConfig(stepList, dataSourceStep);
      let stepBasicResultList = [];

      if (dataSourceStep && tool) {
        stepBasicResultList = fileResult[`step_${dataSourceStep}`].result;

        if (stepBasicResultList.length > 0) {
          annotationEngine.setBasicInfo(dependStepConfig.tool, stepBasicResultList[basicIndex]);
          const sourceID = stepBasicResultList[basicIndex].id;

          result = result.filter((i: { sourceID: string|number; }) => i.sourceID === sourceID);
        } else {
          // TODO: 禁用绘制交互
          message.info('当前文件不存在依赖数据');
        }
      }

      toolInstance.setResult(result, isInitData);
      toolInstance.history.initRecord(result, true);

      return {
        ...state,
        imgIndex: nextIndex,
        basicIndex,
        basicResultList: stepBasicResultList,
        resultList: stepResult?.result || [],
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

    case ANNOTATION_ACTIONS.SET_STEP: {
      const { stepList, annotationEngine } = state;
      const { toStep } = action.payload;

      if (toStep <= stepList.length) {
        const stepConfig = getStepConfig(stepList, toStep);
        annotationEngine.setToolName(stepConfig.tool, stepConfig.config);

        return {
          ...state,
          step: toStep,
          toolInstance: annotationEngine.toolInstance,
        };
      }
    }

    // eslint-disable-next-line no-fallthrough
    default:
      return state;
  }
};
