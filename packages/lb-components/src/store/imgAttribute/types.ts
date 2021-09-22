import { IMAGE_ATTRIBUTE_ACTIONS } from '@/store/Actions';

export interface ImgAttributeState {
  contrast: number;
  saturation: number;
  brightness: number;
  zoomRatio: number;
  isOriginalSize: boolean;
}

interface UpdateImgAttribute {
  type: typeof IMAGE_ATTRIBUTE_ACTIONS.UPDATE_IMG_ATTRIBUTE;
  payload: {
    contrast?: number;
    saturation?: number;
    brightness?: number;
    zoomRatio?: number;
  };
}

interface InitImgAttribute {
  type: typeof IMAGE_ATTRIBUTE_ACTIONS.INIT_IMG_ATTRIBUTE;
  payload: {}
}

export type ImgAttributeActionTypes = UpdateImgAttribute | InitImgAttribute;
