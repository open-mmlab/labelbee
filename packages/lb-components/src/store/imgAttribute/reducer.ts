import { IMAGE_ATTRIBUTE_ACTIONS } from '@/store/Actions';
import { ImgAttributeState, ImgAttributeActionTypes } from './types';

const initialState: ImgAttributeState = {
  contrast: 1,
  saturation: 1,
  brightness: 1,
  zoomRatio: 1,
  isOriginalSize: false,
};

export function imgAttributeReducer(
  state = { ...initialState },
  action: ImgAttributeActionTypes,
): ImgAttributeState {
  switch (action.type) {
    case IMAGE_ATTRIBUTE_ACTIONS.UPDATE_IMG_ATTRIBUTE: {
      return {
        ...state,
        ...action.payload,
      };
    }

    case IMAGE_ATTRIBUTE_ACTIONS.INIT_IMG_ATTRIBUTE: {
      return {
        ...initialState,
      };
    }

    default:
      return state;
  }
}
