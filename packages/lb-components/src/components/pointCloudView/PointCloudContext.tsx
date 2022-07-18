import { IPointCloudBox, IPointCloudBoxList } from '@labelbee/lb-utils';
import React, { useMemo, useState } from 'react';

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

export const PointCloudProvider: React.FC<{}> = ({ children }) => {
  const [pointCloudBoxList, setPointCloudResult] = useState<IPointCloudBoxList>([]);
  const [selectedID, setSelectedID] = useState<string>('');

  const ptCtx = useMemo(() => {
    const selectedPointCloudBox = pointCloudBoxList.find((v) => v.id === selectedID);

    const updateSelectedPointCloud = (id: string, newPointCloudBox: IPointCloudBox) => {
      const newPointCloudBoxList = [...pointCloudBoxList].map((v) => {
        if (v.id === id) {
          return newPointCloudBox;
        }
        return v;
      });

      setPointCloudResult(newPointCloudBoxList);
    };

    const addBox = (box: IPointCloudBox) => {
      setPointCloudResult(pointCloudBoxList.concat(box));
    };

    return {
      pointCloudBoxList,
      selectedID,
      setPointCloudResult,
      setSelectedID,
      addBox,
      selectedPointCloudBox,
      updateSelectedPointCloud,
    };
  }, [selectedID, pointCloudBoxList]);

  return <PointCloudContext.Provider value={ptCtx}>{children}</PointCloudContext.Provider>;
};
