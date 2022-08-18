import { IPointCloudBox, IPointCloudBoxList } from '@labelbee/lb-utils';
import { PointCloud, PointCloudAnnotation, cAnnotation } from '@labelbee/lb-annotation';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import _ from 'lodash';
import { message } from 'antd';
import { IAnnotationStateProps } from '@/store/annotation/map';
import { synchronizeBackView, synchronizeSideView } from './hooks/usePointCloudViews';
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
  selectedIDs: string[];
  setSelectedIDs: (ids?: string[] | string) => void;
  valid: boolean;
  setPointCloudResult: (resultList: IPointCloudBoxList) => void;
  selectedPointCloudBox?: IPointCloudBox;
  setPointCloudValid: (valid?: boolean) => void;
  addSelectedID: (selectedID: string) => void;
  selectedAllBoxes: () => void;
  selectedID: string;
  addPointCloudBox: (boxParams: IPointCloudBox) => void;
}

export const PointCloudContext = React.createContext<IPointCloudContext>({
  pointCloudBoxList: [],
  selectedID: '',
  selectedIDs: [],
  valid: true,
  setSelectedIDs: () => {},
  setPointCloudResult: () => {},
  setPointCloudValid: () => {},
  setTopViewInstance: () => {},
  setSideViewInstance: () => {},
  setBackViewInstance: () => {},
  setMainViewInstance: () => {},
  addSelectedID: () => {},
  selectedAllBoxes: () => {},
  addPointCloudBox: () => {},
});

export const PointCloudProvider: React.FC<{}> = ({ children }) => {
  const [pointCloudBoxList, setPointCloudResult] = useState<IPointCloudBoxList>([]);
  const [selectedIDs, setSelectedIDsState] = useState<string[]>([]);
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

    const addPointCloudBox = (box: IPointCloudBox) => {
      setPointCloudResult(pointCloudBoxList.concat(box));
    };

    const setPointCloudValid = (valid?: boolean) => {
      setValid(valid === false ? false : true);
    };

    const setSelectedIDs = (selectedIDs?: string[] | string) => {
      if (selectedIDs === undefined) {
        setSelectedIDsState([]);
      }

      if (typeof selectedIDs === 'string') {
        setSelectedIDsState([selectedIDs]);
      }

      if (Array.isArray(selectedIDs)) {
        setSelectedIDsState(Array.from(new Set(selectedIDs)));
      }
    };

    /**
     * If selectedID existed, remove selectedID from selectedIDs
     * If selectedID not existed, add selectedID to selectedIDs
     * @param selectedID
     */
    const addSelectedID = (selectedID: string) => {
      if (selectedIDs.includes(selectedID)) {
        setSelectedIDs(selectedIDs.filter((i) => i !== selectedID));
      } else {
        setSelectedIDs([...selectedIDs, selectedID]);
      }
    };

    const selectedAllBoxes = () => {
      setSelectedIDs(pointCloudBoxList.map((i) => i.id));
    };

    return {
      selectedID,
      pointCloudBoxList,
      selectedIDs,
      setPointCloudResult,
      setSelectedIDs,
      addPointCloudBox,
      valid,
      selectedPointCloudBox,
      setPointCloudValid,
      addSelectedID,
      selectedAllBoxes,
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
 * @returns
 */
export const useRotate = ({ currentData }: IAnnotationStateProps) => {
  const ptCtx = useContext(PointCloudContext);
  const { selectedBox, updateSelectedBox } = useSingleBox();

  const updateRotate = useCallback(
    (angle: number) => {
      const { topViewInstance, mainViewInstance } = ptCtx;
      if (!topViewInstance || !mainViewInstance) {
        return;
      }

      const { pointCloud2dOperation: TopPointCloudPolygonOperation } = topViewInstance;

      const selectedPointCloudBox = selectedBox?.info;

      if (!selectedPointCloudBox || !currentData?.url || !ptCtx.backViewInstance) {
        return;
      }

      updateSelectedBox({
        rotation: selectedPointCloudBox.rotation + Number(Math.PI * angle) / 180,
      });

      TopPointCloudPolygonOperation.rotatePolygon(angle, ERotateDirection.Anticlockwise);
      const selectedPolygon = TopPointCloudPolygonOperation.selectedPolygon;

      mainViewInstance.generateBox(selectedPointCloudBox, selectedPolygon.id);
      mainViewInstance.hightLightOriginPointCloud(selectedPointCloudBox);
      synchronizeSideView(
        selectedPointCloudBox,
        selectedPolygon,
        ptCtx.sideViewInstance,
        currentData.url,
      );
      synchronizeBackView(selectedPointCloudBox, selectedPolygon, ptCtx.backViewInstance);
      mainViewInstance.render();
    },
    [
      ptCtx.selectedID,
      ptCtx.pointCloudBoxList,
      ptCtx.setPointCloudResult,
      ptCtx.topViewInstance,
      currentData,
    ],
  );

  return { updateRotate };
};

/** Actions for single selected box */
export const useSingleBox = () => {
  const { pointCloudBoxList, setPointCloudResult, topViewInstance, selectedIDs, selectedID } =
    useContext(PointCloudContext);

  /** Returns { info: selected box, index: selected box index } */
  const selectedBox = useMemo(() => {
    const boxIndex = pointCloudBoxList.findIndex((i: { id: string }) => i.id === selectedID);
    if (boxIndex > -1) {
      return { info: pointCloudBoxList[boxIndex], index: boxIndex };
    }
  }, [selectedID, pointCloudBoxList]);

  /** Use Partial<IPointCloudBox> to update selected box  */
  const updateSelectedBox = useCallback(
    (params: Partial<IPointCloudBox>) => {
      if (selectedBox?.info) {
        pointCloudBoxList.splice(selectedBox.index, 1, _.merge(selectedBox.info, params));
        setPointCloudResult(_.cloneDeep(pointCloudBoxList));
      }
    },
    [selectedID],
  );

  /** Toggle selected box‘s validity  */
  const changeSelectedBoxValid = useCallback(() => {
    if (selectedBox?.info) {
      updateSelectedBox({ valid: !selectedBox.info.valid });
    }
  }, [selectedID]);

  /** PointCloud select next/prev one */
  const switchToNextBox = useCallback(
    (sort = ESortDirection.ascend) => {
      if (!topViewInstance || selectedIDs.length > 1) {
        return;
      }

      const { pointCloud2dOperation } = topViewInstance;

      pointCloud2dOperation.switchToNextPolygon(sort);
    },
    [topViewInstance],
  );

  const selectPrevBox = () => {
    switchToNextBox(ESortDirection.descend);
  };

  return {
    selectedBox,
    updateSelectedBox,
    changeSelectedBoxValid,
    selectNextBox: switchToNextBox,
    selectPrevBox,
  };
};

/**
 * Actions for selected boxes
 */
export const useBoxes = () => {
  const { selectedIDs, pointCloudBoxList, setPointCloudResult } = useContext(PointCloudContext);
  const [copiedBoxes, setCopiedBoxes] = useState<IPointCloudBoxList>([]);

  const hasDuplicateID = (checkBoxList: IPointCloudBoxList) => {
    return pointCloudBoxList.some((item) => {
      return checkBoxList.some((i) => i.id === item.id);
    });
  };

  const selectedBoxes = useMemo(() => {
    return pointCloudBoxList.filter((i) => selectedIDs.includes(i.id));
  }, [selectedIDs, pointCloudBoxList]);

  const copySelectedBoxes = useCallback(() => {
    if (selectedBoxes.length > 0) {
      setCopiedBoxes(_.cloneDeep(selectedBoxes));
    } else {
      setCopiedBoxes([]);
      message.error('复制内容为空，请选择对应的点云数据');
    }
  }, [selectedIDs]);

  const pasteSelectedBoxes = useCallback(() => {
    if (copiedBoxes.length === 0) {
      message.error('选者对应的点云数据并进行复制');
      return;
    }

    const hasDuplicate = hasDuplicateID(copiedBoxes);

    if (hasDuplicate) {
      message.error('存在重复ID,复制失败');
    } else {
      /** Paste succeed and empty */
      setPointCloudResult(copiedBoxes);
      setCopiedBoxes([]);
    }
  }, [copiedBoxes]);

  return { copySelectedBoxes, pasteSelectedBoxes, copiedBoxes, selectedBoxes };
};
