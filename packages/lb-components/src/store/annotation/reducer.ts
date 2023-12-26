import { getFormatSize } from '@/components/customResizeHook';
import { ESubmitType } from '@/constant';
import styleString from '@/constant/styleString';
import { ANNOTATION_ACTIONS } from '@/store/Actions';
import { IFileItem } from '@/types/data';
import { IStepInfo } from '@/types/step';
import { jsonParser } from '@/utils';
import AnnotationDataUtils from '@/utils/AnnotationDataUtils';
import { ConfigUtils } from '@/utils/ConfigUtils';
import { composeResult, composeResultWithBasicImgInfo } from '@/utils/data';
import StepUtils from '@/utils/StepUtils';
import ToolUtils from '@/utils/ToolUtils';
import { AnnotationEngine, CommonToolUtils, ImgUtils, MathUtils } from '@labelbee/lb-annotation';
import { i18n, IPointCloudBox, PointCloudUtils } from '@labelbee/lb-utils';
import { Modal } from 'antd';
import { message } from 'antd/es';
import _ from 'lodash';
import { SetAnnotationLoading } from './actionCreators';
import { AnnotationActionTypes, AnnotationState } from './types';
import { EToolName } from '@/data/enums/ToolType';

export const getStepConfig = (stepList: any[], step: number) =>
  stepList.find((i) => i.step === step);

const initialState: AnnotationState = {
  annotationEngine: null,
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
  loading: false,
  loadPCDFileLoading: true,
  triggerEventAfterIndexChanged: false,

  pointCloudLoading: false,
  checkMode: false,
  predictionResult: [],
  predictionResultVisible: false,
  highlightAttribute: '',
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
    if (i) {
      const resultStr = i.result;
      const resultObject = jsonParser(resultStr);
      if (resultObject[`step_${step}`]) {
        return pre + 1;
      }
    }
    return pre;
  }, 0) / fileList.length;

const updateToolInstance = (annotation: AnnotationState, imgNode: HTMLImageElement) => {
  const { step, stepList } = annotation;
  const stepConfig = StepUtils.getCurrentStepInfo(step, stepList);
  const config = ConfigUtils.jsonParser(stepConfig.config);

  // 音频、视频工具不支持实例化
  if (ToolUtils.isVideoTool(stepConfig?.tool) || ToolUtils.isAudioTool(stepConfig?.tool)) {
    return;
  }


  // TODO: 点云实例化对接
  if (ToolUtils.isPointCloudTool(stepConfig?.tool)) {
    return;
  }

  if (EToolName.LLM === stepConfig?.tool) {
    return;
  }

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

  return { toolInstance: annotationEngine?.toolInstance, annotationEngine };
};

/**
 * 初始化imgNode并加载数据
 * @param nextIndex
 * @param nextBasicIndex
 */
export const LoadFileAndFileData =
  (nextIndex: number, nextBasicIndex?: number): any =>
  async (dispatch: any, getState: any) => {
    const { stepList, step } = getState().annotation;
    const currentIsVideo = StepUtils.currentToolIsVideo(step, stepList);
    const currentIsPointCloud = StepUtils.currentToolIsPointCloud(step, stepList);
    const currentIsLLM = StepUtils.getCurrentStepInfo(step, stepList)?.tool === EToolName.LLM;
    const currentIsAudio = StepUtils.currentToolIsAudio(step, stepList)

    SetAnnotationLoading(dispatch, true);

    await dispatch(TryGetFileDataByAPI(nextIndex));

    if (currentIsVideo || currentIsPointCloud || currentIsLLM || currentIsAudio) {
      dispatch(AfterVideoLoaded(nextIndex));
      return;
    }

    dispatch(AfterImageLoaded(nextIndex, nextBasicIndex));
  };

/**
 * 支持并优先外部传入的获取文件接口
 * @param nextIndex
 */
const TryGetFileDataByAPI = (nextIndex: number) => async (dispatch: any, getState: any) => {
  const { getFileData, imgList } = getState().annotation;

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
};

const AfterVideoLoaded = (nextIndex: number) => (dispatch: any) => {
  SetAnnotationLoading(dispatch, false);

  dispatch({
    type: ANNOTATION_ACTIONS.LOAD_FILE_DATA,
    payload: {
      nextIndex,
    },
  });
};

const AfterImageLoaded =
  (nextIndex: number, nextBasicIndex?: number) => (dispatch: any, getState: any) => {
    const { toolInstance, imgList } = getState().annotation;

    const url = imgList?.[nextIndex]?.url;
    ImgUtils.load(url)
      .then((imgNode: HTMLImageElement) => {
        SetAnnotationLoading(dispatch, false);

        dispatch({
          type: ANNOTATION_ACTIONS.LOAD_FILE_DATA,
          payload: {
            imgNode,
            nextIndex,
            nextBasicIndex,
          },
        });
      })
      .catch(() => {
        SetAnnotationLoading(dispatch, false);
        toolInstance?.setErrorImg();
        dispatch({
          type: ANNOTATION_ACTIONS.LOAD_FILE_DATA,
          payload: {
            nextIndex,
            nextBasicIndex,
          },
        });
      });
  };

export const composeResultByToolInstance = ({
  toolInstance,
  imgList,
  imgIndex,
  stepList,
  step = 1,
}: {
  toolInstance: any;
  imgList: IFileItem[];
  imgIndex: number;
  stepList: IStepInfo[];
  step?: number;
}) => {
  const oldResultString = imgList[imgIndex]?.result || '';
  const [resultList, basicImgInfo, extraData] = toolInstance?.exportData() ?? [];
  const customObject = toolInstance?.exportCustomData?.() ?? {};

  const resultWithBasicInfo = composeResultWithBasicImgInfo(oldResultString, basicImgInfo);
  const newResultString = composeResult(
    resultWithBasicInfo,
    { step, stepList },
    { rect: resultList },
    customObject,
  );

  return imgList.map((v, i) => {
    if (i === imgIndex) {
      return {
        ...v,
        result: newResultString,
        ...extraData,
      };
    }
    return {
      ...v,
    };
  });
};

export const annotationReducer = (
  state = { ...initialState },
  action: AnnotationActionTypes,
): AnnotationState => {
  switch (action.type) {
    case ANNOTATION_ACTIONS.INIT_ALL_STATE: {
      return {
        ...state,
        ...initialState,
      };
    }

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
      if (!toolInstance || !imgList[imgIndex]) {
        return state;
      }

      const oldResultString = imgList[imgIndex]?.result || '';
      const [, basicImgInfo, extraData] = toolInstance?.exportData() ?? [];
      const customObject = toolInstance?.exportCustomData?.() ?? {};

      const resultWithBasicInfo = composeResultWithBasicImgInfo(oldResultString, basicImgInfo);
      const newResultString = composeResult(
        resultWithBasicInfo,
        { step, stepList },
        { rect: resultList },
        customObject,
      );

      const newImgList = state.imgList.map((v, i) => {
        if (i === imgIndex) {
          // Update Result
          const newResult = AnnotationDataUtils.dataCorrection(
            newResultString,
            oldResultString,
            step,
            stepList,
          );

          return {
            ...v,
            result: newResult,
            ...extraData,
          };
        }
        return v;
      });

      // Just for sync imgList
      if (action.payload?.submitType === ESubmitType.SyncImgList) {
        return {
          ...state,
          imgList: newImgList,
        };
      }

      if (onSubmit) {
        onSubmit([newImgList[imgIndex]], action.payload?.submitType, imgIndex, newImgList);
      }

      const stepProgress = calcStepProgress(newImgList, step);
      return {
        ...state,
        stepProgress,
        imgList: newImgList,
      };
    }

    case ANNOTATION_ACTIONS.SAVE_RESULT: {
      const { imgList, imgIndex, onSave } = state;
      onSave?.(imgList[imgIndex], imgIndex, imgList);
      return {
        ...state,
      };
    }

    /**
     * For data storage in dependent states
     *
     * Features:
     * 1. Get Data from ToolInstance (If it use toolInstance)
     * 2. Filter Data By BasicResultList
     */
    case ANNOTATION_ACTIONS.SUBMIT_RESULT: {
      const { imgList, basicIndex, resultList, toolInstance, basicResultList } = state;
      if (!toolInstance) {
        return state;
      }

      const [exportResult] = toolInstance?.exportData() ?? [];
      let previousResultList = exportResult;

      if (basicResultList?.length > 0) {
        const sourceID = basicResultList[basicIndex]?.id;
        const newResultData = exportResult.map((i: any) => ({ ...i, sourceID }));
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

      if (!toolInstance || !annotationEngine) {
        return state;
      }

      const nextBasicIndex = action.payload.basicIndex;
      const sourceID = basicResultList[nextBasicIndex]?.id;

      const fileResult = jsonParser(imgList[imgIndex]?.result);
      const result = (resultList || []).filter((i) => i.sourceID === sourceID);

      const stepConfig = getStepConfig(stepList, step);

      const { dataSourceStep, tool } = stepConfig;
      const dependStepConfig = getStepConfig(stepList, dataSourceStep);
      let stepBasicResultList = [];

      if (dataSourceStep && tool) {
        stepBasicResultList = fileResult[`step_${dataSourceStep}`]?.result;

        if (stepBasicResultList?.length > 0) {
          annotationEngine?.setBasicInfo(
            dependStepConfig.tool,
            stepBasicResultList[nextBasicIndex],
          );
          annotationEngine?.launchOperation();
        } else {
          annotationEngine?.setBasicInfo(dependStepConfig.tool);
          annotationEngine?.forbidOperation();
          message.info(i18n.t('NoDependency'));
        }
      }

      toolInstance?.setResult(result);
      toolInstance?.history.initRecord(result, true);

      return {
        ...state,
        basicIndex: nextBasicIndex,
      };
    }

    case ANNOTATION_ACTIONS.SET_TRIGGER_EVENT_AFTER_INDEX_CHANGED: {
      const { triggerEventAfterIndexChanged } = action.payload;
      return {
        ...state,
        triggerEventAfterIndexChanged: !!triggerEventAfterIndexChanged,
      };
    }

    case ANNOTATION_ACTIONS.LOAD_FILE_DATA: {
      const { imgList, step, toolInstance, annotationEngine, stepList } = state;
      /**
       * TODO
       * Before: !toolInstance || !annotationEngine
       *
       * The roles of toolInstance and annotationEngine need to be clearly distinguished
       */
      if (!toolInstance) {
        return { ...state, imgIndex: action.payload.nextIndex };
      }


      const currentStepInfo = StepUtils.getCurrentStepInfo(step, stepList);

      const { nextIndex, imgNode, nextBasicIndex, imgError } = action.payload;
      const basicIndex = nextBasicIndex ?? 0;

      const fileResult = jsonParser(imgList[nextIndex]?.result);

      const stepResult = fileResult[`step_${currentStepInfo.step}`];

      const isInitData = !stepResult; // 是否为初始化数据

      const basicImgInfo = {
        rotate: fileResult.rotate ?? 0,
        valid: fileResult.valid ?? true,
      };

      if (imgNode && imgError !== true) {
        annotationEngine?.setImgNode(imgNode, basicImgInfo);
      } else {
        // Non-graphical tools to initialize base data

        toolInstance?.setValid(basicImgInfo.valid);
      }

      const stepConfig = getStepConfig(stepList, currentStepInfo.step);

      const { dataSourceStep, tool } = stepConfig;
      const dependStepConfig = getStepConfig(stepList, dataSourceStep);
      const hasDataSourceStep = dataSourceStep && tool;
      const stepBasicResultList = fileResult[`step_${dataSourceStep}`]?.result ?? [];

      const result = AnnotationDataUtils.getInitialResultList(
        stepResult?.result,
        toolInstance,
        stepConfig,
        stepBasicResultList,
        isInitData,
      );

      annotationEngine?.launchOperation();

      if (hasDataSourceStep) {
        if (stepBasicResultList?.length > 0) {
          annotationEngine?.setBasicInfo(dependStepConfig.tool, stepBasicResultList[basicIndex]);
        } else {
          // TODO: 禁用绘制交互，有无依赖之间的操作切换
          annotationEngine?.setBasicInfo(dependStepConfig.tool);
          annotationEngine?.forbidOperation();
          message.info(i18n.t('NoDependency'));
        }
      }

      // TODO，非查看模式才允许添加数据
      if (currentStepInfo.tool !== 'check') {
        const sourceID = stepBasicResultList[basicIndex]?.id ?? '';
        const resultForBasicIndex = hasDataSourceStep
          ? result.filter((i: { sourceID: string | number }) =>
              CommonToolUtils.isSameSourceID(i.sourceID, sourceID),
            )
          : result;
        toolInstance?.history?.initRecord(result, true);
        toolInstance?.setResult(resultForBasicIndex);
      }

      return {
        ...state,
        imgIndex: nextIndex,
        basicIndex,
        basicResultList: stepBasicResultList,
        resultList: result,
      };
    }

    case ANNOTATION_ACTIONS.UPDATE_ANNOTATION_CONFIG: {
      return {
        ...state,
        config: action.payload.config ?? '{}',
      };
    }

    case ANNOTATION_ACTIONS.SET_TASK_STEP_LIST: {
      const { stepList } = action.payload;
      return {
        ...state,
        stepList,
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
      const instance = updateToolInstance(state, imgNode);

      if (instance) {
        const { toolInstance, annotationEngine } = instance;
        return {
          ...state,
          toolInstance,
          annotationEngine,
        };
      }

      return {
        ...state,
      };
    }

    // react hook tool Proprietary operations
    case ANNOTATION_ACTIONS.SET_TOOL: {
      const instance = action.payload?.instance;
      if (instance) {
        return {
          ...state,
          toolInstance: instance,
          // TODO It needs to optimize
          // annotationEngine: {
          //   toolInstance: instance,
          // } as any,
        };
      }

      return {
        ...state,
      };
    }

    case ANNOTATION_ACTIONS.UPDATE_ON_SUBMIT: {
      return {
        ...state,
        onSubmit: action.payload.onSubmit,
      };
    }

    case ANNOTATION_ACTIONS.UPDATE_ON_SAVE: {
      return {
        ...state,
        onSave: action.payload.onSave,
      };
    }

    case ANNOTATION_ACTIONS.UPDATE_ON_PAGE_CHANGE: {
      return {
        ...state,
        onPageChange: action.payload.onPageChange,
      };
    }

    case ANNOTATION_ACTIONS.SET_PREDICT_RESULT: {
      return {
        ...state,
        predictionResult: action.payload.result,
      };
    }

    case ANNOTATION_ACTIONS.SET_PREDICT_RESULT_VISIBLE: {
      return {
        ...state,
        predictionResultVisible: action.payload.visible,
      };
    }

    case ANNOTATION_ACTIONS.UPDATE_ON_STEP_CHANGE: {
      return {
        ...state,
        onStepChange: action.payload.onStepChange,
      };
    }

    case ANNOTATION_ACTIONS.UPDATE_GET_FILE_DATA: {
      return {
        ...state,
        getFileData: action.payload.getFileData,
      };
    }

    case ANNOTATION_ACTIONS.UPDATE_PAGE_SIZE: {
      return {
        ...state,
        pageSize: action.payload.pageSize,
      };
    }

    case ANNOTATION_ACTIONS.UPDATE_LOAD_FILE_LIST: {
      return {
        ...state,
        loadFileList: action.payload.loadFileList,
      };
    }

    case ANNOTATION_ACTIONS.UPDATE_BEFORE_ROTATE: {
      return {
        ...state,
        beforeRotate: action.payload.beforeRotate,
      };
    }

    case ANNOTATION_ACTIONS.UPDATE_PRE_DATA_PROCESS: {
      return {
        ...state,
        preDataProcess: action.payload.preDataProcess,
      };
    }

    case ANNOTATION_ACTIONS.SKIP_BEFORE_PAGE_TURNING: {
      return {
        ...state,
        skipBeforePageTurning: action.payload.skipBeforePageTurning,
      };
    }

    case ANNOTATION_ACTIONS.SET_FILE_DATA: {
      const { fileData, index } = action.payload;
      const { imgList } = state;
      const newImgList = [...imgList];
      newImgList[index] = { ...newImgList[index], ...fileData };

      return {
        ...state,
        imgList: newImgList,
      };
    }

    case ANNOTATION_ACTIONS.UPDATE_ROTATE: {
      const { toolInstance, beforeRotate } = state;

      // DataCheck before rotate.
      if (beforeRotate) {
        if (beforeRotate() === false) {
          return state;
        }
      }

      toolInstance?.updateRotate?.();
      return state;
    }

    case ANNOTATION_ACTIONS.UPDATE_ANNOTATION_VALID: {
      const { toolInstance } = state;
      const valid = toolInstance?.valid ?? true;

      Modal.destroyAll();
      Modal.confirm({
        content: i18n.t(valid ? 'updateValidFromValidToInValid' : 'updateValidFromInValidToValid'),
        onOk: () => {
          toolInstance?.setValid(!valid);
        },
        okText: i18n.t('Confirm'),
        cancelText: i18n.t('Cancel'),
      });

      return state;
    }

    case ANNOTATION_ACTIONS.COPY_BACKWARD_RESULT: {
      const { toolInstance, imgIndex, imgList, step } = state;
      if (!toolInstance) {
        return state;
      }

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
      imgList[imgIndex] = {
        ...imgList[imgIndex],
        result: newResult,
      };

      // 更新当前的结果
      const fileResult = jsonParser(newResult);
      const stepResult = fileResult[`step_${step}`];
      const result = stepResult?.result || [];

      toolInstance?.setResult(result);
      toolInstance?.history.pushHistory(result);

      /**
       * Async PointCloud Data.
       */
      // @ts-ignore
      toolInstance?.asyncData?.(imgList[imgIndex]);
      return {
        ...state,
        imgList: [...imgList],
      };
    }

    case ANNOTATION_ACTIONS.SET_STEP: {
      const { stepList, annotationEngine } = state;
      const { toStep } = action.payload;

      if (!annotationEngine) {
        return state;
      }

      const stepConfig = getStepConfig(stepList, toStep);
      annotationEngine?.setToolName(stepConfig.tool, stepConfig.config);

      return {
        ...state,
        step: toStep,
        toolInstance: annotationEngine?.toolInstance,
      };
    }

    case ANNOTATION_ACTIONS.SET_LOADPCDFILE_LOADING: {
      const { loadPCDFileLoading } = action.payload;

      return {
        ...state,
        loadPCDFileLoading: !!loadPCDFileLoading,
      };
    }

    case ANNOTATION_ACTIONS.SET_LOADING: {
      const { loading } = action.payload;

      return {
        ...state,
        loading: !!loading,
      };
    }

    case ANNOTATION_ACTIONS.SET_POINT_CLOUD_LOADING: {
      const { pointCloudLoading } = action.payload;

      return {
        ...state,
        pointCloudLoading: !!pointCloudLoading,
      };
    }

    case ANNOTATION_ACTIONS.SET_CHECK_MODE: {
      const { checkMode } = action.payload;
      return {
        ...state,
        checkMode: !!checkMode,
      };
    }

    case ANNOTATION_ACTIONS.SET_HIGHLIGHT_ATTRIBUTE: {
      const { attribute } = action.payload;
      return {
        ...state,
        highlightAttribute: attribute,
      };
    }

    case ANNOTATION_ACTIONS.BATCH_UPDATE_TRACK_ID: {
      const { id, newID, rangeIndex, imgList } = action.payload;
      const { imgIndex, onSubmit } = state;

      // Record the updated list.
      const updateImgList: Array<{ newInfo: IFileItem; imgIndex: number }> = [];
      const newImgList = imgList.map((v: IFileItem, i: number) => {
        if (MathUtils.isInRange(i, rangeIndex)) {
          const newInfo = {
            ...v,
            result: PointCloudUtils.batchUpdateTrackID({ id, newID, result: v.result }),
          };

          updateImgList.push({
            imgIndex: i,
            newInfo,
          });

          return newInfo;
        }
        return v;
      });

      // Notify external data changes.
      if (onSubmit) {
        onSubmit([newImgList[imgIndex]], ESubmitType.BatchUpdateTrackID, imgIndex, newImgList, {
          updateImgList,
        });
      }

      return {
        ...state,
        imgList: newImgList,
      };
    }

    case ANNOTATION_ACTIONS.BATCH_UPDATE_RESULT_BY_TRACK_ID: {
      const { id, newData, rangeIndex } = action.payload;
      const { imgList, imgIndex, onSubmit } = state;
      // Record the updated list.
      const updateImgList: Array<{ newInfo: IFileItem; imgIndex: number }> = [];
      const newImgList = imgList.map((v, i) => {
        if (MathUtils.isInRange(i, rangeIndex)) {
          const newInfo = {
            ...v,
            result: PointCloudUtils.batchUpdateResultByTrackID({ id, newData, result: v.result }),
          };

          updateImgList.push({
            imgIndex: i,
            newInfo,
          });

          return newInfo;
        }
        return v;
      });

      // Notify external data changes.
      if (onSubmit) {
        onSubmit([newImgList[imgIndex]], ESubmitType.BatchUpdateTrackID, imgIndex, newImgList, {
          updateImgList,
        });
      }

      return {
        ...state,
        imgList: newImgList,
      };
    }

    case ANNOTATION_ACTIONS.BATCH_UPDATE_IMG_LIST_RESULT_BY_PREDICT_RESULT: {
      const { onSubmit, imgList, stepList, step, predictionResult } = state;

      const tmpMap: {
        [key: number]: IPointCloudBox;
      } = {};

      predictionResult.forEach((element) => {
        const { index } = element;
        tmpMap[index] = _.pick(element, [
          'center',
          'width',
          'height',
          'depth',
          'rotation',
          'id',
          'attribute',
          'valid',
          'trackID',
        ]);
      });

      const stepName = `step_${step}`;
      const updateImgList: Array<{ newInfo: IFileItem; imgIndex: number }> = [];

      const nextImgList = imgList.map((element, index) => {
        if (tmpMap[index]) {
          const elementResult =
            element.result === '{}'
              ? jsonParser(composeResult('', { step, stepList }, { rect: [] }, {}))
              : jsonParser(element.result);

          elementResult[stepName].result.push(tmpMap[index]);

          const newInfo = {
            ...element,
            result: JSON.stringify(elementResult),
          };

          updateImgList.push({
            imgIndex: index,
            newInfo,
          });

          return newInfo;
        }
        return element;
      });

      onSubmit?.(nextImgList, ESubmitType.BatchUpdateImgList, -1, nextImgList, {
        updateImgList,
      });
      return {
        ...state,
        imgList: nextImgList,
      };
    }

    // eslint-disable-next-line no-fallthrough
    default:
      return state;
  }
};
