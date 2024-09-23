import { create } from 'zustand';
import { ToolConfigStore } from './types';
import baseToolStateCreator from './baseToolConfig';
import pointCloudToolStateCreator from './pointCloudToolConfig';

const useToolConfigStore = create<ToolConfigStore>((set, get, api) => ({
  ...baseToolStateCreator(set, get, api),
  ...pointCloudToolStateCreator(set, get, api),
}));

export default useToolConfigStore;
