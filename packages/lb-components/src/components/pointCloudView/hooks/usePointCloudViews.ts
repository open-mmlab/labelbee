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
  EPointCloudName,
  TagUtils,
} from '@labelbee/lb-annotation';
import {
  IPointCloudBox,
  IPointCloudSphere,
  EPerspectiveView,
  PointCloudUtils,
  IPolygonPoint,
  IPointUnit,
  UpdatePolygonByDragList,
  DEFAULT_SPHERE_PARAMS,
  IDefaultSize,
  IPolygonData,
  IBasicRect,
  POINT_CLOUD_DEFAULT_STEP,
} from '@labelbee/lb-utils';
import { useCallback, useContext } from 'react';
import { PointCloudContext } from '../PointCloudContext';
import { useSingleBox } from './useSingleBox';
import { useSphere } from './useSphere';
import { ISize } from '@/types/main';
import _, { pick } from 'lodash';
import { useDispatch, useSelector } from '@/store/ctx';
import { AppState } from '@/store';
import StepUtils from '@/utils/StepUtils';
import { EPointCloudBoxRenderTrigger } from '@/utils/ToolPointCloudBoxRenderHelper';
import { jsonParser, getRectPointCloudBox, generatePointCloudBoxRects } from '@/utils';
import type { GeneratePointCloudBoxRectsOptions } from '@/utils';
import {
  PreDataProcess,
  SetAnnotationLoading,
  SetLoadPCDFileLoading,
} from '@/store/annotation/actionCreators';
import { useHistory } from './useHistory';
import { usePolygon } from './usePolygon';
import { IFileItem, IMappingImg } from '@/types/data';
import type { ICoordinate, IPointCloudBoxRect } from '@labelbee/lb-utils';
import { useLatest } from 'ahooks';

const DEFAULT_SCOPE = 5;
const DEFAULT_RADIUS = 90;

// leave a little margin when intelligentFit
const INTELLIGENT_FIT_MARGIN = 0.01;

const PointCloudView = {
  '3D': '3D',
  Top: 'Top',
  Side: 'Side',
  Back: 'Back',
};

export const topViewPoint2PointCloud = (
  newPoint: any,
  size: ISize,
  pointCloud: PointCloud,
  selectedPointCloudSphere?: IPointCloudSphere,
  defaultValue?: { [v: string]: any },
) => {
  const { x: realX, y: realY } = PointCloudUtils.transferCanvas2World(newPoint, size);
  const { defaultZ } = DEFAULT_SPHERE_PARAMS;

  const newPosition = {
    center: {
      x: realX,
      y: realY,
      z: defaultZ,
    },
    id: newPoint.id,
  };

  const sphereParams: IPointCloudSphere = selectedPointCloudSphere
    ? {
        ...selectedPointCloudSphere,
        ...newPosition,
      }
    : {
        ...newPosition,
        attribute: '',
        valid: true,
      };

  if (defaultValue) {
    Object.assign(sphereParams, defaultValue);
  }
  return sphereParams;
};

export const topViewPolygon2PointCloud = (
  newPolygon: any,
  size: ISize,
  pointCloud?: PointCloud,
  selectedPointCloudBox?: IPointCloudBox,
  defaultValue?: { [v: string]: any },
  intelligentFit?: boolean,
) => {
  let worldPointList = newPolygon.pointList.map((v: any) =>
    PointCloudUtils.transferCanvas2World(v, size),
  );
  let z = 0;
  let depth = 1;
  let extraData = {};

  // Init PointCloud Data
  if (pointCloud) {
    const zInfo = pointCloud.getSensesPointZAxisInPolygon(
      worldPointList,
      undefined,
      intelligentFit,
    );
    if (intelligentFit && zInfo.fittedCoordinates.length > 0) {
      worldPointList = zInfo.fittedCoordinates;
    }
    z = (zInfo.maxZ + zInfo.minZ) / 2;
    depth = zInfo.maxZ - zInfo.minZ;
    extraData = {
      count: zInfo.zCount,
    };
  }

  const [point1, point2, point3] = worldPointList;
  const centerPoint = MathUtils.getLineCenterPoint([point1, point3]);
  const height = MathUtils.getLineLength(point1, point2);
  const width = MathUtils.getLineLength(point2, point3);
  const rotation = MathUtils.getRadiusFromQuadrangle(newPolygon.pointList);

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
    width: intelligentFit ? width + INTELLIGENT_FIT_MARGIN : width,
    height: intelligentFit ? height + INTELLIGENT_FIT_MARGIN : height,
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

  // Polygon coordinates after fitting
  const newPointList = worldPointList.map((v: ICoordinate) =>
    PointCloudUtils.transferWorld2Canvas(v, size),
  );

  return { boxParams, newPointList };
};

const sideViewPoint2PointCloud = (
  newPoint: any,
  originPoint: any,
  selectedSphere: IPointCloudSphere,
) => {
  // 2D centerPoint => 3D x & z

  const offset = {
    x: newPoint.x - originPoint.x,
    y: newPoint.y - originPoint.y,
  };

  /**
   * The key of sideView change is x & z, y isn't used.
   */
  return {
    ...selectedSphere,
    center: {
      x: selectedSphere.center.x - offset.x,
      y: selectedSphere.center.y,
      z: selectedSphere.center.z - offset.y,
    },
  };
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

const backViewPoint2PointCloud = (
  newPoint: any,
  originPoint: any,
  selectedSphere: IPointCloudSphere,
) => {
  // 2D centerPoint => 3D y & z

  const offset = {
    x: newPoint.x - originPoint.x,
    y: newPoint.y - originPoint.y,
  };

  /**
   * The key of sideView change is x & z, y isn't used.
   */

  return {
    ...selectedSphere,
    center: {
      x: selectedSphere.center.x,
      y: selectedSphere.center.y - offset.x,
      z: selectedSphere.center.z - offset.y,
    },
  };
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
 *
 * @param sphereParams
 * @param newPoint
 * @param sideViewInstance
 * @param url
 * todo: need to be merged with func synchronizeSideView
 */

export const syncSideViewByPoint = (
  sphereParams: IPointCloudSphere,
  newPoint: IPointUnit,
  sideViewInstance: PointCloudAnnotation | undefined,
  url: string,
  config?: any,
) => {
  if (!sideViewInstance) {
    return;
  }

  const { toolInstance, pointCloudInstance } = sideViewInstance;

  // Create PointCloud
  pointCloudInstance.loadPCDFile(url, config?.radius ?? DEFAULT_RADIUS);
  const { cameraPositionVector } = pointCloudInstance.updateOrthoCameraBySphere(
    sphereParams,
    EPerspectiveView.Left,
  );

  pointCloudInstance.setInitCameraPosition(cameraPositionVector);

  const { point2d, zoom } = pointCloudInstance.getSphereSidePoint2DCoordinate(sphereParams);

  pointCloudInstance.camera.zoom = zoom;
  pointCloudInstance.camera.updateProjectionMatrix();
  pointCloudInstance.render();

  // Update PolygonView to default zoom and currentPos.
  toolInstance.initPosition();
  toolInstance.zoomChangeOnCenter(zoom);
  toolInstance.setResult([
    {
      ...newPoint,
      ...point2d,
      valid: sphereParams.valid,
      textAttribute: '',
      attribute: sphereParams.attribute,
    },
  ]);
  toolInstance.setSelectedID(newPoint.id);
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
 *
 * @param sphereParams
 * @param newPoint
 * @param backViewInstance
 * @param url
 * todo: need to be merged with func synchronizeBackView
 */

export const syncBackViewByPoint = (
  sphereParams: IPointCloudSphere,
  newPoint: IPointUnit,
  backViewInstance: PointCloudAnnotation | undefined,
  url: string,
  config?: any,
) => {
  if (!backViewInstance) {
    return;
  }

  const { toolInstance, pointCloudInstance } = backViewInstance;

  // Create PointCloud
  pointCloudInstance.loadPCDFile(url, config?.radius ?? DEFAULT_RADIUS);
  const { cameraPositionVector } = pointCloudInstance.updateOrthoCameraBySphere(
    sphereParams,
    EPerspectiveView.Back,
  );

  pointCloudInstance.setInitCameraPosition(cameraPositionVector);

  const { point2d, zoom } = pointCloudInstance.getSphereBackPoint2DCoordinate(sphereParams);

  pointCloudInstance.camera.zoom = zoom;
  pointCloudInstance.camera.updateProjectionMatrix();
  pointCloudInstance.render();

  // Update PolygonView to default zoom and currentPos.
  toolInstance.initPosition();
  toolInstance.zoomChangeOnCenter(zoom);
  toolInstance.setResult([
    {
      ...newPoint,
      ...point2d,
      valid: sphereParams.valid,
      textAttribute: '',
      attribute: sphereParams.attribute,
    },
  ]);
  toolInstance.setSelectedID(newPoint.id);
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

export const syncTopViewByPoint = (
  newSphereParams: IPointCloudSphere,
  newPoint: any,
  topViewInstance?: PointCloudAnnotation,
  mainViewInstance?: PointCloud,
) => {
  if (!topViewInstance || !mainViewInstance) {
    return;
  }
  mainViewInstance.generateSphere(newSphereParams);
  mainViewInstance.updateCameraBySphere(newSphereParams, EPerspectiveView.Top);
  mainViewInstance.render();

  const { toolInstance, pointCloudInstance } = topViewInstance;

  const { point2d } = pointCloudInstance.getSphereTopPoint2DCoordinate(newSphereParams);

  const newPointList = [...toolInstance.pointList].map((v) =>
    v.id === newPoint.id
      ? {
          ...newPoint,
          ...point2d,
          valid: newSphereParams.valid,
          textAttribute: '',
          attribute: newSphereParams.attribute,
        }
      : v,
  );
  toolInstance.setResult(newPointList);
  toolInstance.setSelectedID(newPoint.id);
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
  mainViewInstance.generateBox(newBoxParams);
  mainViewInstance.setHighlightColor(newBoxParams.id);
  mainViewInstance.render();

  const { pointCloud2dOperation, pointCloudInstance } = topViewInstance;

  const { polygon2d } = pointCloudInstance.getBoxTopPolygon2DCoordinate(newBoxParams);

  const newPolygonList = [...pointCloud2dOperation.polygonList];
  const oldPolygon = newPolygonList.find((v) => v.id === newPolygon.id);
  if (oldPolygon) {
    oldPolygon.pointList = polygon2d;
    oldPolygon.valid = newBoxParams.valid ?? true;
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

interface IUsePointCloudViewsParams {
  setResourceLoading?: (loading: boolean) => void;
}

/**
 * Sync views' data from omit view, regenerate and highlight box on 3D-view
 * @param omitView
 * @param polygon
 * @param boxParams
 */
interface ISyncPointCloudViews {
  // 如果不传omitView，则同步所有视图
  omitView?: string;
  polygon: any;
  boxParams: IPointCloudBox;
  zoom?: number;
  newPointCloudBoxList?: IPointCloudBox[];
}

export const usePointCloudViews = (params?: IUsePointCloudViewsParams) => {
  const ptCtx = useContext(PointCloudContext);
  const {
    topViewInstance,
    sideViewInstance,
    backViewInstance,
    mainViewInstance,
    addPointCloudBox,
    addPointCloudSphere,
    setSelectedIDs,
    selectedIDs,
    pointCloudBoxList,
    pointCloudSphereList,
    hideAttributes,
    setHighlight2DDataList,
    cuboidBoxIn2DView,
    imageSizes,
    history,
    linkageImageNameRectMap,
  } = ptCtx;
  const { addHistory, initHistory, pushHistoryUnderUpdatePolygon } = useHistory();
  const { selectedPolygon } = usePolygon();

  const { getPointCloudSphereByID, updatePointCloudSphere, selectedSphere } = useSphere();
  const { currentData, config } = useSelector((state: AppState) => {
    const { stepList, step, imgList, imgIndex } = state.annotation;

    return {
      currentData: imgList[imgIndex],
      config: jsonParser(StepUtils.getCurrentStepInfo(step, stepList).config),
    };
  });
  const dispatch = useDispatch();

  const cuboidBoxIn2DViewLatest = useLatest(cuboidBoxIn2DView);
  const linkageImageNameRectMapRef = useLatest(linkageImageNameRectMap);

  const prepareRectsFn = useCallback<
    NonNullable<GeneratePointCloudBoxRectsOptions['prepareRectsFn']>
  >((rects, pointCloudBox) => {
    const linkageImageNameRectMap = linkageImageNameRectMapRef.current;
    const extId = pointCloudBox.id;

    const newRects = rects.filter((rt) => {
      if (!rt) {
        return false;
      }

      const map = linkageImageNameRectMap.get(rt.imageName);

      // Be regarded as `connected` item
      if (map === undefined) {
        return true;
      }

      // Be regarded as `disconnected` item
      return Boolean(map.get(extId));
    });

    return newRects;
  }, []);

  const generateRects = (boxParams: IPointCloudBox) => {
    const { enableAutoMap2DRect = false } = config;
    if (!cuboidBoxIn2DViewLatest.current || enableAutoMap2DRect) {
      const { mappingImgList = [] } = currentData;
      generatePointCloudBoxRects(
        {
          pointCloudBox: boxParams,
          mappingImgList,
          imageSizes,
        },
        {
          prepareRectsFn,
        },
      );
    }
  };
  const { selectedBox, updateSelectedBox, updateSelectedBoxes, getPointCloudByID } = useSingleBox({
    generateRects,
  });

  const selectedPointCloudBox = selectedBox?.info;

  if (!topViewInstance || !sideViewInstance || !backViewInstance) {
    return {
      topViewAddSphere: () => {},
      topViewAddBox: () => {},
      topViewSelectedChanged: () => {},
      sideViewUpdateBox: () => {},
      backViewUpdateBox: () => {},
    };
  }

  const { pointCloudInstance: topViewPointCloud } = topViewInstance;

  const mainViewGenSphere = (sphereParams: IPointCloudSphere) => {
    mainViewInstance?.generateSphere(sphereParams);
    mainViewInstance?.controls.update();
    mainViewInstance?.render();
  };

  /**
   *  Top-view create sphere from 2D pointTool
   */
  const topViewAddSphere = ({
    newPoint,
    size,
    zoom,
    trackConfigurable,
  }: {
    newPoint: IPointUnit;
    size: ISize;
    zoom: number;
    trackConfigurable?: boolean;
  }) => {
    const extraData = {
      attribute: topViewInstance.toolInstance.defaultAttribute ?? '',
    };

    if (trackConfigurable === true) {
      Object.assign(extraData, {
        trackID: PointCloudUtils.getNextTrackID({
          imgList: [], // Just calculate by the pointCloudBoxList in current page.
          extraBoxList: [],
          extraSphereList: pointCloudSphereList,
        }),
      });
    }

    const sphereParams = topViewPoint2PointCloud(
      newPoint,
      size,
      topViewPointCloud,
      undefined,
      extraData,
    );

    setSelectedIDs(newPoint.id);
    const newSphereList = addPointCloudSphere(sphereParams);
    syncPointCloudPoint(PointCloudView.Top, newPoint, sphereParams, zoom, newSphereList, config);
    addHistory({ newSphereParams: sphereParams });
  };

  /** Top-view create box from 2D */
  const topViewAddBox = ({
    polygon,
    size,
    imgList,
    trackConfigurable,
    zoom,
    intelligentFit,
  }: {
    polygon: any;
    size: ISize;
    imgList: IFileItem[];
    trackConfigurable?: boolean;
    zoom: number;
    intelligentFit?: boolean;
  }) => {
    const extraData = {
      attribute: topViewInstance.toolInstance.defaultAttribute ?? '',
    };

    if (trackConfigurable === true) {
      Object.assign(extraData, {
        trackID: PointCloudUtils.getNextTrackID({
          imgList: [], // Just calculate by the pointCloudBoxList in current page.
          extraBoxList: pointCloudBoxList,
          extraSphereList: pointCloudSphereList,
        }),
      });
    }
    const polygonOperation = topViewInstance?.toolInstance;

    const newPolygon = { ...polygon };
    let { boxParams, newPointList } = topViewPolygon2PointCloud(
      newPolygon,
      size,
      topViewPointCloud,
      undefined,
      extraData,
      intelligentFit,
    );

    const nextResult = dispatch(
      PreDataProcess({
        tool: EPointCloudName.PointCloud,
        dataList: [boxParams],
        stepConfig: config,
        action: 'viewUpdateBox',
      }),
    ) as unknown as IPointCloudBox[];

    boxParams = nextResult[0];

    if (intelligentFit && newPointList?.length) {
      newPolygon.pointList = newPointList;
    }

    const isBoxHidden = hideAttributes.includes(newPolygon.attribute);
    generateRects(boxParams);
    const newPointCloudList = addPointCloudBox(boxParams);
    const polygonList = ptCtx?.polygonList ?? [];

    boxParams.subAttribute = TagUtils.getDefaultResultByConfig(
      config?.secondaryAttributeConfigurable ? config?.inputList ?? [] : [],
    );

    topViewInstance?.updatePolygonList(newPointCloudList ?? [], polygonList);
    /** If new box is hidden will not active target point box */
    if (isBoxHidden) {
      setSelectedIDs([]);
    } else {
      setSelectedIDs(boxParams.id);
      // 不需要重复通过polygonOperation.selection.setSelectedIDs设置2D视图选中id，会触发很多监听，耗时
      // 不需要执行syncPointCloudViews这个方法，这个方法会更新全部框体，添加的情况下只需要更新当前框体就行
      if (intelligentFit) {
        synchronizeTopView(boxParams, newPolygon, topViewInstance, mainViewInstance);
      }
    }

    addHistory({ newBoxParams: boxParams });
  };

  const update2DViewRect = (
    params: IBasicRect & {
      boxID: string;
      imageName: string;
    },
  ) => {
    const { boxID, imageName, width, height, x, y } = params;
    const currentBox = pointCloudBoxList.find((v) => v.id === boxID);
    if (!currentBox?.rects) {
      return;
    }

    const currentRect = currentBox.rects.find((v) => v.imageName === imageName);
    if (!currentRect) {
      return;
    }

    const updatedRects = currentBox.rects.map((rect) =>
      rect.imageName === imageName ? { ...rect, width, height, x, y } : rect,
    );

    const updatedBox = { ...currentBox, rects: updatedRects };
    const updatedPointCloudBoxList = pointCloudBoxList.map((box) =>
      box.id === boxID ? updatedBox : box,
    );

    topViewInstance?.updatePolygonList(updatedPointCloudBoxList ?? []);
    return updatedPointCloudBoxList;
  };

  const remove2DViewRect = (params: { boxID: string; imageName: string }) => {
    const { boxID, imageName } = params;
    const currentBox = pointCloudBoxList.find((v) => v.id === boxID);
    if (!currentBox?.rects) {
      return;
    }

    const updatedRects = currentBox.rects.filter((rect) => rect.imageName !== imageName);
    const updatedBox = { ...currentBox, rects: updatedRects };
    const updatedPointCloudBoxList = pointCloudBoxList.map((box) =>
      box.id === boxID ? updatedBox : box,
    );

    topViewInstance?.updatePolygonList(updatedPointCloudBoxList ?? []);
    return updatedPointCloudBoxList;
  };

  /** Top-view selected changed and render to other view */
  const topViewSelectedChanged = ({
    newSelectedBox,
    newPointCloudList,
    newSelectedSphere,
    newSphereList,
  }: {
    newSelectedBox?: IPointCloudBox;
    newPointCloudList?: IPointCloudBox[];
    newSelectedSphere?: IPointCloudSphere;
    newSphereList?: IPointCloudSphere[];
  }) => {
    const operation = topViewInstance?.toolInstance;
    if (selectedIDs.length === 0 || !operation) {
      return;
    }
    if (newSelectedBox || selectedBox?.info) {
      const boxParams = newSelectedBox ?? selectedBox?.info;
      operation?.selection?.setSelectedIDs(selectedIDs[0]);
      const polygon = operation.selectedPolygon;
      if (selectedIDs.length === 1 && boxParams) {
        syncPointCloudViews({
          omitView: PointCloudView.Top,
          polygon,
          boxParams,
          newPointCloudBoxList: newPointCloudList,
        });
        return;
      }
    }

    if (newSelectedSphere || selectedSphere) {
      if (selectedIDs.length === 1) {
        const sphereParams = newSelectedSphere ?? selectedSphere;
        operation.setSelectedID(selectedIDs[0]);
        const point = operation.selectedPoint;
        if (sphereParams) {
          syncPointCloudPoint(
            PointCloudView.Top,
            point,
            sphereParams,
            undefined,
            newSphereList,
            config,
          );
        }
      }
    }
  };

  /**
   * Update box from view
   * @param newPolygon
   * @param originPolygon
   * @param fromView Back or Side
   */
  const viewUpdateBox = (
    newPolygon: any,
    originPolygon: any,
    fromView: string,
    trigger: EPointCloudBoxRenderTrigger = EPointCloudBoxRenderTrigger.Default,
  ) => {
    if (selectedPointCloudBox) {
      let transfer2PointCloud;
      let newBoxParams: IPointCloudBox;

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

      const nextResult = dispatch(
        PreDataProcess({
          tool: EPointCloudName.PointCloud,
          dataList: [newBoxParams],
          stepConfig: config,
          action: 'viewUpdateBox',
        }),
      ) as unknown as IPointCloudBox[];
      const newBox = nextResult[0];
      // 如果更新后的box valid没有变化，则不更新当前视图
      const updateCurrentView = newBoxParams.valid !== newBox.valid;

      newBoxParams = newBox;

      const newPointCloudBoxList = updateSelectedBox(newBoxParams);

      newBoxParams = newPointCloudBoxList.find(
        (item) => item.id === newBoxParams.id,
      ) as IPointCloudBox;

      syncPointCloudViews(
        {
          omitView: updateCurrentView ? undefined : fromView,
          polygon: newPolygon,
          boxParams: newBoxParams,
          newPointCloudBoxList,
        },
        trigger,
      );

      return newPointCloudBoxList;
    }
  };

  const viewUpdatePoint = (newPoint: IPointUnit, originPoint: IPointUnit, fromView: string) => {
    if (selectedSphere) {
      let transfer2PointCloud;
      let newSphereParams;

      // Switch the right function.
      switch (fromView) {
        case PointCloudView.Back:
          transfer2PointCloud = backViewPoint2PointCloud;
          break;
        case PointCloudView.Side:
          transfer2PointCloud = sideViewPoint2PointCloud;
          break;

        default:
          transfer2PointCloud = sideViewPoint2PointCloud;
          break;
      }

      newSphereParams = transfer2PointCloud(newPoint, originPoint, selectedSphere);

      const newSphereList = updatePointCloudSphere(newSphereParams);
      syncPointCloudPoint(fromView, newPoint, newSphereParams, undefined, newSphereList, config);
      return newSphereList;
    }
  };
  const sideViewUpdatePoint = (newPoint: IPointUnit, originPoint: IPointUnit) => {
    viewUpdatePoint(newPoint, originPoint, PointCloudView.Side);
  };

  const backViewUpdatePoint = (newPoint: IPointUnit, originPoint: IPointUnit) => {
    viewUpdatePoint(newPoint, originPoint, PointCloudView.Back);
  };

  const sideViewUpdateBox = (newPolygon: any, originPolygon: any) => {
    viewUpdateBox(
      newPolygon,
      originPolygon,
      PointCloudView.Side,
      EPointCloudBoxRenderTrigger.Single,
    );
  };

  const backViewUpdateBox = (newPolygon: any, originPolygon: any) => {
    viewUpdateBox(
      newPolygon,
      originPolygon,
      PointCloudView.Back,
      EPointCloudBoxRenderTrigger.Single,
    );
  };

  const topViewUpdatePoint = (updatePoint: IPointUnit, size: ISize) => {
    const pointCloudSphere = getPointCloudSphereByID(updatePoint.id);
    const newSphereParams = topViewPoint2PointCloud(
      updatePoint,
      size,
      topViewPointCloud,
      pointCloudSphere,
    );

    const newPointCloudSphereList = updatePointCloudSphere(newSphereParams);
    syncPointCloudPoint(
      PointCloudView.Top,
      updatePoint,
      newSphereParams,
      undefined,
      newPointCloudSphereList,
      config,
    );
  };
  /**
   * Top view box updated and sync views
   * @param polygon
   * @param size
   */
  const topViewUpdateBox = (updateList: UpdatePolygonByDragList, size: ISize) => {
    // If the selected Object is Polygon.
    if (selectedPolygon) {
      /**
       * Notice. The Polygon need to be converted to pointCloud coordinate system for storage.
       */
      const polygon = { ...updateList[0].newPolygon };
      polygon.pointList = polygon.pointList.map((v) =>
        PointCloudUtils.transferCanvas2World(v, size),
      );

      pushHistoryUnderUpdatePolygon(polygon);
      return;
    }

    let updatePointCloudList: IPointCloudBox[] = updateList.map(({ newPolygon: polygon }) => {
      const pointCloudBox = getPointCloudByID(polygon.id);

      const { boxParams } = topViewPolygon2PointCloud(
        polygon,
        size,
        topViewInstance.pointCloudInstance,
        pointCloudBox,
      );

      return boxParams;
    });

    updatePointCloudList = dispatch(
      PreDataProcess({
        tool: EPointCloudName.PointCloud,
        dataList: updatePointCloudList,
        stepConfig: config,
        action: 'viewUpdateBox',
      }),
    ) as unknown as IPointCloudBox[];

    /**
     * If single target updated, use syncPointCloudViews to sync all views and render
     * If multi targets updated, use updateSelectedBoxes and update highlight by syncAllViewPointCloudColor
     */
    if (updatePointCloudList.length === 1) {
      const { newPolygon: polygon } = updateList[0];
      const newPointCloudBoxList = updateSelectedBoxes(updatePointCloudList);
      syncPointCloudViews(
        {
          polygon,
          boxParams: updatePointCloudList[0],
          newPointCloudBoxList,
        },
        EPointCloudBoxRenderTrigger.Single,
      );
    } else {
      const newPointCloudBoxList = updateSelectedBoxes(updatePointCloudList);
      if (newPointCloudBoxList) {
        ptCtx.syncAllViewPointCloudColor(
          EPointCloudBoxRenderTrigger.MultiMove,
          newPointCloudBoxList,
        );
      }
    }
  };

  const updateViewsByDefaultSize = (defaultSize: IDefaultSize) => {
    if (selectedBox) {
      const widthDefault = Number(defaultSize.widthDefault);
      const depthDefault = Number(defaultSize.depthDefault);
      const heightDefault = Number(defaultSize.heightDefault);
      const selectedBoxTrackID = selectedBox?.info.trackID;
      const polygonList = topViewInstance?.toolInstance?.polygonList;
      const originPolygon = polygonList.find(
        (v: IPolygonData) => v?.trackID === selectedBoxTrackID,
      );
      const size = {
        width: topViewInstance?.toolInstance?.basicImgInfo?.width,
        height: topViewInstance?.toolInstance?.basicImgInfo?.height,
      };
      const pointsInWorld = originPolygon.pointList.map((p: ICoordinate) =>
        PointCloudUtils.transferCanvas2World(p, size),
      );
      const newPolygonPoints = MathUtils.getModifiedRectangleCoordinates(
        pointsInWorld,
        heightDefault,
        widthDefault,
      );
      const point1 = newPolygonPoints[0];
      const point3 = newPolygonPoints[2];
      const centerPoint = MathUtils.getLineCenterPoint([point1, point3]);
      const bottomZ = selectedBox.info.center.z - selectedBox.info.depth / 2;
      // attention: widthDefault means the length of line between point1 and point2,
      // so the height of box should be widthDefault, as same as in topViewPolygon2PointCloud("height = MathUtils.getLineLength(point1, point2)")
      const newBoxParams: IPointCloudBox = {
        ...selectedBox.info,
        center: {
          x: centerPoint.x,
          y: centerPoint.y,
          z: bottomZ + depthDefault / 2,
        },
        width: widthDefault,
        height: heightDefault,
        depth: depthDefault,
        valid: true,
      };
      const newPointCloudBoxList = updateSelectedBoxes([newBoxParams]);
      syncPointCloudViews({
        omitView: PointCloudView['3D'],
        polygon: originPolygon,
        boxParams: newBoxParams,
        newPointCloudBoxList,
      });
    }
  };
  /**
   * Sync views after adding a point
   */
  const syncPointCloudPoint = async (
    omitView: string,
    point: any,
    sphereParams: IPointCloudSphere,
    zoom?: number,
    newPointCloudSphereList?: IPointCloudSphere[],
    config?: any,
  ) => {
    const dataUrl = currentData?.url;

    const viewToBeUpdated = {
      [PointCloudView.Side]: () => {
        syncSideViewByPoint(sphereParams, point, sideViewInstance, dataUrl, config);
      },
      [PointCloudView.Back]: () => {
        if (backViewInstance) {
          syncBackViewByPoint(sphereParams, point, backViewInstance, dataUrl, config);
        }
      },
      [PointCloudView.Top]: () => {
        syncTopViewByPoint(sphereParams, point, topViewInstance, mainViewInstance);
      },
    };

    Object.keys(viewToBeUpdated).forEach((key) => {
      if (key !== omitView) {
        viewToBeUpdated[key]();
      }
    });
    if (zoom) {
      mainViewInstance?.updateCameraZoom(zoom);
    }
    mainViewGenSphere(sphereParams);
  };

  const syncPointCloudViews = (
    params: ISyncPointCloudViews,
    trigger: EPointCloudBoxRenderTrigger = EPointCloudBoxRenderTrigger.Default,
  ) => {
    const { omitView, polygon, boxParams, zoom, newPointCloudBoxList } = params;

    const dataUrl = currentData?.url;

    /**
     * Highlight New Data.
     */
    if (newPointCloudBoxList) {
      // Wait for the mainPointCloudData.
      ptCtx.syncAllViewPointCloudColor(trigger, newPointCloudBoxList);
    }
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

    if (zoom) {
      mainViewInstance?.updateCameraZoom(zoom);
    }
  };

  const pointCloudBoxListUpdated = (newBoxes: IPointCloudBox[]) => {
    topViewInstance.updatePolygonList(newBoxes);
    mainViewInstance?.generateBoxes(newBoxes);
  };

  const initPointCloud3d = (size: ISize) => {
    if (!mainViewInstance) {
      return;
    }

    const orthographicParams = PointCloudUtils.getDefaultOrthographicParams(size);

    mainViewInstance.initOrthographicCamera(orthographicParams);
    mainViewInstance.initRenderer();
    mainViewInstance.render();
  };

  /**
   * Update the data of pointCloudView when the page change.
   * @returns
   */
  const updatePointCloudData = async (newData = currentData) => {
    if (!newData?.url || !mainViewInstance) {
      return;
    }
    /**
     * Init Cache Data.
     */
    setHighlight2DDataList([]);

    SetAnnotationLoading(dispatch, true);
    SetLoadPCDFileLoading(dispatch, true);
    params?.setResourceLoading?.(true);
    await mainViewInstance.loadPCDFile(newData.url, config?.radius ?? DEFAULT_RADIUS);

    mainViewInstance?.clearAllBox();
    mainViewInstance?.clearAllSphere();

    let boxParamsList: any[] = [];
    let lineList: any[] = [];
    let polygonList: any[] = [];
    let sphereParamsList: IPointCloudSphere[] = [];

    mainViewInstance.updateTopCamera();

    const valid = jsonParser(newData.result)?.valid ?? true;
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

    if (newData.result) {
      boxParamsList = PointCloudUtils.getBoxParamsFromResultList(newData.result);

      if (
        boxParamsList?.length > 0 &&
        newData.isPreResult &&
        config?.lowerLimitPointsNumInBox > 0
      ) {
        // @ts-ignore
        boxParamsList = await mainViewInstance?.filterPreResult(newData.url, config, boxParamsList);

        const newDataResultObj = jsonParser(newData.result);

        newDataResultObj[POINT_CLOUD_DEFAULT_STEP].result = boxParamsList;

        newData.result = JSON.stringify(newDataResultObj);

        ptCtx.setPointCloudResult(boxParamsList);
      }
      polygonList = PointCloudUtils.getPolygonListFromResultList(newData.result);
      lineList = PointCloudUtils.getLineListFromResultList(newData.result);
      sphereParamsList = PointCloudUtils.getSphereParamsFromResultList(newData.result);

      topViewInstance.updateData(newData.url, newData.result, {
        radius: config?.radius ?? DEFAULT_RADIUS,
      });
      // Add Init Box
      mainViewInstance?.generateBoxes(boxParamsList);
      mainViewInstance?.generateSpheres(sphereParamsList);

      /**
       * Use [] to replace the default highlight2DDataList.
       * Need to await syncAllViewPointCloudColor before setLoading(false).
       */
      await ptCtx.syncAllViewPointCloudColor(
        EPointCloudBoxRenderTrigger.Default,
        boxParamsList,
        [],
      );
    }

    initHistory({
      pointCloudBoxList: boxParamsList,
      polygonList,
      lineList,
      pointCloudSphereList: sphereParamsList,
    });

    SetAnnotationLoading(dispatch, false);
    SetLoadPCDFileLoading(dispatch, false);
    params?.setResourceLoading?.(false);
  };

  return {
    topViewAddSphere,
    topViewAddBox,
    topViewSelectedChanged,
    topViewUpdatePoint,
    sideViewUpdatePoint,
    backViewUpdatePoint,
    topViewUpdateBox,
    sideViewUpdateBox,
    backViewUpdateBox,
    syncPointCloudViews,
    syncPointCloudPoint,
    pointCloudBoxListUpdated,
    initPointCloud3d,
    updatePointCloudData,
    updateViewsByDefaultSize,
    generateRects,
    update2DViewRect,
    remove2DViewRect,
  };
};

type PosDim = Pick<IBasicRect, 'x' | 'y' | 'width' | 'height'>;

export const useSyncRectPositionDimensionToPointCloudList = () => {
  const { pointCloudBoxList, rectList, setPointCloudResult } = useContext(PointCloudContext);

  const pointCloudBoxListRef = useLatest(pointCloudBoxList);
  const rectListRef = useLatest(rectList);

  const syncToPointCloudBoxList = useCallback(() => {
    const pCloudBoxList = pointCloudBoxListRef.current;
    const rects = rectListRef.current;

    if (rects.length === 0) {
      return null;
    }

    const posDimMap = new Map<string, Map<string, PosDim>>();
    const extIdSet = new Set();
    rects
      .filter((rect) => rect.extId !== undefined)
      .forEach((rect) => {
        const extId = rect.extId!;
        const imageName = rect.imageName;
        const posDim = pick<IPointCloudBoxRect, keyof PosDim>(rect, ['x', 'y', 'width', 'height']);

        let item = posDimMap.get(extId);
        if (!item) {
          item = new Map();
          posDimMap.set(extId, item);
        }

        item.set(imageName, posDim);
        extIdSet.add(extId);
      });

    if (posDimMap.size) {
      const newPointCloudBoxList = pCloudBoxList.map((item) => {
        const id = item.id;
        if (extIdSet.has(id)) {
          const newItem = { ...item };

          // Update position and dimension if found
          newItem.rects?.forEach((rect) => {
            const imageName = rect.imageName;
            Object.assign(rect, posDimMap.get(id)?.get(imageName));
          });

          return newItem;
        }

        return item;
      });

      setPointCloudResult(newPointCloudBoxList);

      return newPointCloudBoxList;
    }

    return null;
  }, []);

  return {
    syncToPointCloudBoxList,
  };
};
