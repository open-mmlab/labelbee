import { IPointCloudBox, IPointCloudBoxList, IPolygonData } from '@labelbee/lb-utils';
import { PointCloud, PointCloudAnnotation, ActionsHistory } from '@labelbee/lb-annotation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

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

type AttrPanelLayout = '' | 'left' | 'right';

export interface IPointCloudContext extends IPointCloudContextInstances {
  pointCloudBoxList: IPointCloudBoxList;
  displayPointCloudList: IPointCloudBoxList;
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

  zoom: number;
  setZoom: (zoom: number) => void;

  history: ActionsHistory; // Operation History
  hideAttributes: string[];
  toggleAttributesVisible: (attribute: string) => void;
  reRender: (_displayPointCloudList: IPointCloudBoxList, _polygonList: IPolygonData[]) => void;
  attrPanelLayout: AttrPanelLayout;
  setAttrPanelLayout: (layout: AttrPanelLayout) => void;
}

export const PointCloudContext = React.createContext<IPointCloudContext>({
  pointCloudBoxList: [],
  displayPointCloudList: [],
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

  zoom: 1,
  setZoom: () => {},
  history: new ActionsHistory(),
  hideAttributes: [],
  toggleAttributesVisible: () => {},
  reRender: () => {},
  setAttrPanelLayout: () => {},
  attrPanelLayout: '',
});

export const PointCloudProvider: React.FC<{}> = ({ children }) => {
  const [pointCloudBoxList, setPointCloudResult] = useState<IPointCloudBoxList>([]);
  const [polygonList, setPolygonList] = useState<IPolygonData[]>([]);
  const [selectedIDs, setSelectedIDsState] = useState<string[]>([]);
  const [valid, setValid] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1);
  const [topViewInstance, setTopViewInstance] = useState<PointCloudAnnotation>();
  const [sideViewInstance, setSideViewInstance] = useState<PointCloudAnnotation>();
  const [backViewInstance, setBackViewInstance] = useState<PointCloudAnnotation>();
  const [mainViewInstance, setMainViewInstance] = useState<PointCloud>();
  const history = useRef(new ActionsHistory()).current;
  const [hideAttributes, setHideAttributes] = useState<string[]>([]);
  const [attrPanelLayout, setAttrPanelLayout] = useState<AttrPanelLayout>('left');

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

    const displayPointCloudList = pointCloudBoxList.filter(
      (i) => !hideAttributes.includes(i.attribute),
    );

    const toggleAttributesVisible = (tAttribute: string) => {
      if (hideAttributes.includes(tAttribute)) {
        setHideAttributes(hideAttributes.filter((attribute) => attribute !== tAttribute));
      } else {
        const updatedHideAttributes = hideAttributes.concat(tAttribute);
        setHideAttributes(updatedHideAttributes);
      }
    };

    const reRender = (
      _displayPointCloudList: IPointCloudBoxList = displayPointCloudList,
      _polygonList: IPolygonData[] = polygonList,
    ) => {
      _displayPointCloudList.forEach((v) => {
        mainViewInstance?.removeObjectByName(v.id);
      });

      topViewInstance?.updatePolygonList(_displayPointCloudList, _polygonList);
      mainViewInstance?.generateBoxes(_displayPointCloudList);
    };

    return {
      selectedID,
      pointCloudBoxList,
      displayPointCloudList,
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
      zoom,
      setZoom,
      history,
      toggleAttributesVisible,
      hideAttributes,
      setHideAttributes,
      reRender,
      attrPanelLayout,
      setAttrPanelLayout,
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
    zoom,
    hideAttributes,
    attrPanelLayout,
  ]);

  const updateSelectedIDsAndRenderAfterHide = () => {
    const pointCloudForFilteredList = pointCloudBoxList.filter((i) =>
      hideAttributes.includes(i.attribute),
    );

    const { setSelectedIDs, reRender } = ptCtx;

    const filteredIDs = pointCloudForFilteredList.map((i) => i.id);

    if (filteredIDs.length > 0) {
      setSelectedIDs(selectedIDs.filter((id) => !filteredIDs.includes(id)));
    }

    reRender();
  };

  useEffect(() => {
    updateSelectedIDsAndRenderAfterHide();
    topViewInstance?.pointCloud2dOperation?.setHiddenAttributes(hideAttributes);
  }, [hideAttributes]);

  return <PointCloudContext.Provider value={ptCtx}>{children}</PointCloudContext.Provider>;
};
