// Define basic generic types that will be used by all state modules
export interface BaseStore {
  onlyLoadFirstData: boolean;
  setOnlyLoadFirstData: (onlyLoadFirstData: boolean) => void;
}

// Define point cloud type: PointCloudToolConfig Store
export interface PointCloudToolConfigStore {
  selectBoxVisibleSwitch: boolean;
  setSelectBoxVisibleSwitch: (selectBoxVisibleSwitch: boolean) => void;
}

// Import all types into toolConfig Store through inheritance
export interface ToolConfigStore extends BaseStore, PointCloudToolConfigStore {}
