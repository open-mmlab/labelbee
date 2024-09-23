import { StateCreator } from 'zustand';
import { PointCloudToolConfigStore } from './types';

const pointCloudToolStateCreator: StateCreator<PointCloudToolConfigStore> = (set, get) => ({
  selectBoxVisibleSwitch: false,
  setSelectBoxVisibleSwitch: (selectBoxVisibleSwitch: boolean) =>
    set(() => ({ selectBoxVisibleSwitch })),
});

export default pointCloudToolStateCreator;
