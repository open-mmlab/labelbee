/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-22 11:08:31
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-07-08 11:08:02
 */
import { PointCloud, MathUtils, PointCloudAnnotation } from '@labelbee/lb-annotation';
import { getClassName } from '@/utils/dom';
import { PointCloudContainer } from './PointCloudLayout';
import React, { useEffect, useRef, useState } from 'react';
import { synchronizeSideView, synchronizeTopView } from './PointCloudTopView';
import { PointCloudContext } from './PointCloudContext';
import { EPerspectiveView, IPointCloudBox } from '@labelbee/lb-utils';
import { SizeInfoForView } from './PointCloudInfos';
import { connect } from 'react-redux';
import { aMapStateToProps, IAnnotationStateProps } from '@/store/annotation/map';

/**
 * 统一一下，将其拓展为 二维转换为 三维坐标的转换
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
const updateBackViewByCanvas2D = (
  currentPos: { x: number; y: number },
  zoom: number,
  size: { width: number; height: number },
  selectedPointCloudBox: IPointCloudBox,
  backPointCloud: PointCloud,
) => {
  const { offsetX, offsetY } = TransferCanvas2WorldOffset(currentPos, size, zoom);
  backPointCloud.camera.zoom = zoom;
  if (currentPos) {
    const cos = Math.cos(selectedPointCloudBox.rotation);
    const sin = Math.sin(selectedPointCloudBox.rotation);
    const offsetXX = offsetX * cos;
    const offsetXY = offsetX * sin;
    const { x, y, z } = backPointCloud.initCameraPosition;
    backPointCloud.camera.position.set(x + offsetXY, y - offsetXX, z + offsetY);
  }
  backPointCloud.camera.updateProjectionMatrix();
  backPointCloud.render();
};

const PointCloudSideView = ({ currentData }: IAnnotationStateProps) => {
  const ptCtx = React.useContext(PointCloudContext);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const size = {
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
      };

      const pointCloudAnnotation = new PointCloudAnnotation({
        container: ref.current,
        size,
      });
      ptCtx.setBackViewInstance(pointCloudAnnotation);
      setSize(size);
    }
  }, []);

  useEffect(() => {
    // By the way as an initialization judgment
    if (!size || !ptCtx.backViewInstance) {
      return;
    }

    const {
      pointCloud2dOperation: backPointCloudPolygonOperation,
      pointCloudInstance: backPointCloud,
    } = ptCtx.backViewInstance;

    /**
     * Synchronized 3d point cloud view displacement operations
     *
     * Change Orthographic Camera size
     */
    backPointCloudPolygonOperation.singleOn('renderZoom', (zoom: number, currentPos: any) => {
      if (!ptCtx.selectedPointCloudBox) {
        return;
      }
      updateBackViewByCanvas2D(currentPos, zoom, size, ptCtx.selectedPointCloudBox, backPointCloud);
    });

    // Synchronized 3d point cloud view displacement operations
    backPointCloudPolygonOperation.singleOn('dragMove', ({ currentPos, zoom }: any) => {
      if (!ptCtx.selectedPointCloudBox) {
        return;
      }
      updateBackViewByCanvas2D(currentPos, zoom, size, ptCtx.selectedPointCloudBox, backPointCloud);
    });

    backPointCloudPolygonOperation.singleOn(
      'updatePolygonByDrag',
      ({ newPolygon, originPolygon }: any) => {
        if (!ptCtx.selectedPointCloudBox || !ptCtx.mainViewInstance || !currentData.url) {
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
          // x: vector.x * cos - vector.y * sin,
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

        const { newBoxParams } = backPointCloud.getNewBoxByBackUpdate(
          offsetCenterPoint,
          offsetWidth,
          offsetHeight,
          ptCtx.selectedPointCloudBox,
        );

        synchronizeTopView(newBoxParams, newPolygon, ptCtx.topViewInstance, ptCtx.mainViewInstance);
        synchronizeSideView(newBoxParams, newPolygon, ptCtx.sideViewInstance, currentData.url);
        ptCtx.mainViewInstance.hightLightOriginPointCloud(newBoxParams);
        ptCtx.updateSelectedPointCloud(newPolygon.id, newBoxParams);
      },
    );
  }, [ptCtx, size]);

  return (
    <PointCloudContainer
      className={getClassName('point-cloud-container', 'back-view')}
      title='背视图'
      toolbar={<SizeInfoForView perspectiveView={EPerspectiveView.Back} />}
    >
      <div style={{ width: '100%', height: 300 }} ref={ref} />
    </PointCloudContainer>
  );
};

export default connect(aMapStateToProps)(PointCloudSideView);
