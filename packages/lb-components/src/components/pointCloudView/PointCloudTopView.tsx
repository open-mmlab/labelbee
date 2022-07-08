/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-22 11:08:31
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-07-08 12:28:56
 */
import { ISize } from '@/types/main';
import { getClassName } from '@/utils/dom';
import {
  PolygonOperation,
  cTool,
  CanvasSchduler,
  PointCloud,
  MathUtils,
} from '@labelbee/lb-annotation';
import { EPerspectiveView, IPointCloudBox } from '@labelbee/lb-utils';
import React, { useEffect, useRef, useState } from 'react';
import { pointCloudMain } from './PointCloud3DView';
import { BackPointCloud, BackPointCloudPolygonOperation } from './PointCloudBackView';
import { PointCloudContext } from './PointCloudContext';
import { PointCloudContainer } from './PointCloudLayout';
import { SidePointCloud, SidePointCloudPolygonOperation } from './PointCloudSideView';

const { EPolygonPattern } = cTool;

const CreateEmptyImage = (size: { width: number; height: number }) => {
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, size.width, size.height);
    return canvas.toDataURL();
  }
  return '';
};

/**
 * Get the offset from canvas2d-coordinate to world coordinate
 * @param currentPos
 * @param size
 * @param zoom
 * @returns
 */
const TransferCanvas2WorldOffset = (
  currentPos: { x: number; y: number },
  size: { width: number; height: number },
  zoom = 1,
) => {
  const { width: w, height: h } = size;

  const canvasCenterPoint = {
    x: currentPos.x + (w * zoom) / 2,
    y: currentPos.y + (h * zoom) / 2,
  };

  const worldCenterPoint = {
    x: size.width / 2,
    y: size.height / 2,
  };

  return {
    offsetX: (worldCenterPoint.x - canvasCenterPoint.x) / zoom,
    offsetY: -(worldCenterPoint.y - canvasCenterPoint.y) / zoom,
  };
};

/**
 * Get the coordinate from canvas2d-coordinate to world coordinate
 */
const TransferCanvas2World = (
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

let TopPointCloud: any;
let TopPointCloudPolygonOperation: any;

/**
 * NewBox synchronize sideView
 * @param boxParams
 * @param newPolygon TODO！ Need to add type
 */
export const synchronizeSideView = (boxParams: IPointCloudBox, newPolygon: any, isInit = true) => {
  /**
   * TEMPLATE - Will be deleted.
   * For confirming the location.
   */
  SidePointCloud.generateBox(boxParams, newPolygon.id);

  // Create PointCloud
  SidePointCloud.loadPCDFileByBox('http://10.53.25.142:8001/1/000001.pcd', boxParams);
  const { cameraPositionVector } = SidePointCloud.updateOrthoCamera(
    boxParams,
    EPerspectiveView.Left,
  );

  if (isInit) {
    SidePointCloud.setInitCameraPosition(cameraPositionVector);
  }
  // Create Draw Polygon
  const { polygon2d, zoom } = SidePointCloud.getBoxSidePolygon2DCoordinate(boxParams);

  // Synchronize SidePointCloud zoom with PolygonOperation
  SidePointCloud.camera.zoom = zoom;
  SidePointCloud.camera.updateProjectionMatrix();
  SidePointCloud.render();

  // Update PolygonView to default zoom and currentPos.
  SidePointCloudPolygonOperation.initPosition();
  SidePointCloudPolygonOperation.zoomChangeOnCenter(zoom);
  SidePointCloudPolygonOperation.setResultAndSelectedID(
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
export const synchronizeBackView = (boxParams: IPointCloudBox, newPolygon: any, isInit = true) => {
  /**
   * TEMPLATE - Will be deleted.
   * For confirming the location.
   */
  BackPointCloud.generateBox(boxParams, newPolygon.id);

  // Create PointCloud
  BackPointCloud.loadPCDFileByBox('http://10.53.25.142:8001/1/000001.pcd', boxParams);
  const { cameraPositionVector } = BackPointCloud.updateOrthoCamera(
    boxParams,
    EPerspectiveView.Back,
  );

  if (isInit) {
    BackPointCloud.setInitCameraPosition(cameraPositionVector);
  }
  // Create Draw Polygon
  const { polygon2d, zoom } = BackPointCloud.getBoxBackPolygon2DCoordinate(boxParams);

  // Synchronize SidePointCloud zoom with PolygonOperation
  BackPointCloud.camera.zoom = zoom;
  BackPointCloud.camera.updateProjectionMatrix();
  BackPointCloud.render();

  // Update PolygonView to default zoom and currentPos.
  BackPointCloudPolygonOperation.initPosition();
  BackPointCloudPolygonOperation.zoomChangeOnCenter(zoom);
  BackPointCloudPolygonOperation.setResultAndSelectedID(
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
export const synchronizeTopView = (newBoxParams: IPointCloudBox, newPolygon: any) => {
  // Control the 3Dview data to create box
  pointCloudMain.generateBox(newBoxParams, newPolygon.id);
  pointCloudMain.updateCameraByBox(newBoxParams, EPerspectiveView.Top);
  pointCloudMain.render();

  const { polygon2d } = TopPointCloud.getBoxTopPolygon2DCoordinate(newBoxParams);

  const newPolygonList = [...TopPointCloudPolygonOperation.polygonList];
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

  TopPointCloudPolygonOperation.setResultAndSelectedID(newPolygonList, newPolygon.id);
};

export const PointCloudTopView = () => {
  const ref = useRef<HTMLDivElement>(null);
  const plgOpraRef = useRef<PolygonOperation | null>();
  const ptCtx = React.useContext(PointCloudContext);
  const pointCloudRef = useRef<PointCloud | null>();

  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const mainViewGenBox = (boxParams: IPointCloudBox, polygonID: string) => {
    pointCloudMain.generateBox(boxParams, polygonID);
    pointCloudMain.controls.update();
    pointCloudMain.render();
  };

  const topViewPolygon2PointCloud = (
    newPolygon: any,
    size: ISize,
    pointCloud?: PointCloud,
    selectedPointCloud?: IPointCloudBox,
  ) => {
    const [point1, point2, point3, point4] = newPolygon.pointList.map((v: any) =>
      TransferCanvas2World(v, size),
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

    const boxParams: IPointCloudBox = {
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
      // TODO: fix trackID
      trackID: 0,
    };

    return boxParams;
  };

  const afterPolygonCreated = (newPolygon: any, pointCloud: PointCloud, size: ISize) => {
    const newParams = topViewPolygon2PointCloud(newPolygon, size, pointCloud);

    ptCtx.setPointCloudResult(ptCtx.pointCloudBoxList.concat(newParams));
    ptCtx.setSelectedID(newParams.id);

    mainViewGenBox(newParams, newPolygon.id);

    return {
      boxParams: newParams,
    };
  };

  useEffect(() => {
    if (ref.current) {
      const size = {
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
      };

      const defaultOrthographic = {
        left: -size.width / 2,
        right: size.width / 2,
        top: size.height / 2,
        bottom: -size.height / 2,
        near: 100,
        far: -100,
      };

      const container = ref.current;
      const imgSrc = CreateEmptyImage(size);

      const image = new Image();
      image.src = imgSrc;
      image.onload = () => {
        const canvasSchuler = new CanvasSchduler({ container });
        const pointCloud = new PointCloud({
          container,
          noAppend: true,
          isOrthographicCamera: true,
          orthgraphicParams: defaultOrthographic,
        });

        pointCloudRef.current = pointCloud;
        pointCloud.loadPCDFile('http://10.53.25.142:8001/1/000001.pcd');

        // TODO.
        TopPointCloud = pointCloud;
        canvasSchuler.createCanvas(pointCloud.renderer.domElement);

        const polygonOperation = new PolygonOperation({
          container: ref.current as HTMLDivElement,
          size,
          config: '{ "textConfigurable": false, "poinCloudPattern": true }',
          imgNode: image,
          isAppend: false,
        });

        plgOpraRef.current = polygonOperation;

        polygonOperation.eventBinding();
        polygonOperation.setPattern(EPolygonPattern.Rect);
        TopPointCloudPolygonOperation = polygonOperation;

        polygonOperation.singleOn('polygonCreated', (polygon: any) => {
          const { boxParams } = afterPolygonCreated(polygon, pointCloud, size);

          synchronizeSideView(boxParams, polygon);
          synchronizeBackView(boxParams, polygon);
        });

        polygonOperation.singleOn('selectedChange', () => {
          const selectedID = polygonOperation.selectedID;
          ptCtx.setSelectedID(selectedID ?? '');

          const boxParams = ptCtx.pointCloudBoxList.find((v) => v.id === selectedID);
          const polygon = polygonOperation.selectedPolygon;

          // TODO! Need to Update setSeletctedID in PolygonOperation
          if (!boxParams || !polygon) {
            return;
          }

          synchronizeSideView(boxParams, polygon);
          synchronizeBackView(boxParams, polygon);
        });

        /**
         * Synchronized 3d point cloud view displacement operations
         *
         * Change Orthographic Camera size
         */
        polygonOperation.singleOn('renderZoom', (zoom: number, currentPos: any) => {
          const { offsetX, offsetY } = TransferCanvas2WorldOffset(currentPos, size, zoom);
          pointCloud.camera.zoom = zoom;
          if (currentPos) {
            const { x, y, z } = TopPointCloud.initCameraPosition;
            TopPointCloud.camera.position.set(x + offsetY, y - offsetX, z);
          }

          pointCloud.camera.updateProjectionMatrix();
          pointCloud.render();
        });
        // Synchronized 3d point cloud view displacement operations
        polygonOperation.singleOn('dragMove', ({ currentPos, zoom }) => {
          const { offsetX, offsetY } = TransferCanvas2WorldOffset(currentPos, size, zoom);
          pointCloud.camera.zoom = zoom;
          const { x, y, z } = TopPointCloud.initCameraPosition;
          TopPointCloud.camera.position.set(x + offsetY, y - offsetX, z);
          pointCloud.render();
        });

        canvasSchuler.createCanvas(polygonOperation.canvas, { size });
        setSize(size);
      };
    }
  }, []);

  useEffect(() => {
    if (!size) {
      return;
    }

    if (plgOpraRef.current) {
      plgOpraRef.current.singleOn('polygonCreated', (polygon: any) => {
        if (pointCloudRef.current && ref.current) {
          const { boxParams } = afterPolygonCreated(polygon, TopPointCloud, {
            width: ref.current.clientWidth,
            height: ref.current.clientHeight,
          });
          synchronizeSideView(boxParams, polygon);
          synchronizeBackView(boxParams, polygon);
        }
      });

      plgOpraRef.current.singleOn('selectedChange', () => {
        const polygonOperation = plgOpraRef.current;
        if (!polygonOperation) {
          return;
        }

        const selectedID = polygonOperation.selectedID;
        ptCtx.setSelectedID(selectedID ?? '');

        const boxParams = ptCtx.pointCloudBoxList.find((v) => v.id === selectedID);
        const polygon = polygonOperation.selectedPolygon;
        if (!boxParams || !polygon) {
          return;
        }

        synchronizeSideView(boxParams, polygon);
        synchronizeBackView(boxParams, polygon);
      });

      TopPointCloudPolygonOperation.singleOn('updatePolygonByDrag', ({ newPolygon }: any) => {
        if (!ptCtx.selectedPointCloudBox) {
          return;
        }

        const newBoxParams = topViewPolygon2PointCloud(
          newPolygon,
          size,
          undefined,
          ptCtx.selectedPointCloudBox,
        );
        newBoxParams.depth = ptCtx.selectedPointCloudBox.depth;
        newBoxParams.center.z = ptCtx.selectedPointCloudBox.center.z;

        mainViewGenBox(newBoxParams, newPolygon.id);

        synchronizeSideView(newBoxParams, newPolygon);
        synchronizeBackView(newBoxParams, newPolygon);
        ptCtx.updateSelectedPointCloud(newPolygon.id, newBoxParams);
      });
    }
  }, [ptCtx, size]);

  return (
    <PointCloudContainer
      className={getClassName('point-cloud-container', 'top-view')}
      title='俯视图'
    >
      <div style={{ width: '100%', height: 500 }} ref={ref} />
    </PointCloudContainer>
  );
};

export default PointCloudTopView;

export { TopPointCloudPolygonOperation, TopPointCloud };
