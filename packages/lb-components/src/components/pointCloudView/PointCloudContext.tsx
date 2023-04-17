import {
  IPointCloudBox,
  IPointCloudBoxList,
  IPolygonData,
  IPointCloudSphereList,
  IPointCloudSphere,
  ILine,
} from '@labelbee/lb-utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  PointCloud,
  PointCloudAnnotation,
  ActionsHistory,
  EToolName,
} from '@labelbee/lb-annotation';

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
  pointCloudSphereList: IPointCloudSphereList;
  displayPointCloudList: IPointCloudBoxList;
  displaySphereList: IPointCloudSphereList;
  selectedIDs: string[];
  setSelectedIDs: (ids?: string[] | string) => void;
  valid: boolean;
  setPointCloudResult: (resultList: IPointCloudBoxList) => void;
  setPointCloudSphereList: (sphereList: IPointCloudSphereList) => void;
  selectedPointCloudBox?: IPointCloudBox;
  setPointCloudValid: (valid?: boolean) => void;
  addSelectedID: (selectedID: string) => void;
  selectedAllBoxes: () => void;
  selectedID: string;
  addPointCloudBox: (boxParams: IPointCloudBox) => IPointCloudBox[];
  addPointCloudSphere: (sphereParams: IPointCloudSphere) => IPointCloudSphere[];

  polygonList: IPolygonData[];
  setPolygonList: (polygonList: IPolygonData[]) => void;

  lineList: ILine[];
  setLineList: (lineList: ILine[]) => void;

  zoom: number;
  setZoom: (zoom: number) => void;

  history: ActionsHistory; // Operation History
  hideAttributes: string[];
  setHideAttributes: (hideAttrs: string[]) => void;
  toggleAttributesVisible: (attribute: string) => void;
  reRender: (
    _displayPointCloudList: IPointCloudBoxList,
    _polygonList: IPolygonData[],
    _displaySphereList: IPointCloudSphereList,
    _lineList: ILine[],
  ) => void;
  attrPanelLayout: AttrPanelLayout;
  setAttrPanelLayout: (layout: AttrPanelLayout) => void;

  syncAllViewPointCloudColor: (newPointCloudList?: IPointCloudBox[]) => void;

  defaultAttribute: string;
  setDefaultAttribute: (defaultAttribute: string) => void;

  pointCloudPattern: EToolName.Rect | EToolName.Polygon | EToolName.Point | EToolName.Line;
  setPointCloudPattern: (
    toolName: EToolName.Rect | EToolName.Polygon | EToolName.Point | EToolName.Line,
  ) => void;
  selectSpecAttr: (attr: string) => void;
}

export const PointCloudContext = React.createContext<IPointCloudContext>({
  pointCloudBoxList: [],
  pointCloudSphereList: [],
  displayPointCloudList: [],
  displaySphereList: [],
  polygonList: [],
  lineList: [],
  selectedID: '',
  selectedIDs: [],
  valid: true,
  setSelectedIDs: () => {},
  setPointCloudResult: () => {},
  setPointCloudSphereList: () => {},
  setPointCloudValid: () => {},
  setTopViewInstance: () => {},
  setSideViewInstance: () => {},
  setBackViewInstance: () => {},
  setMainViewInstance: () => {},
  addSelectedID: () => {},
  selectedAllBoxes: () => {},
  addPointCloudBox: () => {
    return [];
  },
  addPointCloudSphere: () => {
    return [];
  },
  setPolygonList: () => {},
  setLineList: () => {},

  zoom: 1,
  setZoom: () => {},
  history: new ActionsHistory(),
  hideAttributes: [],
  setHideAttributes: () => {},
  toggleAttributesVisible: () => {},
  reRender: () => {},
  setAttrPanelLayout: () => {},
  attrPanelLayout: '',
  syncAllViewPointCloudColor: () => {},

  defaultAttribute: '',
  setDefaultAttribute: () => {},

  pointCloudPattern: EToolName.Rect,
  setPointCloudPattern: () => {},
  selectSpecAttr: () => {},
});

export const PointCloudProvider: React.FC<{}> = ({ children }) => {
  const [pointCloudBoxList, setPointCloudResult] = useState<IPointCloudBoxList>([]);
  const [pointCloudSphereList, setPointCloudSphereList] = useState<IPointCloudSphereList>([]);
  const [polygonList, setPolygonList] = useState<IPolygonData[]>([]);
  const [lineList, setLineList] = useState<ILine[]>([]);
  const [selectedIDs, setSelectedIDsState] = useState<string[]>([]);
  const [valid, setValid] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1);
  const [topViewInstance, setTopViewInstance] = useState<PointCloudAnnotation>();
  const [sideViewInstance, setSideViewInstance] = useState<PointCloudAnnotation>();
  const [backViewInstance, setBackViewInstance] = useState<PointCloudAnnotation>();
  const [mainViewInstance, setMainViewInstance] = useState<PointCloud>();
  const [defaultAttribute, setDefaultAttribute] = useState('');
  const [pointCloudPattern, setPointCloudPattern] = useState<
    EToolName.Rect | EToolName.Polygon | EToolName.Point | EToolName.Line
  >(EToolName.Rect);
  const history = useRef(new ActionsHistory()).current;
  const [hideAttributes, setHideAttributes] = useState<string[]>([]);
  const [attrPanelLayout, setAttrPanelLayout] = useState<AttrPanelLayout>('');

  const selectedID = useMemo(() => {
    return selectedIDs.length === 1 ? selectedIDs[0] : '';
  }, [selectedIDs]);

  const ptCtx = useMemo(() => {
    const selectedPointCloudBox = pointCloudBoxList.find((v) => v.id === selectedID);

    const addPointCloudBox = (box: IPointCloudBox) => {
      const newPointCloudList = pointCloudBoxList.concat(box);
      setPointCloudResult(newPointCloudList);
      return newPointCloudList;
    };

    const addPointCloudSphere = (sphere: IPointCloudSphere) => {
      const newSphereList = pointCloudSphereList.concat(sphere);
      setPointCloudSphereList(newSphereList);
      return newSphereList;
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

    const selectSpecAttr = (attr: string) => {
      setSelectedIDs(pointCloudBoxList.filter((i) => i.attribute === attr).map((i) => i.id));
    };

    const displayPointCloudList = pointCloudBoxList.filter(
      (i) => !hideAttributes.includes(i.attribute),
    );

    const displaySphereList = pointCloudSphereList.filter(
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
      _displaySphereList: IPointCloudSphereList = displaySphereList,
      _lineList: ILine[] = lineList,
    ) => {
      pointCloudBoxList.forEach((v) => {
        mainViewInstance?.removeObjectByName(v.id);
      });

      pointCloudSphereList.forEach((v) => {
        mainViewInstance?.removeObjectByName(v.id);
      });

      lineList.forEach((v) => {
        mainViewInstance?.removeObjectByName(v.id);
      });

      topViewInstance?.updatePolygonList(_displayPointCloudList, _polygonList);
      topViewInstance?.updatePointList(_displaySphereList);
      topViewInstance?.updateLineList(_lineList);
      mainViewInstance?.generateBoxes(_displayPointCloudList);
      mainViewInstance?.generateSpheres(_displaySphereList);
      // mainViewInstance?.generateLine(_lineList);
      syncAllViewPointCloudColor(_displayPointCloudList);
    };

    /**
     * Synchronize the highlighted pointCloud for all views.
     * @param pointCloudList
     */

    const syncAllViewPointCloudColor = (pointCloudList?: IPointCloudBox[]) => {
      const colorPromise = mainViewInstance?.highlightOriginPointCloud(pointCloudList);
      return new Promise((resolve) => {
        colorPromise?.then((color) => {
          [topViewInstance].forEach((instance) => {
            if (color) {
              instance?.pointCloudInstance?.updateColor(color);
              resolve({ color });
            }
          });
          // TODO： Sync sideView & backView Color.
        });
      });
    };

    return {
      selectedID,
      pointCloudBoxList,
      pointCloudSphereList,
      displayPointCloudList,
      displaySphereList,
      selectedIDs,
      setPointCloudResult,
      setSelectedIDs,
      addPointCloudBox,
      addPointCloudSphere,
      setPointCloudSphereList,
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
      lineList,
      setLineList,
      zoom,
      setZoom,
      history,
      toggleAttributesVisible,
      hideAttributes,
      setHideAttributes,
      reRender,
      attrPanelLayout,
      setAttrPanelLayout,
      syncAllViewPointCloudColor,
      defaultAttribute,
      setDefaultAttribute,
      pointCloudPattern,
      setPointCloudPattern,
      selectSpecAttr,
    };
  }, [
    valid,
    selectedIDs,
    pointCloudBoxList,
    pointCloudSphereList,
    polygonList,
    lineList,
    topViewInstance,
    sideViewInstance,
    backViewInstance,
    mainViewInstance,
    zoom,
    hideAttributes,
    attrPanelLayout,
    defaultAttribute,
    pointCloudPattern,
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
