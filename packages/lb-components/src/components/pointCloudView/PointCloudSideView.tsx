/**
 * @file PointCloud sideView - React Component
 * @createdate 2022-07-11
 * @author Ron <ron.f.luo@gmail.com>
 */
import { PointCloud, MathUtils, PointCloudAnnotation } from '@labelbee/lb-annotation';
import { getClassName } from '@/utils/dom';
import { PointCloudContainer } from './PointCloudLayout';
import React, { useEffect, useRef, useState } from 'react';
import { synchronizeBackView, synchronizeTopView } from './PointCloudTopView';
import { EPerspectiveView, IPointCloudBox } from '@labelbee/lb-utils';
import { PointCloudContext } from './PointCloudContext';
import { SizeInfoForView } from './PointCloudInfos';

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
    x: currentPos.x + (w * zoom) / 2, // 放大倍数之后的中心点的偏移量
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

const updateSideViewByCanvas2D = (
  currentPos: { x: number; y: number },
  zoom: number,
  size: { width: number; height: number },
  selectedPointCloudBox: IPointCloudBox,
  SidePointCloud: PointCloud,
) => {
  const { offsetX, offsetY } = TransferCanvas2WorldOffset(currentPos, size, zoom);
  SidePointCloud.camera.zoom = zoom;
  if (currentPos) {
    const cos = Math.cos(selectedPointCloudBox.rotation);
    const sin = Math.sin(selectedPointCloudBox.rotation);
    const offsetXX = offsetX * cos;
    const offsetXY = offsetX * sin;
    const { x, y, z } = SidePointCloud.initCameraPosition;
    SidePointCloud.camera.position.set(x - offsetXX, y - offsetXY, z + offsetY);
  }
  SidePointCloud.camera.updateProjectionMatrix();
  SidePointCloud.render();
};

const PointCloudSideView = () => {
  const ptCtx = React.useContext(PointCloudContext);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const size = {
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
      };

      const pointCloudAnnotaiton = new PointCloudAnnotation({ container: ref.current, size });
      ptCtx.setSideViewInstance(pointCloudAnnotaiton);
      setSize(size);
      // };
    }
  }, []);

  useEffect(() => {
    // By the way as an initialization judgment
    if (!size || !ptCtx.sideViewInstance) {
      return;
    }

    const { pointCloud2dOpeartion, pointCloudInstance } = ptCtx.sideViewInstance;
    /**
     * Synchronized 3d point cloud view displacement operations
     *
     * Change Orthographic Camera size
     */
    pointCloud2dOpeartion.singleOn('renderZoom', (zoom: number, currentPos: any) => {
      if (!ptCtx.selectedPointCloudBox) {
        return;
      }
      updateSideViewByCanvas2D(
        currentPos,
        zoom,
        size,
        ptCtx.selectedPointCloudBox,
        pointCloudInstance,
      );
    });

    // Synchronized 3d point cloud view displacement operations
    pointCloud2dOpeartion.singleOn('dragMove', ({ currentPos, zoom }: any) => {
      if (!ptCtx.selectedPointCloudBox) {
        return;
      }
      updateSideViewByCanvas2D(
        currentPos,
        zoom,
        size,
        ptCtx.selectedPointCloudBox,
        pointCloudInstance,
      );
    });

    pointCloud2dOpeartion.singleOn('updatePolygonByDrag', ({ newPolygon, originPolygon }: any) => {
      if (!ptCtx.selectedPointCloudBox || !ptCtx.mainViewInstance) {
        return;
      }

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

      const cos = Math.cos(ptCtx.selectedPointCloudBox.rotation);
      const sin = Math.sin(ptCtx.selectedPointCloudBox.rotation);

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
        ptCtx.selectedPointCloudBox,
      );

      // TODO. It is another way to updateData
      // const { newBoxParams } = SidePointCloud.getNewBoxBySideUpdateByPoints(
      //   newPolygon.pointList,
      //   offsetHeight,
      //   offsetCenterPoint.y,
      // );

      synchronizeTopView(newBoxParams, newPolygon, ptCtx.topViewInstance, ptCtx.mainViewInstance);
      synchronizeBackView(newBoxParams, newPolygon, ptCtx.backViewInstance);
      ptCtx.mainViewInstance.hightLightOriginPointCloud(newBoxParams);
      ptCtx.updateSelectedPointCloud(newPolygon.id, newBoxParams);
    });
  }, [ptCtx, size]);

  return (
    <PointCloudContainer
      className={getClassName('point-cloud-container', 'side-view')}
      title='侧视图'
      toolbar={<SizeInfoForView perspectiveView={EPerspectiveView.Left} />}
    >
      <div style={{ width: '100%', height: 300 }} ref={ref} />
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: 200,
          color: 'white',
        }}
      />
    </PointCloudContainer>
  );
};

export default PointCloudSideView;
