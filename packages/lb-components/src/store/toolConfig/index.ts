import { create } from 'zustand';

interface toolConfigStore {
  onlyLoadFirstData: boolean;
  setOnlyLoadFirstData: (onlyLoadFirstData: boolean) => void;
}

const useToolConfigStore = create<toolConfigStore>((set) => ({
  onlyLoadFirstData: false,
  setOnlyLoadFirstData: (onlyLoadFirstData) => set((state) => ({ onlyLoadFirstData })),
}));

export default useToolConfigStore;
