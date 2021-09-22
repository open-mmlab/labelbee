import { IMAGE_ATTRIBUTE_ACTIONS } from '@/store/Actions';
import { ImgAttributeActionTypes, ImgAttributeState } from './types';

export function UpdateImgAttribute(imgAttribute: ImgAttributeState): ImgAttributeActionTypes {
  return {
    type: IMAGE_ATTRIBUTE_ACTIONS.UPDATE_IMG_ATTRIBUTE,
    payload: imgAttribute,
  };
}

export function InitImgAttribute(): ImgAttributeActionTypes {
  return {
    type: IMAGE_ATTRIBUTE_ACTIONS.INIT_IMG_ATTRIBUTE,
    payload: {}
  };
}

export default {
  UpdateImgAttribute,
  InitImgAttribute,
};
