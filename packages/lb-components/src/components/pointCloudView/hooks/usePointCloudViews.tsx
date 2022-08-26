/**
 * @file Point cloud interface for crud
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @createdate 2022-08-17
 */
import { PointCloudAnnotation, PointCloud, MathUtils } from '@labelbee/lb-annotation';
import { IPointCloudBox, EPerspectiveView } from '@labelbee/lb-utils';
import { useContext } from 'react';
import { PointCloudContext } from '../PointCloudContext';
import { useSingleBox } from './useSingleBox';
import { ISize } from '@/types/main';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { AppState } from '@/store';

const DEFAULT_SCOPE = 5;

const PointCloudView = {
  '3D': '3D',
  Top: 'Top',
  Side: 'Side',
  Back: 'Back',
};

/**
 * Get the coordinate from canvas2d-coordinate to world coordinate
 */
export const transferCanvas2World = (
  currentPos: { x: number; y: number },
  size: { width: number; height: number },
) => {
  const { width: w, height: h } = size;
  const { x, y } = currentPos;

  // x-Axis is the Positive Direction, so the x-coordinates need to be swapped with the y-coordinates
  return {
    x: -y + h / 2,
    y: -(x - w / 2),
  };
};

export const topViewPolygon2PointCloud = (
  newPolygon: any,
  size: ISize,
  pointCloud?: PointCloud,
  selectedPointCloud?: IPointCloudBox,
) => {
  const [point1, point2, point3, point4] = newPolygon.pointList.map((v: any) =>
    transferCanvas2World(v, size),
  );

  const centerPoint = MathUtils.getLineCenterPoint([point1, point3]);
  const height = MathUtils.getLineLength(point1, point2);
  const width = MathUtils.getLineLength(point2, point3);
  const rotation = MathUtils.getRadiusFromQuadrangle(newPolygon.pointList);
  let z = 0;
  let depth = 1;
  if (pointCloud) {
    const zInfo = pointCloud.getSensesPointZAxisInPolygon([point1, point2, point3, point4]);
    z = (zInfo.maxZ + zInfo.minZ) / 2;
    depth = zInfo.maxZ - zInfo.minZ;
  }

  if (selectedPointCloud) {
    z = selectedPointCloud.center.z;
    depth = selectedPointCloud.depth;
  }

  /** TrackID will append before it pushed */
  const boxParams: Omit<IPointCloudBox, 'trackID'> = {
    center: {
      x: centerPoint.x,
      y: centerPoint.y,
      z,
    },
    width,
    height,
    depth,
    rotation: rotation,
    id: newPolygon.id,
    attribute: '',
    valid: true,
  };

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

  const cos = Math.cos(selectedPointCloudBox.rotation);
  const sin = Math.sin(selectedPointCloudBox.rotation);

  const offsetCenterPoint = {
    x: offset.x,
    y: offset.x * sin + offset.y * cos,
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
        pointList: polygon2d,
        textAttribute: '',
        isRect: true,
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
        pointList: polygon2d,
        textAttribute: '',
        isRect: true,
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
    });
  }

  pointCloud2dOperation.setResultAndSelectedID(newPolygonList, newPolygon.id);
};

export const usePointCloudViews = () => {
  const {
    topViewInstance,
    sideViewInstance,
    backViewInstance,
    mainViewInstance,
    addPointCloudBox,
    setSelectedIDs,
    selectedIDs,
    pointCloudBoxList,
    setPointCloudResult,
  } = useContext(PointCloudContext);
  const { updateSelectedBox } = useSingleBox();

  const currentData = useSelector(
    (state: AppState) => state.annotation.imgList[state.annotation.imgIndex],
  );

  const { selectedBox } = useSingleBox();

  const selectedPointCloudBox = selectedBox?.info;

  if (!topViewInstance || !sideViewInstance) {
    return {
      topViewAddBox: () => {},
      topViewSelectedChanged: () => {},
      sideViewUpdateBox: () => {},
    };
  }

  const { pointCloudInstance: topViewPointCloud } = topViewInstance;

  const getNextTrackID = () => {
    if (pointCloudBoxList.length > 0) {
      const sortedPcList = pointCloudBoxList.sort((a, b) => a.trackID - b.trackID);
      return sortedPcList.slice(-1)[0]?.trackID + 1;
    }

    return 1;
  };

  const mainViewGenBox = (boxParams: IPointCloudBox) => {
    mainViewInstance?.generateBox(boxParams);
    mainViewInstance?.controls.update();
    mainViewInstance?.render();
  };

  /** Top-view create box from 2D */
  const topViewAddBox = (newPolygon: any, size: ISize) => {
    const newParams = topViewPolygon2PointCloud(newPolygon, size, topViewPointCloud);
    const polygonOperation = topViewInstance?.pointCloud2dOperation;

    const boxParams: IPointCloudBox = Object.assign(newParams, {
      trackID: getNextTrackID(),
    });

    polygonOperation.setSelectedIDs([newPolygon.id]);
    setSelectedIDs(boxParams.id);
    syncPointCloudViews(PointCloudView.Top, newPolygon, boxParams);
    addPointCloudBox(boxParams);
  };

  /** Top-view selected changed and render to other view */
  const topViewSelectedChanged = () => {
    const boxParams = selectedBox?.info;
    const polygonOperation = topViewInstance?.pointCloud2dOperation;

    polygonOperation.setSelectedIDs(selectedIDs);
    if (!boxParams || !polygonOperation) {
      return;
    }

    const polygon = polygonOperation.selectedPolygon;
    syncPointCloudViews(PointCloudView.Top, polygon, boxParams);
  };

  /**
   * Update box from view
   * @param newPolygon
   * @param originPolygon
   * @param fromView Back or Side
   */
  const viewUpdateBox = (newPolygon: any, originPolygon: any, fromView: string) => {
    if (selectedPointCloudBox) {
      const newBoxParams = sideViewPolygon2PointCloud(
        newPolygon,
        originPolygon,
        selectedPointCloudBox,
        sideViewInstance.pointCloudInstance,
      );

      updateSelectedBox(newBoxParams);
      syncPointCloudViews(fromView, newPolygon, newBoxParams);
    }
  };

  const sideViewUpdateBox = (newPolygon: any, originPolygon: any) => {
    viewUpdateBox(newPolygon, originPolygon, PointCloudView.Side);
  };

  const backViewUpdateBox = (newPolygon: any, originPolygon: any) => {
    viewUpdateBox(newPolygon, originPolygon, PointCloudView.Back);
  };

  /**
   * Top view box updated and sync views
   * @param polygon
   * @param size
   */
  const topViewUpdateBox = (polygon: any, size: ISize) => {
    if (selectedPointCloudBox) {
      const newBoxParams = topViewPolygon2PointCloud(
        polygon,
        size,
        undefined,
        selectedPointCloudBox,
      );

      Object.assign(
        selectedPointCloudBox,
        _.pickBy(newBoxParams, (v, k) => ['width', 'height', 'x', 'y']),
      );

      updateSelectedBox(newBoxParams);
      syncPointCloudViews(PointCloudView.Top, polygon, selectedPointCloudBox);
    }
  };

  /**
   * Sync views' data from omit view, regenerate and highlight box on 3D-view
   * @param omitView
   * @param polygon
   * @param boxParams
   */
  const syncPointCloudViews = (omitView: string, polygon: any, boxParams: IPointCloudBox) => {
    const dataUrl = currentData?.url;

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

    Object.keys(viewToBeUpdated).forEach((key) => {
      if (key !== omitView) {
        viewToBeUpdated[key]();
      }
    });
    mainViewGenBox(boxParams);
    mainViewInstance?.hightLightOriginPointCloud(boxParams);
  };

  const pointCloudBoxListUpdated = (newBoxes: IPointCloudBox[]) => {
    topViewInstance.updatePolygonList(newBoxes);
    mainViewInstance?.generateBoxes(newBoxes);
  };

  const clearAllResult = () => {
    // Clear All PointView Data
    pointCloudBoxList.forEach((v) => {
      mainViewInstance?.removeObjectByName(v.id);
    });
    mainViewInstance?.render();

    setPointCloudResult([]);
    topViewInstance.pointCloud2dOperation.clearActiveStatus();
    topViewInstance.pointCloud2dOperation.clearResult();
  };

  return {
    topViewAddBox,
    topViewSelectedChanged,
    topViewUpdateBox,
    sideViewUpdateBox,
    backViewUpdateBox,
    pointCloudBoxListUpdated,
    clearAllResult,
  };
};
