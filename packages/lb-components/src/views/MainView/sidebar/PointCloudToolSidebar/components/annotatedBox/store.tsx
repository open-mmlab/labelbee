import { create } from 'zustand';
import { IPointCloudBoxList } from '@labelbee/lb-utils';
import { IPointCloudContext } from '@/components/pointCloudView/PointCloudContext';

interface Store {
  ptCtx: IPointCloudContext | {};
  pointCloudBoxList: IPointCloudBoxList;
  setPointCloudBoxList: (pointCloudBoxList: IPointCloudBoxList) => void;
  highlightIDs: number[];
  setHighlightIDs: (highlightIDs: number[]) => void;
  selectedIDs: string[];
  setSelectedIDs: (selectedIDs: string[]) => void;
  setPtCtx: (ptCtx: IPointCloudContext) => void;
}

const useAnnotatedBoxStore = create<Store>((set) => ({
  ptCtx: {},
  pointCloudBoxList: [],
  setPointCloudBoxList: (pointCloudBoxList) => set((state) => ({ pointCloudBoxList })),
  highlightIDs: [],
  setHighlightIDs: (highlightIDs) => set((state) => ({ highlightIDs })),
  selectedIDs: [],
  setSelectedIDs: (selectedIDs) => set((state) => ({ selectedIDs })),
  setPtCtx: (ptCtx) => set((state) => ({ ptCtx })),
}));

export default useAnnotatedBoxStore;
