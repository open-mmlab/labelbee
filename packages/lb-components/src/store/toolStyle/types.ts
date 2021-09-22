import { TOOL_STYLE_ACTIONS } from '@/store/Actions';

export interface ToolStyleState {
  color: number;
  width: number;
  borderOpacity: number; // 边框透明度
  fillOpacity: number; // 填充透明度

  toolColor: {
    [color: number]: any;
  };
  attributeColor: any[];
  lineColor: string;
  attributeLineColor: string[];
}

interface UpdateToolStyleConfig {
  type: typeof TOOL_STYLE_ACTIONS.UPDATE_TOOL_STYLE_CONFIG;
  payload: Partial<ToolStyleState>;
}

interface InitToolStyleConfig {
  type: typeof TOOL_STYLE_ACTIONS.INIT_TOOL_STYLE_CONFIG;
  payload: undefined;
}


export type ToolStyleActionTypes = InitToolStyleConfig | UpdateToolStyleConfig ;
