import { StateCreator } from 'zustand';
import { BaseStore } from './types';

const baseToolStateCreator: StateCreator<BaseStore> = (set, get) => ({
  onlyLoadFirstData: false,
  setOnlyLoadFirstData: (onlyLoadFirstData) => set((state) => ({ onlyLoadFirstData })),
});

export default baseToolStateCreator;
