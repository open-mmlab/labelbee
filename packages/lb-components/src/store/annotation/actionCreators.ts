import { ANNOTATION_ACTIONS } from '@/store/Actions';
import { IStepInfo } from '@/types/step';
import {
  GetFileData,
  LoadFileList,
  IFileItem,
  OnPageChange,
  OnSave,
  OnStepChange,
  OnSubmit,
  GetImgIndexByExternal,
} from '@/types/data';
import { AnnotationActionTypes, ToolInstance } from './types';
import { LoadFileAndFileData, getStepConfig } from './reducer';
import { ESubmitType } from '@/constant';
import { EPageTurningOperation } from '@/data/enums/AnnotationSize';
import PageOperator from '@/utils/PageOperator';
import { jsonParser } from '@/utils';
import { IPointCloudBox } from '@labelbee/lb-utils';
import { getBoxesByTrackID } from '@/components/predictTracking/previewResult/util';
import { IPreDataProcessParams } from '@/App';

const dispatchTasks = (dispatch: any, tasks: any[]) => tasks.map((task) => dispatch(task));

/**
 * @param {pageTurningOperation} pageTurningOperation 翻页操作
 * @returns {ESubmitType} 提数据交类型
 */
const getSubmitByPageOperation = (pageTurningOperation: EPageTurningOperation) => {
  if (pageTurningOperation === EPageTurningOperation.Forward) {
    return ESubmitType.Forward;
  }

  if (pageTurningOperation === EPageTurningOperation.Backward) {
    return ESubmitType.Backward;
  }

  if (pageTurningOperation === EPageTurningOperation.Jump) {
    return ESubmitType.Jump;
  }

  return ESubmitType.Forward;
};

const getBasicIndex = (annotationStore: any, basicIndex: number) => {
  const { imgList, imgIndex } = annotationStore;
  const { dataSourceStep } = getStepConfig(annotationStore.stepList, annotationStore.step);
  let backwardResult = jsonParser(imgList[imgIndex - 1]?.result);
  const index = backwardResult[`step_${dataSourceStep}`]?.result?.length - 1;
  return index || basicIndex;
};

export function UpdateToolInstance(toolInstance: ToolInstance): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.UPDATE_TOOL_INSTANCE,
    payload: {
      toolInstance,
    },
  };
}

export function UpdateImgList(imgList: IFileItem[]): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.UPDATE_IMG_LIST,
    payload: {
      imgList,
    },
  };
}

export function UpdateAnnotationConfig(config: string): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.UPDATE_ANNOTATION_CONFIG,
    payload: {
      config,
    },
  };
}

export function SetTaskStepList({ stepList }: { stepList: IStepInfo[] }): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.SET_TASK_STEP_LIST,
    payload: {
      stepList,
    },
  };
}

export function SetTaskConfig({
  stepList,
  step,
}: {
  stepList: IStepInfo[];
  step: number;
}): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.SET_TASK_CONFIG,
    payload: {
      stepList,
      step,
    },
  };
}

export function UpdateOnSubmit(onSubmit: OnSubmit): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.UPDATE_ON_SUBMIT,
    payload: {
      onSubmit,
    },
  };
}

export function UpdateOnSave(onSave: OnSave): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.UPDATE_ON_SAVE,
    payload: {
      onSave,
    },
  };
}

export function UpdateOnPageChange(onPageChange: OnPageChange): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.UPDATE_ON_PAGE_CHANGE,
    payload: {
      onPageChange,
    },
  };
}

export function UpdateOnStepChange(onStepChange: OnStepChange): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.UPDATE_ON_STEP_CHANGE,
    payload: {
      onStepChange,
    },
  };
}

export function UpdateGetFileData(getFileData: GetFileData): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.UPDATE_GET_FILE_DATA,
    payload: {
      getFileData,
    },
  };
}

export function UpdatePageSize(pageSize: number): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.UPDATE_PAGE_SIZE,
    payload: {
      pageSize,
    },
  };
}

export function UpdateGetFileList(loadFileList: LoadFileList): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.UPDATE_LOAD_FILE_LIST,
    payload: {
      loadFileList,
    },
  };
}

export function UpdateRotate(): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.UPDATE_ROTATE,
  };
}

export function UpdateValid(): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.UPDATE_ANNOTATION_VALID,
  };
}

export function UpdateSkipBeforePageTurning(
  skipBeforePageTurning: (pageTurning: Function) => {},
): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.SKIP_BEFORE_PAGE_TURNING,
    payload: {
      skipBeforePageTurning,
    },
  };
}

export function UpdateBeforeRotate(beforeRotate: () => {}): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.UPDATE_BEFORE_ROTATE,
    payload: {
      beforeRotate,
    },
  };
}

export function UpdatePreDataProcess(preDataProcess: () => {}): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.UPDATE_PRE_DATA_PROCESS,
    payload: {
      preDataProcess,
    },
  };
}

export function CopyBackWordResult(): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.COPY_BACKWARD_RESULT,
  };
}

export function UpdateImgIndexByExternal(
  getImgIndexByExternal: GetImgIndexByExternal,
): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.UPDATE_IMG_INDEX_BY_EXTERNAL,
    payload: {
      getImgIndexByExternal,
    },
  };
}

export function BatchUpdateTrackID({
  id,
  newID,
  rangeIndex,
  imgList,
}: {
  id: number;
  newID: number;
  rangeIndex: [number, number];
  imgList: IFileItem[];
}): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.BATCH_UPDATE_TRACK_ID,
    payload: {
      id,
      newID,
      rangeIndex,
      imgList,
    },
  };
}

export function BatchUpdateResultByTrackID(
  id: number, // originData
  newData: Partial<IPointCloudBox>,
  rangeIndex: [number, number],
  imgList: IFileItem[],
): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.BATCH_UPDATE_RESULT_BY_TRACK_ID,
    payload: {
      id,
      newData,
      rangeIndex,
      imgList,
    },
  };
}

export function BatchUpdateImgListResultByPredictResult(): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.BATCH_UPDATE_IMG_LIST_RESULT_BY_PREDICT_RESULT,
    payload: {},
  };
}

export const UpdateCheckMode = (checkMode: boolean): AnnotationActionTypes => {
  return {
    type: ANNOTATION_ACTIONS.SET_CHECK_MODE,
    payload: {
      checkMode,
    },
  };
};

export const UpdateHighlightAttribute = (attribute: string): AnnotationActionTypes => {
  return {
    type: ANNOTATION_ACTIONS.SET_HIGHLIGHT_ATTRIBUTE,
    payload: {
      attribute,
    },
  };
};

/**
 * 初始化任务数据
 * @param param0
 */
export function InitTaskData({
  onSubmit,
  onSave,
  onPageChange,
  onStepChange,
  getFileData,
  pageSize,
  loadFileList,
  step,
  stepList,
  skipBeforePageTurning,
  beforeRotate,
  checkMode,
  highlightAttribute,
  preDataProcess,
  getImgIndexByExternal,
}: any): any {
  const tasks: any[] = [];

  if (onSubmit) {
    tasks.push(UpdateOnSubmit(onSubmit));
  }
  if (onSave) {
    tasks.push(UpdateOnSave(onSave));
  }
  if (onPageChange) {
    tasks.push(UpdateOnPageChange(onPageChange));
  }

  if (onStepChange) {
    tasks.push(UpdateOnStepChange(onStepChange));
  }

  if (getFileData) {
    tasks.push(UpdateGetFileData(getFileData));
  }

  if (loadFileList) {
    tasks.push(UpdateGetFileList(loadFileList));
  }

  if (pageSize) {
    tasks.push(UpdatePageSize(pageSize));
  }

  if (skipBeforePageTurning) {
    tasks.push(UpdateSkipBeforePageTurning(skipBeforePageTurning));
  }

  if (beforeRotate) {
    tasks.push(UpdateBeforeRotate(beforeRotate));
  }

  if (preDataProcess) {
    tasks.push(UpdatePreDataProcess(preDataProcess));
  }

  if (typeof checkMode === 'boolean') {
    tasks.push(UpdateCheckMode(checkMode));
  }

  if (getImgIndexByExternal) {
    tasks.push(UpdateImgIndexByExternal(getImgIndexByExternal));
  }

  tasks.push(UpdateHighlightAttribute(highlightAttribute));

  tasks.push(SetTaskConfig({ stepList, step }));

  tasks.push({
    type: ANNOTATION_ACTIONS.CALC_STEP_PROGRESS,
  });

  tasks.push({
    type: ANNOTATION_ACTIONS.INIT_TOOL,
  });

  return (dispatch: any) => dispatchTasks(dispatch, tasks);
}

/**
 * 初始化任务数据
 * @param param0
 */
export function UpdateInjectFunc({
  onSubmit,
  onSave,
  onPageChange,
  onStepChange,
  getFileData,
  pageSize,
  loadFileList,
  stepList,
  beforeRotate,
  highlightAttribute,
  preDataProcess,
}: any): any {
  const tasks: any[] = [];

  if (onSubmit) {
    tasks.push(UpdateOnSubmit(onSubmit));
  }
  if (onSave) {
    tasks.push(UpdateOnSave(onSave));
  }
  if (onPageChange) {
    tasks.push(UpdateOnPageChange(onPageChange));
  }

  if (onStepChange) {
    tasks.push(UpdateOnStepChange(onStepChange));
  }

  if (getFileData) {
    tasks.push(UpdateGetFileData(getFileData));
  }

  if (loadFileList) {
    tasks.push(UpdateGetFileList(loadFileList));
  }

  if (pageSize) {
    tasks.push(UpdatePageSize(pageSize));
  }

  if (beforeRotate) {
    tasks.push(UpdateBeforeRotate(beforeRotate));
  }

  if (preDataProcess) {
    tasks.push(UpdatePreDataProcess(preDataProcess));
  }

  tasks.push(UpdateHighlightAttribute(highlightAttribute));

  tasks.push(SetTaskStepList({ stepList }));

  return (dispatch: any) => dispatchTasks(dispatch, tasks);
}

/** 获取下一步的step */
const getNextStep = (step: number, stepList: any) => {
  const currentStepIndex = stepList?.findIndex((element: any) => element?.step === step);
  return stepList[currentStepIndex + 1]?.step;
};

/** 切换到下一步 */
export const ToNextStep = (pageNumber?: number) => (dispatch: any, getState: any) => {
  const { annotation } = getState();
  const { step, stepList } = annotation;
  const nextStep = getNextStep(step, stepList);
  return [dispatch(UpdateProcessingStep(nextStep, pageNumber))];
};

/**
 * 更新当前操作的步骤
 * @param {number} toStep
 */
export const UpdateProcessingStep =
  (toStep: number, index?: number) => (dispatch: any, getState: any) => {
    const { annotation } = getState();
    annotation?.onStepChange?.(toStep);
    const imgIndex = annotation?.imgIndex ?? 0;
    return [
      dispatch({ type: ANNOTATION_ACTIONS.SUBMIT_RESULT }),
      dispatch({
        type: ANNOTATION_ACTIONS.SUBMIT_FILE_DATA,
        payload: { submitType: ESubmitType.StepChanged },
      }),
      // ToSubmitFileData(ESubmitType.StepChanged),
      dispatch({ type: ANNOTATION_ACTIONS.SET_STEP, payload: { toStep } }),
      dispatch({ type: ANNOTATION_ACTIONS.CALC_STEP_PROGRESS }),
      // 切换步骤保持图片位置
      dispatch(LoadFileAndFileData(index ?? imgIndex, 0)),
    ];
  };

/**
 * 提交当前的文件数据
 * @param submitType
 */
export const ToSubmitFileData = (submitType: ESubmitType) => (dispatch: any) =>
  [
    dispatch({ type: ANNOTATION_ACTIONS.SUBMIT_RESULT }),
    dispatch({ type: ANNOTATION_ACTIONS.SUBMIT_FILE_DATA, payload: { submitType } }),
  ];

/**
 * 提交数据并且切换标注文件
 * @param dispatch
 * @param nextIndex
 * @param submitType
 * @param nextBasicIndex
 */
const SubmitAndChangeFileIndex = async (
  dispatch: any,
  nextIndex: number,
  submitType: ESubmitType,
  nextBasicIndex?: number,
) => {
  dispatch(ToSubmitFileData(submitType));
  await dispatch(SubmitHandler(submitType));
  dispatch(LoadFileAndFileData(nextIndex, nextBasicIndex));
};

const ChangeBasicIndex = (dispatch: any, nextBasicIndex: number) => [
  dispatch({ type: ANNOTATION_ACTIONS.SUBMIT_RESULT }),
  dispatch({ type: ANNOTATION_ACTIONS.SET_BASIC_INDEX, payload: { basicIndex: nextBasicIndex } }),
];

const ChangeTriggerEventAfterIndexChanged = (
  dispatch: any,
  triggerEventAfterIndexChanged: boolean,
) => {
  dispatch({
    type: ANNOTATION_ACTIONS.SET_TRIGGER_EVENT_AFTER_INDEX_CHANGED,
    payload: {
      triggerEventAfterIndexChanged,
    },
  });
};

/** 向前翻页 */
export const PageBackward =
  (triggerEventAfterIndexChanged = false) =>
  (dispatch: any, getState: any) => {
    return DispatcherTurning(
      dispatch,
      getState,
      EPageTurningOperation.Backward,
      triggerEventAfterIndexChanged,
    );
  };

/** 向后翻页 */
export const PageForward =
  (triggerEventAfterIndexChanged = false) =>
  (dispatch: any, getState: any) => {
    return DispatcherTurning(
      dispatch,
      getState,
      EPageTurningOperation.Forward,
      triggerEventAfterIndexChanged,
    );
  };

/**
 * 跳到指定文件索引
 * @param toIndex
 */
export const PageJump =
  (toIndex: number, triggerEventAfterIndexChanged = false) =>
  (dispatch: any, getState: any) => {
    if (toIndex === getState().imgIndex) {
      return;
    }

    return DispatcherTurning(
      dispatch,
      getState,
      EPageTurningOperation.Jump,
      triggerEventAfterIndexChanged,
      toIndex,
    );
  };

/**
 * 加载文件列表
 * @param dispatch
 * @param getState
 * @param nextIndex 需要加载的图片index
 * @param isInitial // 是否为初始化加载
 */
export const loadImgList = async (
  dispatch: any,
  getState: any,
  nextIndex: number,
  isInitial?: boolean,
) => {
  const { loadFileList, imgList, pageSize } = getState().annotation;
  const page = Math.floor(nextIndex / pageSize);
  SetAnnotationLoading(dispatch, true);
  try {
    const res: any = await loadFileList(page, pageSize);
    SetAnnotationLoading(dispatch, false);
    if (!res?.fileList?.length || !res?.total) {
      throw new Error('fileList and total are required');
    }
    const newImgList = isInitial ? new Array(res.total) : [...imgList];
    newImgList.splice(page * pageSize, pageSize, ...res.fileList);
    dispatch({
      type: ANNOTATION_ACTIONS.UPDATE_IMG_LIST,
      payload: {
        imgList: newImgList,
      },
    });
    return true;
  } catch (err) {
    SetAnnotationLoading(dispatch, false);
    console.error(err);
  }
};

/**
 * 判断翻页还是切换依赖数据
 * @param dispatch
 * @param getState
 * @param pageTurningOperation
 * @param toIndex
 */
export const DispatcherTurning = async (
  dispatch: any,
  getState: any,
  pageTurningOperation: EPageTurningOperation,
  triggerEventAfterIndexChanged = false,
  toIndex?: number,
) => {
  const annotationStore = getState().annotation;
  const submitType: ESubmitType = getSubmitByPageOperation(pageTurningOperation);

  let { fileIndexChanged, fileIndex, basicIndexChanged, basicIndex } = PageOperator.getNextPageInfo(
    pageTurningOperation,
    annotationStore,
    toIndex,
  );

  const newIndex = annotationStore?.getImgIndexByExternal?.(annotationStore.imgIndex, submitType);
  if (newIndex !== undefined) {
    fileIndexChanged = true;
    fileIndex = newIndex;
  }

  ChangeTriggerEventAfterIndexChanged(dispatch, triggerEventAfterIndexChanged);

  // 翻页
  if (fileIndexChanged) {
    if (annotationStore.loading) {
      return;
    }
    // 加载图片列表
    if (!annotationStore.imgList[fileIndex]) {
      const isSuccess = await loadImgList(dispatch, getState, fileIndex);
      if (!isSuccess) {
        // 加载失败不往下执行
        return;
      }
    }

    const state = getState();

    annotationStore.onPageChange?.(fileIndex);
    const index =
      submitType === ESubmitType.Backward
        ? getBasicIndex(state.annotation, basicIndex)
        : basicIndex;

    return SubmitAndChangeFileIndex(dispatch, fileIndex, submitType, index);
  }

  if (basicIndexChanged) {
    return ChangeBasicIndex(dispatch, basicIndex);
  }

  return dispatch(ToSubmitFileData(submitType));
};

/**
 * 保存当前页数据
 * */
export const ChangeSave = (dispatch: Function) => {
  dispatch(ToSubmitFileData(ESubmitType.Save));
  dispatch({ type: ANNOTATION_ACTIONS.SAVE_RESULT });
};

export const SetAnnotationLoading = (dispatch: Function, loading: boolean) => {
  dispatch({
    type: ANNOTATION_ACTIONS.SET_LOADING,
    payload: {
      loading,
    },
  });
};

export const SetLoadPCDFileLoading = (dispatch: Function, loadPCDFileLoading: boolean) => {
  dispatch({
    type: ANNOTATION_ACTIONS.SET_LOADPCDFILE_LOADING,
    payload: {
      loadPCDFileLoading,
    },
  });
};

export const InitAnnotationState = (dispatch: Function) => {
  dispatch({
    type: ANNOTATION_ACTIONS.INIT_ALL_STATE,
    payload: {},
  });
};

export const SetPredictResult = (dispatch: Function, result: any) => {
  dispatch({
    type: ANNOTATION_ACTIONS.SET_PREDICT_RESULT,
    payload: {
      result,
    },
  });
};

export const SetPredictResultVisible = (dispatch: Function, visible: boolean) => {
  dispatch({
    type: ANNOTATION_ACTIONS.SET_PREDICT_RESULT_VISIBLE,
    payload: {
      visible,
    },
  });
};

export const GetBoxesByID =
  (selectedBoxTrackID: number, selectedBoxID: string) =>
  (dispatch: any, getState: any): IPointCloudBox[] => {
    const { imgList, step } = getState().annotation;
    return getBoxesByTrackID(imgList, step, selectedBoxTrackID, selectedBoxID);
  };

export const PreDataProcess =
  (params: IPreDataProcessParams) =>
  (dispatch: any, getState: any): IPointCloudBox[] => {
    const { annotation } = getState();
    return annotation?.preDataProcess?.(params) ?? params.dataList;
  };

export const SubmitHandler = (submitType: ESubmitType) => async (dispatch: any, getState: any) => {
  const { annotation } = getState();
  const { onSubmit, imgIndex, imgList } = annotation;

  if (!onSubmit) {
    return;
  }

  await onSubmit([imgList[imgIndex]], submitType, imgIndex, imgList);
};
