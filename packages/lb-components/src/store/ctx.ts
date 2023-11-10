import { IModelAPIAnswer } from '@/components/LLMToolView/types';
import React from 'react';
import { createDispatchHook, createSelectorHook } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
interface ILLMContext {
  hoverKey: number;
  setHoverKey: (value: number) => void;
  modelAPIResponse: IModelAPIAnswer[];
  setModelAPIResponse: (value: IModelAPIAnswer[]) => void;
}
export const LabelBeeContext = React.createContext(undefined) as any;
export const useDispatch = createDispatchHook(LabelBeeContext) as () => Dispatch<AnyAction | any>; // TODO, Any need to be updated.
export const useSelector = createSelectorHook(LabelBeeContext);
export const LLMContext = React.createContext<ILLMContext>({
  hoverKey: -1,
  setHoverKey: () => {},
  modelAPIResponse: [],
  setModelAPIResponse: () => {},
});
