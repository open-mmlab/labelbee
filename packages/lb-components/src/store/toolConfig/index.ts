import { create } from 'zustand';

interface toolConfigStore {
  onlyLoadFirstData: boolean;
  selectBoxVisibleSwitch: boolean;
  setOnlyLoadFirstData: (onlyLoadFirstData: boolean) => void;
  setSelectBoxVisibleSwitch: (selectBoxVisibleSwitch: boolean) => void;
}

const useToolConfigStore = create<toolConfigStore>((set) => ({
  onlyLoadFirstData: false,
  selectBoxVisibleSwitch: false,
  setOnlyLoadFirstData: (onlyLoadFirstData) => set((state) => ({ onlyLoadFirstData })),
  setSelectBoxVisibleSwitch: (selectBoxVisibleSwitch) =>
    set((state) => ({ selectBoxVisibleSwitch })),
}));

export default useToolConfigStore;
