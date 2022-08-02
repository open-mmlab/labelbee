import { IPointCloudBox, IPointCloudBoxList } from '@labelbee/lb-utils';
import { PointCloud, PointCloudAnnotation, cAnnotation } from '@labelbee/lb-annotation';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { synchronizeBackView, synchronizeSideView } from './PointCloudTopView';
import _ from 'lodash';
const { ERotateDirection, ESortDirection } = cAnnotation;

interface IPointCloudContextInstances {
  topViewInstance?: PointCloudAnnotation;
  sideViewInstance?: PointCloudAnnotation;
  backViewInstance?: PointCloudAnnotation;
  mainViewInstance?: PointCloud;
  setTopViewInstance: (instance: PointCloudAnnotation) => void;
  setSideViewInstance: (instance: PointCloudAnnotation) => void;
  setBackViewInstance: (instance: PointCloudAnnotation) => void;
  setMainViewInstance: (instance: PointCloud) => void;
}

export interface IPointCloudContext extends IPointCloudContextInstances {
  pointCloudBoxList: IPointCloudBoxList;
  selectedID: string;
  selectedIDs: string[];
  setSelectedID: (id: string) => void;
  setSelectedIDs: (id: string) => void;
  valid: boolean;
  setPointCloudResult: (resultList: IPointCloudBoxList) => void;
  selectedPointCloudBox?: IPointCloudBox;
  updateSelectedPointCloud: (id: string, newBox: IPointCloudBox) => void;
  setPointCloudValid: (valid?: boolean) => void;
  addSelectedID: (selectedID: string) => void;
}

export const PointCloudContext = React.createContext<IPointCloudContext>({
  pointCloudBoxList: [],
  selectedID: '',
  selectedIDs: [],
  valid: true,
  setSelectedID: () => {},
  setSelectedIDs: () => {},
  setPointCloudResult: () => {},
  updateSelectedPointCloud: () => {},
  setPointCloudValid: () => {},
  setTopViewInstance: () => {},
  setSideViewInstance: () => {},
  setBackViewInstance: () => {},
  setMainViewInstance: () => {},
  addSelectedID: () => {},
});

export const PointCloudProvider: React.FC<{}> = ({ children }) => {
  const [pointCloudBoxList, setPointCloudResult] = useState<IPointCloudBoxList>([]);
  const [selectedIDs, setSelectedIDs] = useState<string[]>([]);
  const [valid, setValid] = useState<boolean>(true);
  const [topViewInstance, setTopViewInstance] = useState<PointCloudAnnotation>();
  const [sideViewInstance, setSideViewInstance] = useState<PointCloudAnnotation>();
  const [backViewInstance, setBackViewInstance] = useState<PointCloudAnnotation>();
  const [mainViewInstance, setMainViewInstance] = useState<PointCloud>();

  const selectedID = useMemo(() => {
    return selectedIDs.length === 1 ? selectedIDs[0] : '';
  }, [selectedIDs]);

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

    const setPointCloudValid = (valid?: boolean) => {
      setValid(valid === false ? false : true);
    };

    const addSelectedID = (selectedID: string) => {
      setSelectedIDs([...selectedIDs, selectedID]);
    };

    const setSelectedID = (selectedID?: string) => {
      setSelectedIDs(selectedID ? [selectedID] : []);
    };

    const instances = {};

    return {
      ...instances,
      pointCloudBoxList,
      selectedID,
      selectedIDs,
      setPointCloudResult,
      setSelectedID,
      setSelectedIDs,
      addBox,
      valid,
      selectedPointCloudBox,
      updateSelectedPointCloud,
      setPointCloudValid,
      addSelectedID,
      topViewInstance,
      setTopViewInstance,
      sideViewInstance,
      setSideViewInstance,
      backViewInstance,
      setBackViewInstance,
      mainViewInstance,
      setMainViewInstance,
    };
  }, [
    valid,
    selectedIDs,
    pointCloudBoxList,
    topViewInstance,
    sideViewInstance,
    backViewInstance,
    mainViewInstance,
  ]);

  return <PointCloudContext.Provider value={ptCtx}>{children}</PointCloudContext.Provider>;
};

/**
 * PointCloud Rotate Hook
 * @ret
 */
export const useRotate = () => {
  const ptCtx = useContext(PointCloudContext);

  const updateRotate = useCallback(
    (angle: number) => {
      const {
        selectedID,
        pointCloudBoxList,
        setPointCloudResult,
        topViewInstance,
        mainViewInstance,
      } = ptCtx;
      if (!topViewInstance || !mainViewInstance) {
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

      mainViewInstance.generateBox(selectedPointCloudBox, selectedPolygon.id);
      mainViewInstance.hightLightOriginPointCloud(selectedPointCloudBox);
      synchronizeSideView(selectedPointCloudBox, selectedPolygon, ptCtx.sideViewInstance);
      synchronizeBackView(selectedPointCloudBox, selectedPolygon, ptCtx.backViewInstance);
      mainViewInstance.render();
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

/**
 * Actions for selected box
 */
export const useSelectedBox = () => {
  const { selectedID, pointCloudBoxList, setPointCloudResult } = useContext(PointCloudContext);

  const selectedBox = useMemo(() => {
    const boxIndex = pointCloudBoxList.findIndex((i: { id: string }) => i.id === selectedID);
    return { info: pointCloudBoxList[boxIndex], index: boxIndex };
  }, [selectedID, pointCloudBoxList]);

  const updateSelectedBox = useCallback(
    (params: Partial<IPointCloudBox>) => {
      if (selectedBox.info) {
        pointCloudBoxList.splice(selectedBox.index, 1, _.merge(selectedBox.info, params));
        setPointCloudResult(_.cloneDeep(pointCloudBoxList));
      }
    },
    [selectedID],
  );

  const changeSelectedBoxValid = useCallback(() => {
    if (selectedBox.info) {
      updateSelectedBox({ valid: !selectedBox.info.valid });
    }
  }, [selectedID]);

  return { selectedBox, updateSelectedBox, changeSelectedBoxValid };
};
