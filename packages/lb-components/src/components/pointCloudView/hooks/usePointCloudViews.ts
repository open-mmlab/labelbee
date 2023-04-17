/**
 * @file Point cloud interface for crud
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @createdate 2022-08-17
 */
import {
  PointCloudAnnotation,
  PointCloud,
  MathUtils,
  getCuboidFromPointCloudBox,
} from '@labelbee/lb-annotation';
import {
  IPointCloudBox,
  EPerspectiveView,
  PointCloudUtils,
  IPolygonPoint,
  UpdatePolygonByDragList,
  ILine,
} from '@labelbee/lb-utils';
import { useContext } from 'react';
import { PointCloudContext } from '../PointCloudContext';
import { useSingleBox } from './useSingleBox';
import { ISize } from '@/types/main';
import _ from 'lodash';
import { useDispatch, useSelector } from '@/store/ctx';
import { AppState } from '@/store';
import StepUtils from '@/utils/StepUtils';
import { jsonParser } from '@/utils';
import { SetPointCloudLoading } from '@/store/annotation/actionCreators';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useHistory } from './useHistory';
import { usePolygon } from './usePolygon';
import { IFileItem } from '@/types/data';

const DEFAULT_SCOPE = 5;
const DEFAULT_RADIUS = 90;

const PointCloudView = {
  '3D': '3D',
  Top: 'Top',
  Side: 'Side',
  Back: 'Back',
};
export const topViewLine2PointCloud = (
  newPolygon: any,
  size: ISize,
  pointCloud?: PointCloud,
  selectedPointCloudBox?: IPointCloudBox,
  defaultValue?: { [v: string]: any },
) => {
  const pointList = newPolygon.pointList.map((v: any) =>
    PointCloudUtils.transferCanvas2World(v, size),
  );
  let extraData = {};
  let totalLineLength = 0;
  pointList.forEach((p: any, i: number) => {
    const nextP = pointList[i + 1];
    if (nextP) {
      totalLineLength += MathUtils.getLineLength(p, nextP);
    }
  });
  const newPosition = {
    length: totalLineLength,
    id: newPolygon.id,
    linePointList: newPolygon.pointList,
  };
  const boxParams = {
    // Init Data
    ...newPosition,
    attribute: '',
    valid: true,
    ...extraData,
  };
  if (defaultValue) {
    Object.assign(boxParams, defaultValue);
  }
  console.log(boxParams);
  return boxParams;
};
export const topViewPolygon2PointCloud = (
  newPolygon: any,
  size: ISize,
  pointCloud?: PointCloud,
  selectedPointCloudBox?: IPointCloudBox,
  defaultValue?: { [v: string]: any },
) => {
  const [point1, point2, point3, point4] = newPolygon.pointList.map((v: any) =>
    PointCloudUtils.transferCanvas2World(v, size),
  );
  console.log(point1, point2, point3, point4, 9991);
  const centerPoint = MathUtils.getLineCenterPoint([point1, point3]);
  const height = MathUtils.getLineLength(point1, point2);
  const width = MathUtils.getLineLength(point2, point3);
  const rotation = MathUtils.getRadiusFromQuadrangle(newPolygon.pointList);
  let z = 0;
  let depth = 1;
  let extraData = {};

  // Init PointCloud Data
  if (pointCloud) {
    const zInfo = pointCloud.getSensesPointZAxisInPolygon([point1, point2, point3, point4]);
    z = (zInfo.maxZ + zInfo.minZ) / 2;
    depth = zInfo.maxZ - zInfo.minZ;
    extraData = {
      count: zInfo.zCount,
    };
  }

  if (selectedPointCloudBox) {
    z = selectedPointCloudBox.center.z;
    depth = selectedPointCloudBox.depth;
  }

  const newPosition = {
    center: {
      x: centerPoint.x,
      y: centerPoint.y,
      z,
    },
    width,
    height,
    depth,
    rotation,
    id: newPolygon.id,
  };

  /** TrackID will append before it pushed */
  const boxParams: Omit<IPointCloudBox, 'trackID'> = selectedPointCloudBox
    ? {
        ...selectedPointCloudBox,
        ...newPosition,
        ...extraData,
      }
    : {
        // Init Data
        ...newPosition,
        attribute: '',
        valid: true,
        ...extraData,
      };

  if (defaultValue) {
    Object.assign(boxParams, defaultValue);
  }

  return boxParams;
};

const sideViewPolygon2PointCloud = (
  newPolygon: any,
  originPolygon: any,
  selectedPointCloudBox: IPointCloudBox,
  pointCloudInstance: PointCloud,
) => {
  const [point1, point2, point3] = newPolygon.pointList;
  const [op1, op2, op3] = originPolygon.pointList;

  // 2D centerPoint => 3D x & z
  const newCenterPoint = MathUtils.getLineCenterPoint([point1, point3]);
  const oldCenterPoint = MathUtils.getLineCenterPoint([op1, op3]);

  const offset = {
    x: newCenterPoint.x - oldCenterPoint.x,
    y: newCenterPoint.y - oldCenterPoint.y,
  };

  /**
   * The key of sideView change is x & z, y isn't used.
   */
  const offsetCenterPoint = {
    x: offset.x,
    y: 0,
    z: newCenterPoint.y - oldCenterPoint.y,
  };

  // 2D height => 3D depth
  const height = MathUtils.getLineLength(point1, point2);
  const oldHeight = MathUtils.getLineLength(op1, op2);
  const offsetHeight = height - oldHeight; // 3D depth

  // 2D width => 3D width
  const width = MathUtils.getLineLength(point2, point3);
  const oldWidth = MathUtils.getLineLength(op2, op3);
  const offsetWidth = width - oldWidth; // 3D width

  const { newBoxParams } = pointCloudInstance.getNewBoxBySideUpdate(
    offsetCenterPoint,
    offsetWidth,
    offsetHeight,
    selectedPointCloudBox,
  );

  return newBoxParams;
};

const backViewPolygon2PointCloud = (
  newPolygon: any,
  originPolygon: any,
  selectedPointCloudBox: IPointCloudBox,
  pointCloudInstance: PointCloud,
) => {
  // Notice. The sort of polygon is important.
  const [point1, point2, point3] = newPolygon.pointList;
  const [op1, op2, op3] = originPolygon.pointList;

  // 2D centerPoint => 3D x & z
  const newCenterPoint = MathUtils.getLineCenterPoint([point1, point3]);
  const oldCenterPoint = MathUtils.getLineCenterPoint([op1, op3]);

  const offset = {
    x: newCenterPoint.x - oldCenterPoint.x,
    y: newCenterPoint.y - oldCenterPoint.y,
  };

  const offsetCenterPoint = {
    x: offset.x,
    y: 0, // Not be used.
    z: newCenterPoint.y - oldCenterPoint.y,
  };

  // 2D height => 3D depth
  const height = MathUtils.getLineLength(point1, point2);
  const oldHeight = MathUtils.getLineLength(op1, op2);
  const offsetHeight = height - oldHeight; // 3D depth

  // 2D width => 3D width
  const width = MathUtils.getLineLength(point2, point3);
  const oldWidth = MathUtils.getLineLength(op2, op3);
  const offsetWidth = width - oldWidth; // 3D width

  let { newBoxParams } = pointCloudInstance.getNewBoxByBackUpdate(
    offsetCenterPoint,
    offsetWidth,
    offsetHeight,
    selectedPointCloudBox,
  );

  return newBoxParams;
};
/**
 * NewBox synchronize sideView
 * @param boxParams
 * @param newPolygon TODO！ Need to add type
 */
export const synchronizeSideView = (
  boxParams: IPointCloudBox,
  newPolygon: any,
  sideViewInstance: PointCloudAnnotation | undefined,
  url: string,
) => {
  if (!sideViewInstance) {
    return;
  }

  const { pointCloud2dOperation, pointCloudInstance } = sideViewInstance;

  // Create PointCloud
  pointCloudInstance.loadPCDFileByBox(url, boxParams, {
    width: DEFAULT_SCOPE,
    depth: DEFAULT_SCOPE,
  });
  const { cameraPositionVector } = pointCloudInstance.updateOrthoCamera(
    boxParams,
    EPerspectiveView.Left,
  );

  pointCloudInstance.setInitCameraPosition(cameraPositionVector);

  // Create Draw Polygon
  const { polygon2d, zoom } = pointCloudInstance.getBoxSidePolygon2DCoordinate(boxParams);

  // Synchronize SidePointCloud zoom with PointCloud2dOperation
  pointCloudInstance.camera.zoom = zoom;
  pointCloudInstance.camera.updateProjectionMatrix();
  pointCloudInstance.render();

  // Update PolygonView to default zoom and currentPos.
  pointCloud2dOperation.initPosition();
  pointCloud2dOperation.zoomChangeOnCenter(zoom);
  pointCloud2dOperation.setResultAndSelectedID(
    [
      {
        id: newPolygon.id,
        valid: boxParams.valid,
        pointList: polygon2d,
        textAttribute: '',
        isRect: true,
        attribute: boxParams.attribute,
      },
    ],
    newPolygon.id,
  );
};

/**
 * NewBox synchronize backView
 * @param boxParams
 * @param newPolygon TODO！ Need to add type
 */
export const synchronizeBackView = (
  boxParams: IPointCloudBox,
  newPolygon: any,
  BackViewInstance: PointCloudAnnotation,
  url: string,
) => {
  if (!BackViewInstance) {
    return;
  }

  const {
    pointCloud2dOperation: backPointCloudPolygonOperation,
    pointCloudInstance: backPointCloud,
  } = BackViewInstance;

  // Create PointCloud
  backPointCloud.loadPCDFileByBox(url, boxParams, { height: DEFAULT_SCOPE, depth: DEFAULT_SCOPE });
  const { cameraPositionVector } = backPointCloud.updateOrthoCamera(
    boxParams,
    EPerspectiveView.Back,
  );

  backPointCloud.setInitCameraPosition(cameraPositionVector);

  // Create Draw Polygon
  const { polygon2d, zoom } = backPointCloud.getBoxBackPolygon2DCoordinate(boxParams);

  // Synchronize SidePointCloud zoom with PointCloud2dOperation
  backPointCloud.camera.zoom = zoom;
  backPointCloud.camera.updateProjectionMatrix();
  backPointCloud.render();

  // Update PolygonView to default zoom and currentPos.
  backPointCloudPolygonOperation.initPosition();
  backPointCloudPolygonOperation.zoomChangeOnCenter(zoom);
  backPointCloudPolygonOperation.setResultAndSelectedID(
    [
      {
        id: newPolygon.id,
        valid: boxParams.valid,
        pointList: polygon2d,
        textAttribute: '',
        isRect: true,
        attribute: boxParams.attribute,
      },
    ],
    newPolygon.id,
  );
};

/**
 * NewBox synchronize TopView
 * @param boxParams
 * @param newPolygon TODO！ Need to add type
 */
export const synchronizeTopView = (
  newBoxParams: IPointCloudBox,
  newPolygon: any,
  topViewInstance?: PointCloudAnnotation,
  mainViewInstance?: PointCloud,
) => {
  if (!topViewInstance || !mainViewInstance) {
    return;
  }

  // Control the 3D view data to create box
  mainViewInstance.generateBox(newBoxParams, newPolygon.id);
  mainViewInstance.updateCameraByBox(newBoxParams, EPerspectiveView.Top);
  mainViewInstance.render();

  const { pointCloud2dOperation, pointCloudInstance } = topViewInstance;

  const { polygon2d } = pointCloudInstance.getBoxTopPolygon2DCoordinate(newBoxParams);

  const newPolygonList = [...pointCloud2dOperation.polygonList];
  const oldPolygon = newPolygonList.find((v) => v.id === newPolygon.id);
  if (oldPolygon) {
    oldPolygon.pointList = polygon2d;
  } else {
    newPolygonList.push({
      id: newPolygon.id,
      pointList: polygon2d,
      textAttribute: '',
      isRect: true,
      valid: newBoxParams.valid ?? true,
    });
  }

  pointCloud2dOperation.setResultAndSelectedID(newPolygonList, newPolygon.id);
};

export const usePointCloudViews = () => {
  const ptCtx = useContext(PointCloudContext);
  const {
    topViewInstance,
    sideViewInstance,
    backViewInstance,
    mainViewInstance,
    addPointCloudBox,
    setSelectedIDs,
    selectedIDs,
    pointCloudBoxList,
    hideAttributes,
  } = ptCtx;
  const { addHistory, initHistory, pushHistoryUnderUpdatePolygon, pushHistoryUnderUpdateLine } =
    useHistory();
  const { selectedPolygon } = usePolygon();

  const { updateSelectedBox, updateSelectedBoxes, getPointCloudByID } = useSingleBox();
  const { currentData, config } = useSelector((state: AppState) => {
    const { stepList, step, imgList, imgIndex } = state.annotation;

    return {
      currentData: imgList[imgIndex],
      config: jsonParser(StepUtils.getCurrentStepInfo(step, stepList).config),
    };
  });
  const dispatch = useDispatch();
  const { selectedBox } = useSingleBox();
  const { t } = useTranslation();

  const selectedPointCloudBox = selectedBox?.info;

  if (!topViewInstance || !sideViewInstance || !backViewInstance) {
    return {
      topViewAddBox: () => {},
      topViewSelectedChanged: () => {},
      sideViewUpdateBox: () => {},
      backViewUpdateBox: () => {},
    };
  }

  const { pointCloudInstance: topViewPointCloud } = topViewInstance;

  const mainViewGenBox = (boxParams: IPointCloudBox) => {
    mainViewInstance?.generateBox(boxParams);
    mainViewInstance?.controls.update();
    mainViewInstance?.render();
  };

  /** Top-view create box from 2D */
  const topViewAddBox = ({
    newPolygon,
    size,
    imgList,
    trackConfigurable,
    zoom,
  }: {
    newPolygon: any;
    size: ISize;
    imgList: IFileItem[];
    trackConfigurable?: boolean;
    zoom: number;
  }) => {
    const extraData = {
      attribute: topViewInstance.toolInstance.defaultAttribute ?? '',
    };

    if (trackConfigurable === true) {
      Object.assign(extraData, {
        trackID: PointCloudUtils.getNextTrackID({
          imgList: [], // Just calculate by the pointCloudBoxList in current page.
          extraBoxList: pointCloudBoxList,
        }),
      });
    }
    const toolName = topViewInstance?.toolInstance.toolName;
    let newParams;
    const polygonOperation = topViewInstance?.toolInstance;

    if (toolName === 'lineTool') {
      newParams = topViewLine2PointCloud(newPolygon, size, topViewPointCloud, undefined, extraData);
    } else {
      newParams = topViewPolygon2PointCloud(
        newPolygon,
        size,
        topViewPointCloud,
        undefined,
        extraData,
      );
      // If the count is less than lowerLimitPointsNumInBox, needs to delete it
      if (
        config?.lowerLimitPointsNumInBox &&
        typeof newParams.count === 'number' &&
        newParams.count < config.lowerLimitPointsNumInBox
      ) {
        message.info(t('LowerLimitPointsNumInBox', { num: config.lowerLimitPointsNumInBox }));
        polygonOperation.deletePolygon(newParams.id);
        return;
      }
    }

    const boxParams: any = newParams;

    const isBoxHidden = hideAttributes.includes(newPolygon.attribute);
    console.log(3332);
    /** If new box is hidden will not active target point box */
    if (isBoxHidden) {
      setSelectedIDs([]);
    } else {
      setSelectedIDs(boxParams.id);
      const newPointCloudList = addPointCloudBox(boxParams);
      // polygonOperation.setSelectedIDs([newPolygon.id]);
      if (toolName !== 'lineTool') {
        syncPointCloudViews(PointCloudView.Top, newPolygon, boxParams, zoom, newPointCloudList);
      }
    }

    addHistory({ newBoxParams: boxParams });
  };

  /** Top-view selected changed and render to other view */
  const topViewSelectedChanged = (
    newSelectedBox?: IPointCloudBox,
    newPointCloudList?: IPointCloudBox[],
  ) => {
    const boxParams = newSelectedBox ?? selectedBox?.info;
    const polygonOperation = topViewInstance?.toolInstance;

    polygonOperation.setSelectedIDs(selectedIDs);

    if (selectedIDs.length === 0 || !polygonOperation) {
      return;
    }

    const polygon = polygonOperation.selectedPolygon;

    if (selectedIDs.length === 1 && boxParams) {
      syncPointCloudViews(PointCloudView.Top, polygon, boxParams, undefined, newPointCloudList);
      return;
    }
  };

  /**
   * Update box from view
   * @param newPolygon
   * @param originPolygon
   * @param fromView Back or Side
   */
  const viewUpdateBox = (newPolygon: any, originPolygon: any, fromView: string) => {
    if (selectedPointCloudBox) {
      let transfer2PointCloud;
      let newBoxParams;

      // Switch the right function.
      switch (fromView) {
        case PointCloudView.Back:
          transfer2PointCloud = backViewPolygon2PointCloud;
          break;
        case PointCloudView.Side:
          transfer2PointCloud = sideViewPolygon2PointCloud;
          break;

        default:
          transfer2PointCloud = sideViewPolygon2PointCloud;
          break;
      }

      newBoxParams = transfer2PointCloud(
        newPolygon,
        originPolygon,
        selectedPointCloudBox,
        sideViewInstance.pointCloudInstance,
      );
      // Update count
      if (mainViewInstance) {
        const { count } = mainViewInstance.getSensesPointZAxisInPolygon(
          getCuboidFromPointCloudBox(newBoxParams).polygonPointList as IPolygonPoint[],
          [
            newBoxParams.center.z - newBoxParams.depth / 2,
            newBoxParams.center.z + newBoxParams.depth / 2,
          ],
        );

        newBoxParams = {
          ...newBoxParams,
          count,
        };
      }

      const newPointCloudList = updateSelectedBox(newBoxParams);
      syncPointCloudViews(fromView, newPolygon, newBoxParams, undefined, newPointCloudList);
      return newPointCloudList;
    }
  };

  const sideViewUpdateBox = (newPolygon: any, originPolygon: any) => {
    viewUpdateBox(newPolygon, originPolygon, PointCloudView.Side);
  };

  const backViewUpdateBox = (newPolygon: any, originPolygon: any) => {
    viewUpdateBox(newPolygon, originPolygon, PointCloudView.Back);
  };

  const topViewUpdateLine = (updateList: ILine, size: ISize) => {
    // updateList.pointList = updateList.pointList.map((v) =>
    //   PointCloudUtils.transferCanvas2World(v, size),
    // );

    pushHistoryUnderUpdateLine(updateList);
    return;
  };
  /**
   * Top view box updated and sync views
   * @param polygon
   * @param size
   */
  const topViewUpdateBox = (updateList: UpdatePolygonByDragList, size: ISize) => {
    // If the selected Object is Polygon.
    if (selectedPolygon) {
      console.log(updateList, 6665);
      /**
       * Notice. The Polygon need to be converted to pointCloud coordinate system for storage.
       */
      const polygon = updateList[0].newPolygon;
      polygon.pointList = polygon.pointList.map((v) =>
        PointCloudUtils.transferCanvas2World(v, size),
      );

      pushHistoryUnderUpdatePolygon(updateList[0].newPolygon);
      return;
    }

    const updatePointCloudList: IPointCloudBox[] = updateList.map(({ newPolygon: polygon }) => {
      const pointCloudBox = getPointCloudByID(polygon.id);

      const newBoxParams = topViewPolygon2PointCloud(
        polygon,
        size,
        topViewInstance.pointCloudInstance,
        pointCloudBox,
      );

      return newBoxParams;
    });

    /**
     * If single target updated, use syncPointCloudViews to sync all views and render
     * If multi targets updated, use updateSelectedBoxes and update highlight by syncAllViewPointCloudColor
     */
    if (updatePointCloudList.length === 1) {
      const { newPolygon: polygon } = updateList[0];
      const newPointCloudBoxList = updateSelectedBoxes(updatePointCloudList);

      syncPointCloudViews(
        PointCloudView.Top,
        polygon,
        updatePointCloudList[0],
        undefined,
        newPointCloudBoxList,
      );
    } else {
      const newPointCloudBoxList = updateSelectedBoxes(updatePointCloudList);
      if (newPointCloudBoxList) {
        ptCtx.syncAllViewPointCloudColor(newPointCloudBoxList);
      }
    }
  };

  /**
   * Sync views' data from omit view, regenerate and highlight box on 3D-view
   * @param omitView
   * @param polygon
   * @param boxParams
   */
  const syncPointCloudViews = async (
    omitView: string,
    polygon: any,
    boxParams: IPointCloudBox,
    zoom?: number,
    newPointCloudBoxList?: IPointCloudBox[],
  ) => {
    const dataUrl = currentData?.url;
    const toolName = topViewInstance?.toolInstance.toolName;
    if (newPointCloudBoxList) {
      // Wait for the mainPointCloudData.
      await ptCtx.syncAllViewPointCloudColor(newPointCloudBoxList);
    }
    console.log(886);
    const viewToBeUpdated = {
      [PointCloudView.Side]: () => {
        synchronizeSideView(boxParams, polygon, sideViewInstance, dataUrl);
      },
      [PointCloudView.Back]: () => {
        if (backViewInstance) {
          synchronizeBackView(boxParams, polygon, backViewInstance, dataUrl);
        }
      },
      [PointCloudView.Top]: () => {
        synchronizeTopView(boxParams, polygon, topViewInstance, mainViewInstance);
      },
    };
    if (toolName !== 'lineTool') {
      Object.keys(viewToBeUpdated).forEach((key) => {
        if (key !== omitView) {
          viewToBeUpdated[key]();
        }
      });
    }

    if (zoom) {
      mainViewInstance?.updateCameraZoom(zoom);
    }

    mainViewGenBox(boxParams);
  };

  const pointCloudBoxListUpdated = (newBoxes: IPointCloudBox[]) => {
    topViewInstance.updatePolygonList(newBoxes);
    mainViewInstance?.generateBoxes(newBoxes);
  };

  const initPointCloud3d = (size: ISize) => {
    if (!mainViewInstance) {
      return;
    }

    const orthographicParams = {
      left: -size.width / 2,
      right: size.width / 2,
      top: size.height / 2,
      bottom: -size.height / 2,
      near: 100,
      far: -100,
    };

    mainViewInstance.initOrthographicCamera(orthographicParams);
    mainViewInstance.initRenderer();
    mainViewInstance.render();
  };

  /**
   * Update the data of pointCloudView when the page change.
   * @returns
   */
  const updatePointCloudData = async () => {
    if (!currentData?.url || !mainViewInstance) {
      return;
    }

    SetPointCloudLoading(dispatch, true);
    await mainViewInstance.loadPCDFile(currentData.url, config?.radius ?? DEFAULT_RADIUS);

    // Clear All Data
    pointCloudBoxList.forEach((v) => {
      mainViewInstance?.removeObjectByName(v.id);
    });

    let boxParamsList: any[] = [];
    let polygonList = [];
    if (currentData.result) {
      boxParamsList = PointCloudUtils.getBoxParamsFromResultList(currentData.result);
      polygonList = PointCloudUtils.getPolygonListFromResultList(currentData.result);

      // Add Init Box
      boxParamsList.forEach((v: IPointCloudBox) => {
        mainViewInstance?.generateBox(v);
      });

      ptCtx.syncAllViewPointCloudColor(boxParamsList);
      ptCtx.setPointCloudResult(boxParamsList);
      ptCtx.setPolygonList(polygonList);
    } else {
      ptCtx.setPointCloudResult([]);
      ptCtx.setPolygonList([]);
    }
    initHistory({ pointCloudBoxList: boxParamsList, polygonList });

    mainViewInstance.updateTopCamera();

    const valid = jsonParser(currentData.result)?.valid ?? true;
    ptCtx.setPointCloudValid(valid);

    // Clear other view data during initialization
    ptCtx.sideViewInstance?.clearAllData();
    ptCtx.backViewInstance?.clearAllData();

    // TopView Data Update
    /**
     * Listen to flip
     * 1. Init
     * 2. Reload PointCloud
     * 3. Clear Polygon
     */
    topViewInstance.updateData(currentData.url, currentData.result, {
      radius: config?.radius ?? DEFAULT_RADIUS,
    });
    SetPointCloudLoading(dispatch, false);
  };

  return {
    topViewAddBox,
    topViewSelectedChanged,
    topViewUpdateBox,
    topViewUpdateLine,
    sideViewUpdateBox,
    backViewUpdateBox,
    pointCloudBoxListUpdated,
    initPointCloud3d,
    updatePointCloudData,
  };
};
