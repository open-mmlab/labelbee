/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-22 11:08:31
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-07-08 15:44:18
 */
import { ISize } from '@/types/main';
import { getClassName } from '@/utils/dom';
import { FooterDivider } from '@/views/MainView/toolFooter';
import { ZoomController } from '@/views/MainView/toolFooter/ZoomController';
import { DownSquareOutlined, UpSquareOutlined } from '@ant-design/icons';
import { cTool, PointCloud, MathUtils, PointCloudAnnotation } from '@labelbee/lb-annotation';
import { EPerspectiveView, IPointCloudBox } from '@labelbee/lb-utils';
import React, { useEffect, useRef, useState } from 'react';
import { PointCloudContext, useRotate, useSingleBox } from './PointCloudContext';
import { PointCloudContainer } from './PointCloudLayout';
import { BoxInfos, PointCloudValidity } from './PointCloudInfos';
import { Slider } from 'antd';
import { aMapStateToProps, IAnnotationStateProps } from '@/store/annotation/map';
import { connect } from 'react-redux';

const { EPolygonPattern } = cTool;

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
  pointCloudInstance.loadPCDFileByBox(url, boxParams);
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
  BackViewInstance?: PointCloudAnnotation,
) => {
  if (!BackViewInstance) {
    return;
  }

  const {
    pointCloud2dOperation: backPointCloudPolygonOperation,
    pointCloudInstance: backPointCloud,
  } = BackViewInstance;

  // Create PointCloud
  backPointCloud.loadPCDFileByBox('http://10.53.25.142:8001/10837/1/total.pcd', boxParams);
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

  // Control the 3Dview data to create box
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

const TopViewToolbar = ({ currentData }: IAnnotationStateProps) => {
  const { selectNextBox, selectPrevBox } = useSingleBox();
  const { updateRotate } = useRotate({ currentData });
  const ratio = 2;

  const clockwiseRotate = () => {
    updateRotate(-ratio);
  };
  const anticlockwiseRotate = () => {
    updateRotate(ratio);
  };

  const reverseRotate = () => {
    updateRotate(180);
  };

  return (
    <>
      <span
        onClick={anticlockwiseRotate}
        className={getClassName('point-cloud', 'rotate-reserve')}
      />
      <span onClick={clockwiseRotate} className={getClassName('point-cloud', 'rotate')} />
      <span onClick={reverseRotate} className={getClassName('point-cloud', 'rotate-180')} />
      <FooterDivider />
      <UpSquareOutlined
        onClick={() => {
          selectPrevBox();
        }}
        className={getClassName('point-cloud', 'prev')}
      />
      <DownSquareOutlined
        onClick={() => {
          selectNextBox();
        }}
        className={getClassName('point-cloud', 'next')}
      />
      <FooterDivider />
      <ZoomController />
    </>
  );
};

/**
 * Slider for filtering Z-axis points
 */
const ZAxisSlider = ({
  setZAxisLimit,
  zAxisLimit,
}: {
  setZAxisLimit: (value: number) => void;
  zAxisLimit: number;
}) => {
  return (
    <div style={{ position: 'absolute', top: 128, right: 8, height: '50%', zIndex: 20 }}>
      <Slider
        vertical
        step={0.5}
        max={10}
        min={0.5}
        defaultValue={zAxisLimit}
        onAfterChange={setZAxisLimit}
      />
    </div>
  );
};

const PointCloudTopView: React.FC<IAnnotationStateProps> = ({ currentData }) => {
  const ref = useRef<HTMLDivElement>(null);
  const ptCtx = React.useContext(PointCloudContext);
  const pointCloudRef = useRef<PointCloud | null>();
  const { updateSelectedBox } = useSingleBox();

  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [zAxisLimit, setZAxisLimit] = useState<number>(10);

  const mainViewGenBox = (boxParams: IPointCloudBox, polygonID: string) => {
    ptCtx.mainViewInstance?.generateBox(boxParams, polygonID);
    ptCtx.mainViewInstance?.controls.update();
    ptCtx.mainViewInstance?.render();
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
    ptCtx.setSelectedIDs([newParams.id]);

    mainViewGenBox(newParams, newPolygon.id);

    return {
      boxParams: newParams,
    };
  };

  useEffect(() => {
    if (ref.current && currentData?.url && currentData?.result) {
      const size = {
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
      };

      if (ptCtx.topViewInstance) {
        /**
         * Listen to flip
         * 1. Init
         * 2. Reload PointCloud
         * 3. Clear Polygon
         */
        ptCtx.topViewInstance.updateData(currentData.url, currentData.result);
        return;
      }

      const pointCloudAnnotation = new PointCloudAnnotation({
        container: ref.current,
        size,
        pcdPath: currentData.url,
      });
      pointCloudAnnotation.addPolygonListOnTopView(currentData.result);

      ptCtx.setTopViewInstance(pointCloudAnnotation);

      const pointCloud = pointCloudAnnotation.pointCloudInstance;
      const polygonOperation = pointCloudAnnotation.pointCloud2dOperation;

      pointCloudRef.current = pointCloud;

      /**
       * Synchronized 3d point cloud view displacement operations
       *
       * Change Orthographic Camera size
       */
      polygonOperation.singleOn('renderZoom', (zoom: number, currentPos: any) => {
        const { offsetX, offsetY } = TransferCanvas2WorldOffset(currentPos, size, zoom);
        pointCloud.camera.zoom = zoom;
        if (currentPos) {
          const { x, y, z } = pointCloud.initCameraPosition;
          pointCloud.camera.position.set(x + offsetY, y - offsetX, z);
        }

        pointCloud.camera.updateProjectionMatrix();
        pointCloud.render();
      });
      // Synchronized 3d point cloud view displacement operations
      polygonOperation.singleOn('dragMove', ({ currentPos, zoom }) => {
        const { offsetX, offsetY } = TransferCanvas2WorldOffset(currentPos, size, zoom);
        pointCloud.camera.zoom = zoom;
        const { x, y, z } = pointCloud.initCameraPosition;
        pointCloud.camera.position.set(x + offsetY, y - offsetX, z);
        pointCloud.render();
      });

      setSize(size);
    }
  }, [currentData]);

  useEffect(() => {
    if (!size || !ptCtx.topViewInstance || !ptCtx.sideViewInstance) {
      return;
    }

    const { pointCloud2dOperation: TopView2dOperation, pointCloudInstance: TopViewPointCloud } =
      ptCtx.topViewInstance;

    TopView2dOperation.singleOn('polygonCreated', (polygon: any) => {
      if (TopView2dOperation.pattern === EPolygonPattern.Normal || !currentData?.url) {
        return;
      }

      const { boxParams } = afterPolygonCreated(polygon, TopViewPointCloud, size);
      ptCtx.mainViewInstance?.hightLightOriginPointCloud(boxParams);
      synchronizeSideView(boxParams, polygon, ptCtx.sideViewInstance, currentData.url);
      synchronizeBackView(boxParams, polygon, ptCtx.backViewInstance);
      // }
    });

    TopView2dOperation.singleOn('deleteSelectedIDs', () => {
      ptCtx.setSelectedIDs([]);
    });

    TopView2dOperation.singleOn('addSelectedIDs', (selectedID: string) => {
      ptCtx.addSelectedID(selectedID);
    });

    TopView2dOperation.singleOn('setSelectedIDs', (selectedIDs: string[]) => {
      ptCtx.setSelectedIDs(selectedIDs);
    });

    TopView2dOperation.singleOn('updatePolygonByDrag', ({ newPolygon }: any) => {
      if (!ptCtx.selectedPointCloudBox || !currentData.url) {
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

      synchronizeSideView(newBoxParams, newPolygon, ptCtx.sideViewInstance, currentData.url);
      synchronizeBackView(newBoxParams, newPolygon, ptCtx.backViewInstance);
      ptCtx.mainViewInstance?.hightLightOriginPointCloud(newBoxParams);
      updateSelectedBox(newBoxParams);
    });
  }, [ptCtx, size, currentData]);

  useEffect(() => {
    if (pointCloudRef.current) {
      pointCloudRef.current.applyZAxisPoints(zAxisLimit);
    }
  }, [zAxisLimit]);

  useEffect(() => {
    if (!size || !ptCtx.topViewInstance || !ptCtx.sideViewInstance) {
      return;
    }

    const { pointCloud2dOperation: TopView2dOperation } = ptCtx.topViewInstance;

    const polygonOperation = TopView2dOperation;
    if (!polygonOperation) {
      return;
    }

    polygonOperation.setSelectedIDs(ptCtx.selectedIDs);

    const boxParams = ptCtx.pointCloudBoxList.find((v) => v.id === ptCtx.selectedID);
    const polygon = polygonOperation.selectedPolygon;
    if (!boxParams || !polygon || !currentData.url) {
      return;
    }

    ptCtx.mainViewInstance?.hightLightOriginPointCloud(boxParams);
    synchronizeSideView(boxParams, polygon, ptCtx.sideViewInstance, currentData.url);
    synchronizeBackView(boxParams, polygon, ptCtx.backViewInstance);
  }, [ptCtx.selectedIDs]);

  return (
    <PointCloudContainer
      className={getClassName('point-cloud-container', 'top-view')}
      title='俯视图'
      toolbar={<TopViewToolbar currentData={currentData} />}
    >
      <div style={{ position: 'relative', flex: 1 }}>
        <div style={{ width: '100%', height: '100%' }} ref={ref} />
        <BoxInfos />
        <ZAxisSlider zAxisLimit={zAxisLimit} setZAxisLimit={setZAxisLimit} />
        <PointCloudValidity />
      </div>
    </PointCloudContainer>
  );
};

export default connect(aMapStateToProps)(PointCloudTopView);
