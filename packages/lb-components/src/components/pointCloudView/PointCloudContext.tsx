import { IPointCloudBox, IPointCloudBoxList, IPolygonData } from '@labelbee/lb-utils';
import { PointCloud, PointCloudAnnotation } from '@labelbee/lb-annotation';
import React, { useMemo, useState } from 'react';

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

  polygonList: IPolygonData[];
  setPolygonList: (polygonList: IPolygonData[]) => void;
}

export const PointCloudContext = React.createContext<IPointCloudContext>({
  pointCloudBoxList: [],
  polygonList: [],
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
  setPolygonList: () => {},
});

export const PointCloudProvider: React.FC<{}> = ({ children }) => {
  const [pointCloudBoxList, setPointCloudResult] = useState<IPointCloudBoxList>([]);
  const [polygonList, setPolygonList] = useState<IPolygonData[]>([]);
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
      polygonList,
      setPolygonList,
    };
  }, [
    valid,
    selectedIDs,
    pointCloudBoxList,
    polygonList,
    topViewInstance,
    sideViewInstance,
    backViewInstance,
    mainViewInstance,
  ]);

  return <PointCloudContext.Provider value={ptCtx}>{children}</PointCloudContext.Provider>;
};
