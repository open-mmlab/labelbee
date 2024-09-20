import { EDataFormatType } from '@/constant';
import { create } from 'zustand';
import React from 'react';
interface Store {
  dataFormatType: EDataFormatType;
  setDataFormatType: (dataFormatType: EDataFormatType) => void;
  selectedID: React.Key;
  setSelectedID: (selectedID: React.Key) => void;
  highlightIDs: number[];
  setHighlightIDs: (highlightIDs: number[]) => void;
  selectedIDs: string[];
  setSelectedIDs: (selectedIDs: string[]) => void;
  rectRotateSensitivity: number;
  setRectRotateSensitivity: (sensitivity: number) => void;
}

const useLLMMultiWheelStore = create<Store>((set) => ({
  dataFormatType: EDataFormatType.Default,
  setDataFormatType: (dataFormatType) => set((state) => ({ dataFormatType })),
  selectedID: '',
  setSelectedID: (selectedID) => set((state) => ({ selectedID })),
  highlightIDs: [],
  setHighlightIDs: (highlightIDs) => set((state) => ({ highlightIDs })),
  selectedIDs: [],
  setSelectedIDs: (selectedIDs) =>
    set((state) => {
      return { selectedIDs };
    }),
  rectRotateSensitivity: 2,
  setRectRotateSensitivity: (sensitivity) =>
    set((state) => ({ rectRotateSensitivity: sensitivity })),
}));

export default useLLMMultiWheelStore;
