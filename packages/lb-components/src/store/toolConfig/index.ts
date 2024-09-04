import { create } from 'zustand';
import { IPointCloudContext } from '@/components/pointCloudView/PointCloudContext';

interface Store {
  ptCtx: IPointCloudContext | {};
  setPtCtx: (ptCtx: IPointCloudContext) => void;
}

const useToolConfigStore = create<Store>((set) => ({
  ptCtx: {},
  setPtCtx: (ptCtx) => set((state) => ({ ptCtx })),
}));

export default useToolConfigStore;
