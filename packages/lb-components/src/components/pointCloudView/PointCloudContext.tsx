import { IPointCloudBoxList } from '@labelbee/lb-utils';
import React from 'react';

export interface IPointCloudContext {
  pointCloudBoxList: IPointCloudBoxList;
  selectedID: string;
  setSelectedID: (id: string) => void;
  setPointCloudResult: (resultList: IPointCloudBoxList) => void;
}

export const PointCloudContext = React.createContext<IPointCloudContext>({
  pointCloudBoxList: [],
  selectedID: '',
  setSelectedID: () => {},
  setPointCloudResult: () => {},
});
