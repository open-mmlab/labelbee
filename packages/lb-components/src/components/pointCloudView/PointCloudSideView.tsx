/**
 * @file PointCloud sideView - React Component
 * @createdate 2022-07-11
 * @author Ron <ron.f.luo@gmail.com>
 */
import { PointCloud, PointCloudAnnotation, THybridToolName } from '@labelbee/lb-annotation';
import { getClassName } from '@/utils/dom';
import { PointCloudContainer } from './PointCloudLayout';
import React, { useEffect, useRef } from 'react';
import { EPerspectiveView, IPointUnit, UpdatePolygonByDragList } from '@labelbee/lb-utils';
import { PointCloudContext } from './PointCloudContext';
import { SizeInfoForView } from './PointCloudInfos';
import { connect } from 'react-redux';
import { a2MapStateToProps, IA2MapStateProps } from '@/store/annotation/map';
import { usePointCloudViews } from './hooks/usePointCloudViews';
import { useSingleBox } from './hooks/useSingleBox';
import { useSphere } from './hooks/useSphere';
import EmptyPage from './components/EmptyPage';
import useSize from '@/hooks/useSize';
import { useTranslation } from 'react-i18next';
import { LabelBeeContext } from '@/store/ctx';
import ToolUtils from '@/utils/ToolUtils';
import { useZoom } from '@/components/pointCloudView/hooks/useZoom';

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
  rotation: number,
  SidePointCloud: PointCloud,
) => {
  const { offsetX, offsetY } = TransferCanvas2WorldOffset(currentPos, size, zoom);
  SidePointCloud.camera.zoom = zoom;
  if (currentPos) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const offsetXX = offsetX * cos;
    const offsetXY = offsetX * sin;
    const { x, y, z } = SidePointCloud.initCameraPosition;
    SidePointCloud.camera.position.set(x - offsetXX, y - offsetXY, z + offsetY);
  }
  SidePointCloud.camera.updateProjectionMatrix();
  SidePointCloud.render();
};

interface IProps {
  checkMode?: boolean;
}

const PointCloudSideView: React.FC<IA2MapStateProps & IProps> = ({ config, checkMode }) => {
  const ptCtx = React.useContext(PointCloudContext);
  const { sideViewUpdateBox, sideViewUpdatePoint } = usePointCloudViews();
  const { selectedBox } = useSingleBox();
  const { selectedSphere } = useSphere();
  const ref = useRef<HTMLDivElement>(null);
  const size = useSize(ref);
  const { t } = useTranslation();
  const { syncSideviewToolZoom } = useZoom();

  useEffect(() => {
    if (ref.current) {
      const size = {
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
      };

      const pointCloudAnnotation = new PointCloudAnnotation({
        container: ref.current,
        size,
        extraProps: { showDirectionLine: false, forbidAddNew: true, forbidDelete: true },
        config,
        checkMode,
        toolName: ToolUtils.getPointCloudToolList() as THybridToolName,
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

    const { toolInstance, pointCloudInstance } = ptCtx.sideViewInstance;

    /**
     * Synchronized 3d point cloud view displacement operations
     *
     * Change Orthographic Camera size
     */
    toolInstance.singleOn('renderZoom', (zoom: number, currentPos: any) => {
      if (ptCtx.selectedPointCloudBox) {
        updateSideViewByCanvas2D(
          currentPos,
          zoom,
          size,
          ptCtx.selectedPointCloudBox.rotation,
          pointCloudInstance,
        );
        syncSideviewToolZoom(currentPos, zoom, size);
        return;
      }
      if (selectedSphere) {
        updateSideViewByCanvas2D(currentPos, zoom, size, 0, pointCloudInstance);
        syncSideviewToolZoom(currentPos, zoom, size);
      }
    });

    // Synchronized 3d point cloud view displacement operations
    toolInstance.singleOn('dragMove', ({ currentPos, zoom }: any) => {
      if (!ptCtx.selectedPointCloudBox && !selectedSphere) {
        return;
      }
      updateSideViewByCanvas2D(
        currentPos,
        zoom,
        size,
        ptCtx.selectedPointCloudBox ? ptCtx.selectedPointCloudBox.rotation : 0,
        pointCloudInstance,
      );
    });

    toolInstance.singleOn(
      'updatePointByDrag',
      (updatePoint: IPointUnit, oldPointList: IPointUnit[]) => {
        if (selectedSphere) {
          sideViewUpdatePoint?.(updatePoint, oldPointList[0]);
        }
      },
    );

    toolInstance.singleOn('updatePolygonByDrag', (updateList: UpdatePolygonByDragList) => {
      if (ptCtx.selectedIDs.length === 1 && updateList.length === 1) {
        const { newPolygon, originPolygon } = updateList[0];
        sideViewUpdateBox(newPolygon, originPolygon);
      }
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
    >
      <div className={getClassName('point-cloud-container', 'bottom-view-content')}>
        <div className={getClassName('point-cloud-container', 'core-instance')} ref={ref} />
        {!selectedBox && !selectedSphere && <EmptyPage />}
        <SizeInfoForView perspectiveView={EPerspectiveView.Left} />
      </div>
    </PointCloudContainer>
  );
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloudSideView,
);
