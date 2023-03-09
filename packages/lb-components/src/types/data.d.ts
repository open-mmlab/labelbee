import { ESubmitType } from '@/constant';
import { TMatrix13Tuple, TMatrix14Tuple, ICalib } from '@labelbee/lb-utils';

export interface IMappingImg {
  url: string;
  calib: ICalib;
}

export interface IFileItem {
  id: number;
  url?: string;
  result?: string;
  mappingImgList?: IMappingImg[];
}
export type AnnotationFileList = IFileItem[];
export interface KVObject {
  [key: string]: any;
}

export type OnSubmit = (
  data: AnnotationFileList,
  submitType: ESubmitType,
  imgIndex: number,
  imgList: IFileItem[],
  // Just use it in pointCloud now.
  extra?: { updateImgList: Array<{ newInfo: IFileItem; imgIndex: number }> },
) => void;

export type OnSave = (data: IFileItem, imgIndex: number, imgList: AnnotationFileList) => void;
export type OnPageChange = (imgIndex: number) => void;
export type OnStepChange = (step: number) => void;
export type GetFileData = (nextFileData: IFileItem, nextIndex: number) => Promise<KVObject>;
export type LoadFileList = (
  page: number,
  pageSize: number,
) => Promise<{ fileList: IFileItem[]; total: number }>;
