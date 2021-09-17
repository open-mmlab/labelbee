import { ANNOTATION_ACTIONS } from '@/store/Actions';
import { IStepInfo } from '@/types/step';
import { IFileItem, OnSubmit, GetFileData } from '@/types/data';
import { AnnotationActionTypes, ToolInstance } from './types';
import { loadFileData } from './reducer';
import { ESubmitType } from '@/constant';
import { EPageTurningOperation } from '@/data/enums/AnnotationSize';
import PageOperator from '@/utils/PageOperator';

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

  tasks.push(loadFileData(initialIndex));

  return (dispatch: any) => dispatchTasks(dispatch, tasks);
}

/** 切换到下一步 */
export const ToNextStep = () => (dispatch: any, getState: any) => {
  const { step } = getState().annotation;
  return [dispatch(UpdateProcessingStep(step + 1))];
};

/**
 * 更新当前操作的步骤
 * @param {number} toStep
 */
export const UpdateProcessingStep = (toStep: number) => (dispatch: any) =>
  [
    dispatch({ type: ANNOTATION_ACTIONS.SUBMIT_RESULT }),
    dispatch({
      type: ANNOTATION_ACTIONS.SUBMIT_FILE_DATA,
      payload: { submitType: ESubmitType.StepChanged },
    }),
    // ToSubmitFileData(ESubmitType.StepChanged),
    dispatch({ type: ANNOTATION_ACTIONS.SET_STEP, payload: { toStep } }),
    dispatch({ type: ANNOTATION_ACTIONS.CALC_STEP_PROGRESS }),
    dispatch(loadFileData(0)),
  ];

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
) => [dispatch(ToSubmitFileData(submitType)), dispatch(loadFileData(nextIndex, nextBasicIndex))];

const ChangeBasicIndex = (dispatch: any, nextBasicIndex: number) => [
  dispatch({ type: ANNOTATION_ACTIONS.SUBMIT_RESULT }),
  dispatch({ type: ANNOTATION_ACTIONS.SET_BASIC_INDEX, payload: { basicIndex: nextBasicIndex } }),
];

/** 向前翻页 */
export const PageBackward = () => (dispatch: any, getState: any) =>
  DispatcherTurning(dispatch, getState, EPageTurningOperation.Backward);

/** 向后翻页 */
export const PageForward = () => (dispatch: any, getState: any) =>
  DispatcherTurning(dispatch, getState, EPageTurningOperation.Forward);

/**
 * 跳到指定文件索引
 * @param toIndex
 */
export const PageJump = (toIndex: number) => (dispatch: any, getState: any) => {
  if (toIndex === getState().imgIndex) {
    return;
  }

  return DispatcherTurning(dispatch, getState, EPageTurningOperation.Jump, toIndex);
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
  toIndex?: number,
) => {
  const { fileIndexChanged, fileIndex, basicIndexChanged, basicIndex } =
    PageOperator.getNextPageInfo(pageTurningOperation, getState().annotation, toIndex);

  const submitType: ESubmitType = getSubmitByPageOperation(pageTurningOperation);

  if (fileIndexChanged) {
    return SubmitAndChangeFileIndex(dispatch, fileIndex, submitType, basicIndex);
  }

  if (basicIndexChanged) {
    return ChangeBasicIndex(dispatch, basicIndex);
  }

  return dispatch(ToSubmitFileData(submitType));
};
