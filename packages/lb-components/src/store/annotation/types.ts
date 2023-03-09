import {
  AnnotationEngine,
  RectOperation,
  TagOperation,
  TextToolOperation,
  PointOperation,
  PolygonOperation,
  LineToolOperation,
} from '@labelbee/lb-annotation';
import { ANNOTATION_ACTIONS } from '@/store/Actions';
import { IStepInfo } from '@/types/step';
import {
  OnSubmit,
  IFileItem,
  GetFileData,
  OnSave,
  OnPageChange,
  OnStepChange,
  LoadFileList,
} from '@/types/data';
import { ESubmitType } from '@/constant';
import { IPointCloudBox } from '@labelbee/lb-utils';

export type GraphToolInstance =
  | RectOperation
  | PointOperation
  | PolygonOperation
  | LineToolOperation;

export type ToolInstance = GraphToolInstance | TagOperation | TextToolOperation;

interface CommonActions {
  type: string;
  payload?: any;
}


export interface AnnotationState {
  toolInstance: ToolInstance | null;
  annotationEngine: AnnotationEngine | null;
  imgList: IFileItem[];
  config: string;
  imgIndex: number;
  imgPageSize: number;
  step: number;
  stepList: IStepInfo[];
  imgNode: HTMLImageElement;
  onSubmit?: OnSubmit;
  onSave?: OnSave;
  onPageChange?: OnPageChange;
  onStepChange?: OnStepChange;
  getFileData?: GetFileData;
  loadFileList?: LoadFileList;
  pageSize?: number;
  basicIndex: number;
  basicResultList: any[];
  resultList: any[];
  stepProgress: number;
  loading: boolean; // 用于图片加载
  /** 阻止文件切换后的事件 */
  triggerEventAfterIndexChanged: boolean;

  skipBeforePageTurning?: (pageTurning: Function) => void;
  beforeRotate?: () => boolean;

  pointCloudLoading: boolean;
  checkMode: boolean; // Judge current Mode is checkMode or not.
}

interface UpdateToolInstance {
  type: typeof ANNOTATION_ACTIONS.UPDATE_TOOL_INSTANCE;
  payload: {
    toolInstance: ToolInstance;
    annotationEngine: AnnotationEngine;
  };
}

interface UpdateImgList {
  type: typeof ANNOTATION_ACTIONS.UPDATE_IMG_LIST;
  payload: {
    imgList: IFileItem[];
  };
}

interface UpdateAnnotationConfig {
  type: typeof ANNOTATION_ACTIONS.UPDATE_ANNOTATION_CONFIG;
  payload: {
    config: string;
  };
}

interface SubmitFileData extends CommonActions {
  type: typeof ANNOTATION_ACTIONS.SUBMIT_FILE_DATA;
  payload: {
    submitType: ESubmitType;
  };
}

interface LoadFileData extends CommonActions {
  type: typeof ANNOTATION_ACTIONS.LOAD_FILE_DATA;
  payload: {
    nextIndex: number;
  };
}

interface SetTaskConfig {
  type: typeof ANNOTATION_ACTIONS.SET_TASK_CONFIG;
  payload: {
    stepList: IStepInfo[];
    step: number;
  };
}
interface InitTool {
  type: typeof ANNOTATION_ACTIONS.INIT_TOOL;
  payload: {
    stepList: IStepInfo[];
    step: number;
  };
}

interface UpdateOnSubmit {
  type: typeof ANNOTATION_ACTIONS.UPDATE_ON_SUBMIT;
  payload: {
    onSubmit: OnSubmit;
  };
}

interface UpdateOnSave {
  type: typeof ANNOTATION_ACTIONS.UPDATE_ON_SAVE;
  payload: {
    onSave: OnSave;
  };
}

interface UpdateOnPageChange {
  type: typeof ANNOTATION_ACTIONS.UPDATE_ON_PAGE_CHANGE;
  payload: {
    getFileData: OnPageChange;
  };
}
interface UpdateOnStepChange {
  type: typeof ANNOTATION_ACTIONS.UPDATE_ON_STEP_CHANGE;
  payload: {
    getFileData: OnStepChange;
  };
}

interface UpdateGetFileData {
  type: typeof ANNOTATION_ACTIONS.UPDATE_GET_FILE_DATA;
  payload: {
    getFileData: GetFileData;
  };
}
interface UpdatePageSize {
  type: typeof ANNOTATION_ACTIONS.UPDATE_PAGE_SIZE;
  payload: {
    pageSize: number;
  };
}

interface UpdateGetFileList {
  type: typeof ANNOTATION_ACTIONS.UPDATE_LOAD_FILE_LIST;
  payload: {
    getFileData: LoadFileList;
  };
}

interface CopyBackWordResult extends CommonActions {
  type: typeof ANNOTATION_ACTIONS.COPY_BACKWARD_RESULT;
}

interface InitAnnotationState extends CommonActions {
  type: typeof ANNOTATION_ACTIONS.INIT_ALL_STATE;
}
interface BatchUpdateTrackID {
  type: typeof ANNOTATION_ACTIONS.BATCH_UPDATE_TRACK_ID,
  payload: {
    id: number;
    newID: number;
    range: [number, number],
    imgList: IFileItem[],
  }
}

interface BatchUpdateResultByTrackID {
  type: typeof ANNOTATION_ACTIONS.BATCH_UPDATE_RESULT_BY_TRACK_ID,
  payload: {
    id: number;
    newData: Partial<IPointCloudBox>;
    range: [number, number],
  }
}

export type AnnotationActionTypes =
  | UpdateToolInstance
  | UpdateImgList
  | UpdateAnnotationConfig
  | SubmitFileData
  | LoadFileData
  | SetTaskConfig
  | InitTool
  | UpdateOnSubmit
  | UpdateOnPageChange
  | UpdateOnStepChange
  | UpdateGetFileData
  | UpdatePageSize
  | UpdateGetFileList
  | CopyBackWordResult
  | UpdateOnSave
  | BatchUpdateTrackID
  | BatchUpdateResultByTrackID
  | InitAnnotationState;
