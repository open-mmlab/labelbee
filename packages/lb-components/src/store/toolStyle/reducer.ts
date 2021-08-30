import { COLORS_ARRAY, NULL_COLOR } from '@/data/Style';
import { ToolStyleUtils } from '@/utils/ToolStyleUtils';
import { TOOL_STYLE_ACTIONS } from '@/store/Actions';
import { ToolStyleActionTypes, ToolStyleState } from './types';

const initialState: ToolStyleState = {
  color: 1,
  width: 2,
  borderOpacity: 9,
  fillOpacity: 9,
  toolColor: ToolStyleUtils.getToolColors(),
  attributeColor: ToolStyleUtils.getAttributeColors(),
  lineColor: ToolStyleUtils.getDefaultToolLineColors(),
  attributeLineColor: [NULL_COLOR].concat(COLORS_ARRAY),
};

export function toolStyleReducer(
  state = { ...initialState },
  action: ToolStyleActionTypes,
): ToolStyleState {
  switch (action.type) {
    case TOOL_STYLE_ACTIONS.INIT_TOOL_STYLE_CONFIG: {
      return {
        ...initialState,
      };
    }

    case TOOL_STYLE_ACTIONS.UPDATE_TOOL_STYLE_CONFIG: {
      const computeColor = {};
      const payload = action.payload;
      if (payload?.borderOpacity || payload?.fillOpacity) {
        Object.assign(
          computeColor,
          ToolStyleUtils.initByOpacity(
            payload.borderOpacity || state.borderOpacity,
            payload.fillOpacity || state.fillOpacity,
          ),
        );
      }

      return {
        ...state,
        ...action.payload,
        ...computeColor,
      };
    }

    default:
      return state;
  }
}
