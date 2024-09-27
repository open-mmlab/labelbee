import { EDataFormatType } from '@/constant';
import { create } from 'zustand';
import React from 'react';

interface INewAnswerListMap {
  [key: string]: string;
}

interface Store {
  dataFormatType: EDataFormatType;
  setDataFormatType: (dataFormatType: EDataFormatType) => void;
  selectedID: React.Key;
  setSelectedID: (selectedID: React.Key) => void;
  newAnswerListMap: INewAnswerListMap;
  setNewAnswerListMap: (newAnswerListMap: INewAnswerListMap) => void;
}

const useLLMMultiWheelStore = create<Store>((set) => ({
  dataFormatType: EDataFormatType.Default,
  setDataFormatType: (dataFormatType) => set((state) => ({ dataFormatType })),
  selectedID: '',
  setSelectedID: (selectedID) => set((state) => ({ selectedID })),
  newAnswerListMap: {},
  setNewAnswerListMap: (newAnswerListMap) => set((state) => ({ newAnswerListMap })),
}));

export default useLLMMultiWheelStore;
