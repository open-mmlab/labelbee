import { IPointCloudBox, IPointCloudBoxList } from '@labelbee/lb-utils';
import React from 'react';

export interface IPointCloudContext {
  pointCloudBoxList: IPointCloudBoxList;
  selectedID: string;
  setSelectedID: (id: string) => void;
  setPointCloudResult: (resultList: IPointCloudBoxList) => void;
  selectedPointCloudBox?: IPointCloudBox;
  updateSelectedPointCloud: (id: string, newBox: IPointCloudBox) => void;
}

export const PointCloudContext = React.createContext<IPointCloudContext>({
  pointCloudBoxList: [],
  selectedID: '',
  setSelectedID: () => {},
  setPointCloudResult: () => {},
  updateSelectedPointCloud: () => {},
});
