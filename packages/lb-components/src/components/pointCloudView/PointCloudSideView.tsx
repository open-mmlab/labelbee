/**
 * @file PointCloud sideView - React Component
 * @createdate 2022-07-11
 * @author Ron <ron.f.luo@gmail.com>
 */
import { PointCloud, PointCloudAnnotation } from '@labelbee/lb-annotation';
import { getClassName } from '@/utils/dom';
import { PointCloudContainer } from './PointCloudLayout';
import React, { useEffect, useRef } from 'react';
import { EPerspectiveView, IPointCloudBox } from '@labelbee/lb-utils';
import { PointCloudContext } from './PointCloudContext';
import { SizeInfoForView } from './PointCloudInfos';
import { connect } from 'react-redux';
import { a2MapStateToProps, IA2MapStateProps } from '@/store/annotation/map';
import { usePointCloudViews } from './hooks/usePointCloudViews';
import { useSingleBox } from './hooks/useSingleBox';
import EmptyPage from './components/EmptyPage';
import useSize from '@/hooks/useSize';
import { useTranslation } from 'react-i18next';
import { LabelBeeContext } from '@/store/ctx';
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

interface IProps {
  checkMode?: boolean
}

const PointCloudSideView: React.FC<IA2MapStateProps & IProps> = ({ config, checkMode }) => {
  const ptCtx = React.useContext(PointCloudContext);
  const { sideViewUpdateBox } = usePointCloudViews();
  const { selectedBox } = useSingleBox();
  const ref = useRef<HTMLDivElement>(null);
  const size = useSize(ref);
  const { t } = useTranslation();

  useEffect(() => {
    if (ref.current) {
      const size = {
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
      };

      const pointCloudAnnotation = new PointCloudAnnotation({
        container: ref.current,
        size,
        polygonOperationProps: { showDirectionLine: false, forbidAddNew: true },
        config,
        checkMode
      });
      ptCtx.setSideViewInstance(pointCloudAnnotation);
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

  useEffect(() => {
    // Update Size
    ptCtx?.sideViewInstance?.initSize(size);
  }, [size]);

  return (
    <PointCloudContainer
      className={getClassName('point-cloud-container', 'side-view')}
      title={t('SideView')}
      toolbar={<SizeInfoForView perspectiveView={EPerspectiveView.Left} />}
    >
      <div className={getClassName('point-cloud-container', 'bottom-view-content')}>
        <div className={getClassName('point-cloud-container', 'core-instance')} ref={ref} />
        {!selectedBox && <EmptyPage />}
      </div>
    </PointCloudContainer>
  );
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloudSideView,
);
