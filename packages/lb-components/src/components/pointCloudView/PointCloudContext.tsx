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
  ICoordinate,
} from '@labelbee/lb-utils';
import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  EPointCloudBoxRenderTrigger,
  calcResetAreasAndBoxIds,
} from '@/utils/ToolPointCloudBoxRenderHelper';
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

import useTimeoutFunc from './hooks/useTimeoutFunc';
import useWindowKeydownListener, {
  getEmptyUseWindowKeydownListener,
  WindowKeydownListenerHooker,
} from './hooks/useWindowKeydownListener';

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

type PickRectObjct = Pick<
  IPointCloud2DRectOperationViewRect,
  'id' | 'attribute' | 'width' | 'height' | 'x' | 'y' | 'imageName'
>;

type UpdateRectListByReducer = (
  reducer: (
    prevRectList: IPointCloudBoxRect[],
    pickRectObject: (item: IPointCloud2DRectOperationViewRect) => PickRectObjct,
  ) => IPointCloudBoxRect[],
) => void;

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
    syncByTrigger: EPointCloudBoxRenderTrigger,
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
  highlight2DLoading: boolean;
  setHighlight2DLoading: (loading: boolean) => void;
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

  updateRectListByReducer: UpdateRectListByReducer;
  windowKeydownListenerHook: WindowKeydownListenerHooker;
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
  highlight2DLoading: false,
  setHighlight2DLoading: () => {},
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

  updateRectListByReducer: () => {},
  windowKeydownListenerHook: getEmptyUseWindowKeydownListener(),
});

export const PointCloudProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [pointCloudBoxList, setPointCloudResult_] = useState<IPointCloudBoxList>([]);
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
  const [highlight2DLoading, setHighlight2DLoading] = useState<boolean>(false);
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

  const windowKeydownListenerHook = useWindowKeydownListener();

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

  const updateRectListByReducer = useCallback<UpdateRectListByReducer>(
    (reducer) => {
      setRectList((rectList) => {
        return reducer(rectList, pickRectObject);
      });
    },
    [pickRectObject],
  );

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

  // `setPointCloudResult` is a high frequency function, which can be
  //  avoided by using throttle in `setSelectedIDsState` case.
  const { fn: callWhenPointCloudResultChanged } = useTimeoutFunc((pcIds: string[]) => {
    setSelectedIDsState((ids) => {
      const remainIds = pcIds;

      const set = new Set(remainIds);
      let hasFiltered = false;
      const filtered = ids.filter((id) => {
        const r = set.has(id);

        if (!r) {
          hasFiltered = true;
        }

        return r;
      });

      if (hasFiltered) {
        return filtered;
      }

      return ids;
    });
  }, 200);

  const setPointCloudResult = useCallback((resultList: IPointCloudBoxList) => {
    const pcIds = resultList.map((item) => item.id);
    setPointCloudResult_(resultList);

    // Keep the selectedIDs in `pointCloudBoxList` list
    callWhenPointCloudResultChanged(pcIds);
  }, []);

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
      syncAllViewPointCloudColor(EPointCloudBoxRenderTrigger.Default, _displayPointCloudList);
    };

    const clearAllDetectionInstance = () => {
      setTopViewInstance(undefined);
      setSideViewInstance(undefined);
      setBackViewInstance(undefined);
      setMainViewInstance(undefined);
    };

    /**
     * Synchronize the highlighted pointCloud for all views.
     * @param syncByTrigger
     * If you are not clear about the role of syncByTrigger, please do not change it at will,
     * just pass it directly to EPointCloudBoxRenderTrigger.Default.
     * Will perform full rendering
     * @param pointCloudList
     */

    const syncAllViewPointCloudColor = async (
      syncByTrigger: EPointCloudBoxRenderTrigger,
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

      let modifiedBoxIds: string[] = [];
      let resetAreas: ICoordinate[][] = [];
      try {
        if (pointCloudList && history.record.length) {
          const { record, recordIndex } = history;

          let latestRecordIndex = recordIndex;

          // The history of these triggers was updated before highlighting, so take the previous index
          // 0. SingleToggleValid SingleRotate
          // The case of Single is more special.
          // 1. The newly added history update is after rendering, so the last subscript is taken
          // 2. Modify is before rendering and takes the second to last subscript
          if (
            recordIndex > 0 &&
            (syncByTrigger === EPointCloudBoxRenderTrigger.SingleToggleValid || // SingleToggleValid (mark 0)
              syncByTrigger === EPointCloudBoxRenderTrigger.SingleRotate || // SingleRotate (mark 0)
              (syncByTrigger === EPointCloudBoxRenderTrigger.Single &&
                pointCloudList.length === record[recordIndex]?.pointCloudBoxList.length)) // Single + Modify, exclude Single + Add (mark 2)
          ) {
            latestRecordIndex = recordIndex - 1;
          }

          let latestRecord = record[latestRecordIndex]?.pointCloudBoxList;
          const calcRes = calcResetAreasAndBoxIds(syncByTrigger, pointCloudList, latestRecord);

          modifiedBoxIds = calcRes.modifiedBoxIds;
          resetAreas = calcRes.resetAreas;
        }
      } catch (error) {
        console.error('call calcResetAreasAndBoxIds error', error);
      }

      try {
        const highlightIndex = await mainViewInstance.getHighlightIndexByMappingImgList({
          mappingImgList: newHighlight2DDataList ?? highlight2DDataList, // MappingImgList can be defined by through external param.
          points: points.geometry.attributes.position.array,
        });


        const color = await mainViewInstance?.highlightOriginPointCloud(
          pointCloudList,
          highlightIndex,
          {
            modifiedBoxIds,
            resetAreas,
          },
        );
        color && topViewInstance?.pointCloudInstance?.updateColor(color);
        return color;
      } catch (error) {
        console.error('call highlightOriginPointCloud error', error);
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
      highlight2DLoading,
      setHighlight2DLoading,
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

      updateRectListByReducer,
      windowKeydownListenerHook,
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
    highlight2DLoading,
    cuboidBoxIn2DView,
    imageSizes,
    highlightIDs,
    removeRectByPointCloudBoxId,
    removeRectBySpecifyId,
    addRectFromPointCloudBoxByImageName,
    rectRotateSensitivity,
    imageNamePointCloudBoxMap,
    linkageImageNameRectMap,

    updateRectListByReducer,
    windowKeydownListenerHook,
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
