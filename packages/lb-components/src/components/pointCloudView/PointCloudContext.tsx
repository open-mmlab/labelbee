import {
  IPointCloudBox,
  IPointCloudBoxList,
  IPolygonData,
  IPointCloudSphereList,
  IPointCloudSphere,
  ILine,
  EPointCloudPattern,
  IPointCloudSegmentation,
  ICalib,
  ISize,
  IPointCloudBoxRect,
  IPointCloud2DRectOperationViewRect,
} from '@labelbee/lb-utils';
import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  PointCloud,
  PointCloudAnnotation,
  ActionsHistory,
  EToolName,
  uuid,
} from '@labelbee/lb-annotation';
import { useDispatch } from '@/store/ctx';
import { ChangeSave } from '@/store/annotation/actionCreators';
import useAnnotatedBoxStore from '@/store/annotatedBox';
import _ from 'lodash';
import type { MapIndirectWeakSet } from './utils/map';
import { addMapIndirectWeakSetItem } from './utils/map';


interface IPointCloudContextInstances {
  topViewInstance?: PointCloudAnnotation;
  sideViewInstance?: PointCloudAnnotation;
  backViewInstance?: PointCloudAnnotation;
  mainViewInstance?: PointCloud;
  setTopViewInstance: (instance?: PointCloudAnnotation) => void;
  setSideViewInstance: (instance?: PointCloudAnnotation) => void;
  setBackViewInstance: (instance?: PointCloudAnnotation) => void;
  setMainViewInstance: (instance?: PointCloud) => void;
}

interface IPointCloudStatus {
  globalPattern: EPointCloudPattern; // Switch PointCloud Pattern (Segmentation / Detection)
  setGlobalPattern: (pattern: EPointCloudPattern) => void;
}

interface IPointCloudSegment {
  ptSegmentInstance?: PointCloud;
  setPtSegmentInstance: (instance?: PointCloud) => void;
}

type AttrPanelLayout = '' | 'left' | 'right';

interface IHighlight2DData {
  url: string;
  fallbackUrl: string;
  calib?: ICalib;
}

export interface IPointCloudContext
  extends IPointCloudContextInstances,
    IPointCloudStatus,
    IPointCloudSegment {
  pointCloudBoxList: IPointCloudBoxList;
  rectList: IPointCloudBoxRect[];
  pointCloudSphereList: IPointCloudSphereList;
  displayPointCloudList: IPointCloudBoxList;
  displaySphereList: IPointCloudSphereList;
  displayLineList: ILine[];
  selectedIDs: string[];
  setSelectedIDs: (ids?: string[] | string) => void;
  valid: boolean;
  setPointCloudResult: (resultList: IPointCloudBoxList) => void;
  setPointCloudSphereList: (sphereList: IPointCloudSphereList) => void;
  selectedPointCloudBox?: IPointCloudBox;
  setPointCloudValid: (valid?: boolean) => void;
  addSelectedID: (selectedID: string) => void;
  addHighlightID: (highlightID: number) => void;
  selectedAllBoxes: () => void;
  selectedID: string;
  highlightIDs: number[];
  setHighlightIDs: (ids: number[]) => void;
  addPointCloudBox: (boxParams: IPointCloudBox) => IPointCloudBox[];
  addPointCloudSphere: (sphereParams: IPointCloudSphere) => IPointCloudSphere[];

  polygonList: IPolygonData[];
  setPolygonList: (polygonList: IPolygonData[]) => void;
  setRectList: (rectList: IPointCloudBoxRect[]) => void;
  addRectIn2DView: (rect: IPointCloud2DRectOperationViewRect) => void;
  removeRectIn2DView: (rects: IPointCloud2DRectOperationViewRect[]) => void;
  updateRectIn2DView: (rect: IPointCloud2DRectOperationViewRect, mergeSelf?: boolean) => void;
  lineList: ILine[];
  setLineList: (lineList: ILine[]) => void;

  zoom: number;
  setZoom: (zoom: number) => void;
  cuboidBoxIn2DView: boolean;
  setCuboidBoxIn2DView: (bool: boolean) => void;
  history: ActionsHistory; // Operation History
  hideAttributes: string[];
  setHideAttributes: (hideAttrs: string[]) => void;
  toggleAttributesVisible: (attribute: string) => void;
  reRender: (
    _displayPointCloudList: IPointCloudBoxList,
    _polygonList: IPolygonData[],
    _displaySphereList: IPointCloudSphereList,
    _lineList: ILine[],
    _segmentation: IPointCloudSegmentation[],
  ) => void;
  attrPanelLayout: AttrPanelLayout;
  setAttrPanelLayout: (layout: AttrPanelLayout) => void;

  syncAllViewPointCloudColor: (
    newPointCloudList?: IPointCloudBox[],
    newHighlight2DDataList?: IHighlight2DData[],
  ) => Promise<any>;

  defaultAttribute: string;
  setDefaultAttribute: (defaultAttribute: string) => void;

  pointCloudPattern: EToolName.Rect | EToolName.Polygon | EToolName.Point | EToolName.Line;
  setPointCloudPattern: (
    toolName: EToolName.Rect | EToolName.Polygon | EToolName.Point | EToolName.Line,
  ) => void;
  selectSpecAttr: (attr: string) => void;
  segmentation: IPointCloudSegmentation[];
  setSegmentation: (segmentation: IPointCloudSegmentation[]) => void;
  clearAllDetectionInstance: () => void;

  highlight2DDataList: IHighlight2DData[];
  setHighlight2DDataList: (urlList: IHighlight2DData[]) => void;
  imageSizes: {
    [key: string]: ISize;
  };
  cacheImageNodeSize: (params: { imgNode: HTMLImageElement; path: string }) => void;

  addRectFromPointCloudBoxByImageName: (imageName: string) => boolean;
  removeRectBySpecifyId: (
    imageName: string,
    ids: string[],
    idField?: keyof IPointCloudBoxRect,
  ) => boolean;
  removeRectByPointCloudBoxId: (imageName: string) => boolean;
  rectRotateSensitivity: number; // Rect Rotate Sensitivity
  setRectRotateSensitivity: (sensitivity: number) => void;

  /** imageName -> pointCloudBox.id -> [pointCloudBox, ...] */
  imageNamePointCloudBoxMap: MapIndirectWeakSet<IPointCloudBox>;
  /** imageName -> pointCloudBox.id -> [rect, ...] */
  linkageImageNameRectMap: MapIndirectWeakSet<IPointCloudBoxRect>;
}

const pickRectObject = (rect: IPointCloud2DRectOperationViewRect) => {
  return _.pick(rect, ['id', 'attribute', 'width', 'height', 'x', 'y', 'imageName']);
};

export const PointCloudContext = React.createContext<IPointCloudContext>({
  rectList: [],
  pointCloudBoxList: [],
  pointCloudSphereList: [],
  displayPointCloudList: [],
  displaySphereList: [],
  displayLineList: [],
  polygonList: [],
  lineList: [],
  selectedID: '',
  selectedIDs: [],
  highlightIDs: [],
  setHighlightIDs: () => {},
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
  addHighlightID: () => {},
  selectedAllBoxes: () => {},
  addPointCloudBox: () => {
    return [];
  },
  addPointCloudSphere: () => {
    return [];
  },
  setPolygonList: () => {},
  setRectList: () => {},
  addRectIn2DView: () => {},
  removeRectIn2DView: () => {},
  updateRectIn2DView: () => {},
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
  syncAllViewPointCloudColor: () => {
    return Promise.resolve();
  },

  defaultAttribute: '',
  setDefaultAttribute: () => {},

  pointCloudPattern: EToolName.Rect,
  setPointCloudPattern: () => {},
  selectSpecAttr: () => {},

  globalPattern: EPointCloudPattern.Detection,
  setGlobalPattern: () => {},

  setPtSegmentInstance: () => {},
  segmentation: [],
  setSegmentation: () => {},
  clearAllDetectionInstance: () => {},

  highlight2DDataList: [],
  setHighlight2DDataList: () => {},
  cuboidBoxIn2DView: true,
  setCuboidBoxIn2DView: (bool?: boolean) => {},
  imageSizes: {},
  cacheImageNodeSize: () => {},

  addRectFromPointCloudBoxByImageName: (imageName: string) => false,
  removeRectBySpecifyId: (imageName: string, ids: string[], idField?: keyof IPointCloudBoxRect) =>
    false,
  removeRectByPointCloudBoxId: (imageName: string) => false,
  rectRotateSensitivity: 2,
  setRectRotateSensitivity: () => {},

  imageNamePointCloudBoxMap: new Map(),
  linkageImageNameRectMap: new Map(),
});

export const PointCloudProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [pointCloudBoxList, setPointCloudResult] = useState<IPointCloudBoxList>([]);
  const [pointCloudSphereList, setPointCloudSphereList] = useState<IPointCloudSphereList>([]);
  const [polygonList, setPolygonList] = useState<IPolygonData[]>([]);
  const [rectList, setRectList] = useState<IPointCloudBoxRect[]>([]);
  const [lineList, setLineList] = useState<ILine[]>([]);
  const [selectedIDs, setSelectedIDsState] = useState<string[]>([]);
  const [highlightIDs, setHighlightIDs] = useState<number[]>([]);
  const [valid, setValid] = useState<boolean>(true);
  const [rectRotateSensitivity, setRectRotateSensitivity] = useState<number>(2);
  const [cuboidBoxIn2DView, setCuboidBoxIn2DView] = useState<boolean>(true);
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
  const [globalPattern, setGlobalPattern] = useState(EPointCloudPattern.Detection);
  const [ptSegmentInstance, setPtSegmentInstance] = useState<PointCloud | undefined>(undefined);
  const [segmentation, setSegmentation] = useState<IPointCloudSegmentation[]>([]);
  const [highlight2DDataList, setHighlight2DDataList] = useState<IHighlight2DData[]>([]);
  const state = useAnnotatedBoxStore();

  const [imageSizes, setImageSizes] = useState<{
    [key: string]: ISize;
  }>({});

  const dispatch = useDispatch();

  const cacheImageNodeSize = (params: { imgNode: HTMLImageElement; path: string }) => {
    const { imgNode, path } = params;
    if (path && imgNode) {
      setImageSizes((prev) => {
        return {
          ...prev,
          [path]: {
            width: imgNode.width,
            height: imgNode.height,
          },
        };
      });
    }
  };

  const selectedID = useMemo(() => {
    return selectedIDs.length === 1 ? selectedIDs[0] : '';
  }, [selectedIDs]);

  const removeRectBySpecifyId = useCallback(
    (imageName: string, ids: string[], idField: keyof IPointCloudBoxRect = 'extId') => {
      const idField_ = idField || 'id';
      const set = new Set(ids);
      setRectList((prev: IPointCloudBoxRect[]) => {
        let hasFilterd = false;
        const newRectList = prev.filter((i) => {
          const val = i[idField_];
          const r = set.has(val) ? i.imageName !== imageName : true;
          if (!r) {
            hasFilterd = true;
          }

          return r;
        });

        if (!hasFilterd) {
          return prev;
        }

        return newRectList;
      });

      return true;
    },
    [],
  );

  const removeRectByPointCloudBoxId = useCallback(
    (imageName: string) => {
      const ids = pointCloudBoxList.map((item) => item.id);

      return removeRectBySpecifyId(imageName, ids, 'extId');
    },
    [pointCloudBoxList, removeRectBySpecifyId],
  );

  const addRectFromPointCloudBoxByImageName = useCallback(
    (imageName: string) => {
      if (!imageName) {
        return false;
      }

      const deltaRects: IPointCloudBoxRect[] = pointCloudBoxList
        .filter((item) => Array.isArray(item.rects))
        .map<IPointCloudBoxRect | null>((item) => {
          const { id, attribute, trackID } = item;
          const found = item.rects!.find((item) => item.imageName === imageName);
          if (found) {
            const base = _.pick(found, ['width', 'height', 'x', 'y', 'imageName']);

            return {
              ...base,
              id: uuid(),
              attribute: attribute,
              order: trackID,
              extId: id,
              lineDash: [],
            };
          }

          return null;
        })
        .filter((val): val is IPointCloudBoxRect => {
          return val !== null;
        });

      if (deltaRects.length) {
        setRectList((prev) => {
          // Avoid add repeatly
          const set = new Set(
            prev.filter((item) => imageName === item.imageName).map((item) => item.extId),
          );

          const filtered = deltaRects.filter((item) => set.has(item.extId) === false);

          if (filtered.length) {
            return [...prev, ...filtered];
          }

          return prev;
        });

        return true;
      }

      return false;
    },
    [pointCloudBoxList],
  );

  /** Map Shape: imageName -> id -> Set<[...pointCloudBoxList]> */
  const imageNamePointCloudBoxMap = useMemo(() => {
    // Strip the invalid items
    const filterRectsItems = pointCloudBoxList.filter(
      (item) => Array.isArray(item.rects) && item.rects.length > 0,
    );

    return filterRectsItems.reduce((r, item) => {
      item.rects?.forEach((rect) => {
        const { imageName } = rect;
        if (!imageName) {
          console.warn('Missing image name');
          console.trace(rect, item);

          return;
        }

        addMapIndirectWeakSetItem(r, imageName, item.id, item);
      });

      return r;
    }, new Map<string, Map<string, WeakSet<IPointCloudBox>>>());
  }, [pointCloudBoxList]);

  /**
   * Map Shape: imageName(with extId) -> id -> Set<[...rectList]>
   */
  const linkageImageNameRectMap = useMemo(() => {
    return (
      rectList
        // Strip the invalid items
        .filter(
          (item): item is IPointCloudBoxRect & Required<Pick<IPointCloudBoxRect, 'extId' | 'id'>> =>
            item.extId !== undefined && item.id !== undefined,
        )
        .reduce((r, item) => {
          const imageName = item.imageName;
          if (!imageName) {
            console.warn('missing image name');
            console.log(item, rectList);

            return r;
          }

          addMapIndirectWeakSetItem(r, imageName, item.extId, item);

          return r;
        }, new Map<string, Map<string, WeakSet<IPointCloudBoxRect>>>())
    );
  }, [rectList]);

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

    const addRectIn2DView = (rect: IPointCloud2DRectOperationViewRect) => {
      const newRect = pickRectObject(rect);
      setRectList((prev: IPointCloudBoxRect[]) => {
        return [...prev, newRect];
      });
    };

    const updateRectIn2DView = (rect: IPointCloud2DRectOperationViewRect, mergeSelf = false) => {
      const newRect = pickRectObject(rect);
      setRectList((prev: IPointCloudBoxRect[]) => {
        return prev.map((i) => {
          if (i.id === rect.id) {
            return mergeSelf ? { ...i, ...newRect } : newRect;
          }
          return i;
        });
      });
    };

    const removeRectIn2DView = (rects: IPointCloud2DRectOperationViewRect[]) => {
      setRectList((prev: IPointCloudBoxRect[]) => {
        return prev.filter((i) => !rects.find((rect) => rect.id === i.id));
      });
    };

    const addHighlightID = (highlightID: number) => {
      if (highlightIDs.includes(highlightID)) {
        setHighlightIDs([]);
      } else {
        setHighlightIDs([highlightID]);
      }
    };

    const selectedAllBoxes = () => {
      if (pointCloudPattern === EToolName.Rect) {
        const ids = pointCloudBoxList.map((i) => i.id);
        setSelectedIDs(ids);
        topViewInstance?.pointCloud2dOperation.setSelectedIDs(ids);
      }
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

    const displayLineList = lineList.filter(
      (i) => i.attribute && !hideAttributes.includes(i.attribute),
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
      _lineList: ILine[] = displayLineList,
      _segmentation: IPointCloudSegmentation[] = segmentation,
    ) => {
      mainViewInstance?.clearAllBox();
      mainViewInstance?.clearAllSphere();

      topViewInstance?.updatePolygonList(_displayPointCloudList, _polygonList);
      topViewInstance?.updatePointList(_displaySphereList);
      topViewInstance?.updateLineList(_lineList);
      mainViewInstance?.generateBoxes(_displayPointCloudList);
      mainViewInstance?.generateSpheres(_displaySphereList);
      ptSegmentInstance?.store?.updateCurrentSegment(_segmentation);
      syncAllViewPointCloudColor(_displayPointCloudList);
    };

    const clearAllDetectionInstance = () => {
      setTopViewInstance(undefined);
      setSideViewInstance(undefined);
      setBackViewInstance(undefined);
      setMainViewInstance(undefined);
    };

    /**
     * Synchronize the highlighted pointCloud for all views.
     * @param pointCloudList
     */

    const syncAllViewPointCloudColor = async (
      pointCloudList?: IPointCloudBox[],
      newHighlight2DDataList?: IHighlight2DData[],
    ) => {
      if (!mainViewInstance) {
        return;
      }

      const points = mainViewInstance.pointCloudObject;

      if (!points) {
        return;
      }

      try {
        const highlightIndex = await mainViewInstance.getHighlightIndexByMappingImgList({
          mappingImgList: newHighlight2DDataList ?? highlight2DDataList, // MappingImgList can be defined by through external param.
          points: points.geometry.attributes.position.array,
        });

        const color = await mainViewInstance?.highlightOriginPointCloud(
          pointCloudList,
          highlightIndex,
        );

        color && topViewInstance?.pointCloudInstance?.updateColor(color);
        return color;
      } catch (error) {
        console.error(error);
      }
    };

    const setGlobalPatternFuc = (pattern: EPointCloudPattern) => {
      if (globalPattern !== pattern) {
        dispatch(ChangeSave);
        setGlobalPattern(pattern);

        // Segment => Detection - Temporarily.
        if (pattern === EPointCloudPattern.Detection) {
          setPtSegmentInstance(undefined);
        }
      }
    };

    return {
      selectedID,
      pointCloudBoxList,
      pointCloudSphereList,
      displayPointCloudList,
      displaySphereList,
      displayLineList,
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
      addHighlightID,
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
      rectList,
      setRectList,
      addRectIn2DView,
      removeRectIn2DView,
      updateRectIn2DView,
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
      globalPattern,
      setGlobalPattern: setGlobalPatternFuc,
      ptSegmentInstance,
      setPtSegmentInstance,
      segmentation,
      setSegmentation,
      clearAllDetectionInstance,

      highlight2DDataList,
      setHighlight2DDataList,
      cuboidBoxIn2DView,
      setCuboidBoxIn2DView,
      imageSizes,
      cacheImageNodeSize,
      highlightIDs,
      setHighlightIDs,

      removeRectByPointCloudBoxId,
      removeRectBySpecifyId,
      addRectFromPointCloudBoxByImageName,
      rectRotateSensitivity,
      setRectRotateSensitivity,

      imageNamePointCloudBoxMap,
      linkageImageNameRectMap,
    };
  }, [
    valid,
    selectedIDs,
    pointCloudBoxList,
    pointCloudSphereList,
    polygonList,
    lineList,
    rectList,
    topViewInstance,
    sideViewInstance,
    backViewInstance,
    mainViewInstance,
    zoom,
    hideAttributes,
    attrPanelLayout,
    defaultAttribute,
    pointCloudPattern,
    globalPattern,
    ptSegmentInstance,
    segmentation,
    highlight2DDataList,
    cuboidBoxIn2DView,
    imageSizes,
    highlightIDs,
    removeRectByPointCloudBoxId,
    removeRectBySpecifyId,
    addRectFromPointCloudBoxByImageName,
    rectRotateSensitivity,
    imageNamePointCloudBoxMap,
    linkageImageNameRectMap,
  ]);

  useEffect(() => {
    state?.setPointCloudBoxList?.(pointCloudBoxList);
    state?.setHighlightIDs?.(highlightIDs);
    state?.setSelectedIDs?.(selectedIDs);
  }, [pointCloudBoxList, selectedIDs, highlightIDs]);

  useEffect(() => {
    state?.setPtCtx?.(ptCtx);
  }, [ptCtx]);

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
    topViewInstance?.toolInstance?.setHiddenAttributes?.(hideAttributes);
    ptSegmentInstance?.store?.setHiddenAttributes?.(hideAttributes);
  }, [hideAttributes]);

  return <PointCloudContext.Provider value={ptCtx}>{children}</PointCloudContext.Provider>;
};
