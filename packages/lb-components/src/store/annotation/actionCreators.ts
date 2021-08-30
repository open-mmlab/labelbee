import { ANNOTATION_ACTIONS } from '@/store/Actions';
import { IStepInfo } from '@/types/step';
import { IFileItem, OnSubmit, GetFileData } from '@/types/data';
import { AnnotationActionTypes, ToolInstance } from './types';

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

export function PageJump(imgIndex: number): AnnotationActionTypes {
  return {
    type: ANNOTATION_ACTIONS.PAGE_JUMP,
    payload: {
      imgIndex,
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
    type: ANNOTATION_ACTIONS.COPY_BACKWARD_RESULT
  }
} 
