import { TOOL_STYLE_ACTIONS } from '@/store/Actions';
import { ToolStyleActionTypes, ToolStyleState } from './types';

export function InitToolStyleConfig(): ToolStyleActionTypes {
  return {
    type: TOOL_STYLE_ACTIONS.INIT_TOOL_STYLE_CONFIG,
    payload: undefined
  };
}

export function UpdateToolStyleConfig(toolStyle: Partial<ToolStyleState>): ToolStyleActionTypes {
  return {
    type: TOOL_STYLE_ACTIONS.UPDATE_TOOL_STYLE_CONFIG,
    payload: toolStyle,
  };
}

export default {
  InitToolStyleConfig,
  UpdateToolStyleConfig,
};
