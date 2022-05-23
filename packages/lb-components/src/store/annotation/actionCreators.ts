import { ANNOTATION_ACTIONS } from '@/store/Actions';
import { IStepInfo } from '@/types/step';
import { GetFileData, IFileItem, OnPageChange, OnSave, OnStepChange, OnSubmit } from '@/types/data';
import { AnnotationActionTypes, ToolInstance } from './types';
import { LoadImageAndFileData, getStepConfig } from './reducer';
import { ESubmitType } from '@/constant';
import { EPageTurningOperation } from '@/data/enums/AnnotationSize';
import PageOperator from '@/utils/PageOperator';
import { jsonParser } from '@/utils';

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
  let backwardResult = jsonParser(imgList[imgIndex - 1].result);
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

export function UpdateRotate(): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.UPDATE_ROTATE,
  };
}

export function CopyBackWordResult(): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.COPY_BACKWARD_RESULT,
  };
}

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
  imgList,
  step,
  stepList,
  initialIndex,
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

  tasks.push(UpdateImgList(imgList));
  tasks.push(SetTaskConfig({ stepList, step }));
  tasks.push({
    type: ANNOTATION_ACTIONS.CALC_STEP_PROGRESS,
  });
  tasks.push({
    type: ANNOTATION_ACTIONS.INIT_TOOL,
  });

  tasks.push(LoadImageAndFileData(initialIndex));

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
      dispatch(LoadImageAndFileData(index ?? imgIndex, 0)),
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
const SubmitAndChangeFileIndex = (
  dispatch: any,
  nextIndex: number,
  submitType: ESubmitType,
  nextBasicIndex?: number,
) => [
  dispatch(ToSubmitFileData(submitType)),
  dispatch(LoadImageAndFileData(nextIndex, nextBasicIndex)),
];

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
 * 判断翻页还是切换依赖数据
 * @param dispatch
 * @param getState
 * @param pageTurningOperation
 * @param toIndex
 */
export const DispatcherTurning = (
  dispatch: any,
  getState: any,
  pageTurningOperation: EPageTurningOperation,
  triggerEventAfterIndexChanged = false,
  toIndex?: number,
) => {
  const annotationStore = getState().annotation;
  const { fileIndexChanged, fileIndex, basicIndexChanged, basicIndex } =
    PageOperator.getNextPageInfo(pageTurningOperation, annotationStore, toIndex);

  const submitType: ESubmitType = getSubmitByPageOperation(pageTurningOperation);

  ChangeTriggerEventAfterIndexChanged(dispatch, triggerEventAfterIndexChanged);

  if (fileIndexChanged) {
    annotationStore.onPageChange?.(fileIndex);
    const index =
      submitType === ESubmitType.Backward ? getBasicIndex(annotationStore, basicIndex) : basicIndex;
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
