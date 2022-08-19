/**
 * @file PointCloud sideView - React Component
 * @createdate 2022-07-11
 * @author Ron <ron.f.luo@gmail.com>
 */
import { PointCloud, PointCloudAnnotation } from '@labelbee/lb-annotation';
import { getClassName } from '@/utils/dom';
import { PointCloudContainer } from './PointCloudLayout';
import React, { useEffect, useRef, useState } from 'react';
import { EPerspectiveView, IPointCloudBox } from '@labelbee/lb-utils';
import { PointCloudContext } from './PointCloudContext';
import { SizeInfoForView } from './PointCloudInfos';
import { connect } from 'react-redux';
import { aMapStateToProps, IAnnotationStateProps } from '@/store/annotation/map';
import { usePointCloudViews } from './hooks/usePointCloudViews';

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

const PointCloudSideView: React.FC<IAnnotationStateProps> = ({ currentData }) => {
  const ptCtx = React.useContext(PointCloudContext);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const { sideViewUpdateBox } = usePointCloudViews();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const size = {
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
      };

      const pointCloudAnnotation = new PointCloudAnnotation({ container: ref.current, size });
      ptCtx.setSideViewInstance(pointCloudAnnotation);
      setSize(size);
      // };
    }
  }, []);

  useEffect(() => {
    // By the way as an initialization judgment
    if (!size || !ptCtx.sideViewInstance) {
      return;
    }

    const { pointCloud2dOperation, pointCloudInstance } = ptCtx.sideViewInstance;
    /**
     * Synchronized 3d point cloud view displacement operations
     *
     * Change Orthographic Camera size
     */
    pointCloud2dOperation.singleOn('renderZoom', (zoom: number, currentPos: any) => {
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
    pointCloud2dOperation.singleOn('dragMove', ({ currentPos, zoom }: any) => {
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

    pointCloud2dOperation.singleOn('updatePolygonByDrag', ({ newPolygon, originPolygon }: any) => {
      sideViewUpdateBox(newPolygon, originPolygon);
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

export default connect(aMapStateToProps)(PointCloudSideView);
