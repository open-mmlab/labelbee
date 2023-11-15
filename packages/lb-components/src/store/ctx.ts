import { IModelAPIAnswer, IAnswerList } from '@/components/LLMToolView/types';
import React from 'react';
import { createDispatchHook, createSelectorHook } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
interface ILLMContext {
  hoverKey: number;
  newAnswerList: IAnswerList[];
  setHoverKey: (value: number) => void;
  modelAPIResponse: IModelAPIAnswer[];
  setModelAPIResponse: React.Dispatch<React.SetStateAction<IModelAPIAnswer[]>>;
  setNewAnswerList: (value: IAnswerList[]) => void;
}
export const LabelBeeContext = React.createContext(undefined) as any;
export const useDispatch = createDispatchHook(LabelBeeContext) as () => Dispatch<AnyAction | any>; // TODO, Any need to be updated.
export const useSelector = createSelectorHook(LabelBeeContext);
export const LLMContext = React.createContext<ILLMContext>({
  hoverKey: -1,
  newAnswerList: [],
  setHoverKey: () => {},
  modelAPIResponse: [],
  setModelAPIResponse: () => {},
  setNewAnswerList: () => {},
});
