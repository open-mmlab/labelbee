import { IPointCloudBox, IPointCloudBoxList } from '@labelbee/lb-utils';
import { PointCloud, PointCloudAnnotation, cAnnotation } from '@labelbee/lb-annotation';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { synchronizeBackView, synchronizeSideView } from './PointCloudTopView';
import { pointCloudMain } from './PointCloud3DView';
const { ERotateDirection, ESortDirection } = cAnnotation;

export interface IPointCloudContext {
  pointCloudBoxList: IPointCloudBoxList;
  selectedID: string;
  setSelectedID: (id: string) => void;
  setPointCloudResult: (resultList: IPointCloudBoxList) => void;
  selectedPointCloudBox?: IPointCloudBox;
  updateSelectedPointCloud: (id: string, newBox: IPointCloudBox) => void;

  topViewInstance?: PointCloudAnnotation;
  sideViewInstance?: PointCloudAnnotation;
  backViewInstance?: PointCloudAnnotation;

  MainViewInstance?: PointCloud;

  setTopViewInstance: (instance: PointCloudAnnotation) => void;
  setSideViewInstance: (instance: PointCloudAnnotation) => void;
  setBackViewInstance: (instance: PointCloudAnnotation) => void;
}

export const PointCloudContext = React.createContext<IPointCloudContext>({
  pointCloudBoxList: [],
  selectedID: '',
  setSelectedID: () => {},
  setPointCloudResult: () => {},
  updateSelectedPointCloud: () => {},

  setTopViewInstance: () => {},
  setSideViewInstance: () => {},
  setBackViewInstance: () => {},
});

export const PointCloudProvider: React.FC<{}> = ({ children }) => {
  const [pointCloudBoxList, setPointCloudResult] = useState<IPointCloudBoxList>([]);
  const [selectedID, setSelectedID] = useState<string>('');
  const [topViewInstance, setTopViewInstance] = useState<PointCloudAnnotation>();
  const [sideViewInstance, setSideViewInstance] = useState<PointCloudAnnotation>();
  const [backViewInstance, setBackViewInstance] = useState<PointCloudAnnotation>();

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

      topViewInstance,
      setTopViewInstance,
      sideViewInstance,
      setSideViewInstance,
      backViewInstance,
      setBackViewInstance,
    };
  }, [selectedID, pointCloudBoxList, topViewInstance, sideViewInstance, backViewInstance]);

  return <PointCloudContext.Provider value={ptCtx}>{children}</PointCloudContext.Provider>;
};

/**
 * PointCloud Rotate Hook
 * @returns
 */
export const useRotate = () => {
  const ptCtx = useContext(PointCloudContext);

  const updateRotate = useCallback(
    (angle: number) => {
      const { selectedID, pointCloudBoxList, setPointCloudResult, topViewInstance } = ptCtx;
      if (!topViewInstance) {
        return;
      }

      const { pointCloud2dOpeartion: TopPointCloudPolygonOperation } = topViewInstance;

      const selectedPointCloudBox = pointCloudBoxList.find((v) => v.id === selectedID);

      if (!selectedPointCloudBox) {
        return;
      }

      selectedPointCloudBox.rotation =
        selectedPointCloudBox.rotation + Number(Math.PI * angle) / 180;

      const newPointCloudBoxList = [...pointCloudBoxList].map((v) => {
        if (v.id === selectedID) {
          return selectedPointCloudBox;
        }
        return v;
      });

      setPointCloudResult(newPointCloudBoxList);
      TopPointCloudPolygonOperation.rotatePolygon(angle, ERotateDirection.Anticlockwise);
      const selectedPolygon = TopPointCloudPolygonOperation.selectedPolygon;

      pointCloudMain.generateBox(selectedPointCloudBox, selectedPolygon.id);
      pointCloudMain.hightLightOriginPointCloud(selectedPointCloudBox);
      synchronizeSideView(selectedPointCloudBox, selectedPolygon, ptCtx.sideViewInstance);
      synchronizeBackView(selectedPointCloudBox, selectedPolygon, ptCtx.backViewInstance);
      pointCloudMain.render();
    },
    [ptCtx.selectedID, ptCtx.pointCloudBoxList, ptCtx.setPointCloudResult, ptCtx.topViewInstance],
  );

  return { updateRotate };
};

/**
 * PointCloud get next one - Hook
 * @returns
 */
export const useNextOne = () => {
  const ptCtx = useContext(PointCloudContext);

  const switchToNextPolygon = useCallback(
    (sort = ESortDirection.ascend) => {
      const { topViewInstance } = ptCtx;

      if (!topViewInstance) {
        return;
      }

      const { pointCloud2dOpeartion } = topViewInstance;

      pointCloud2dOpeartion.switchToNextPolygon(sort);
    },
    [ptCtx.topViewInstance],
  );

  return { switchToNextPolygon };
};
