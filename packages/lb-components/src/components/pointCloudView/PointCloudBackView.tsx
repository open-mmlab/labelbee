/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-22 11:08:31
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-07-08 11:08:02
 */
import { PointCloud, PointCloudAnnotation, THybridToolName } from '@labelbee/lb-annotation';
import { getClassName } from '@/utils/dom';
import { PointCloudContainer } from './PointCloudLayout';
import React, { useEffect, useRef } from 'react';
import { PointCloudContext } from './PointCloudContext';
import { EPerspectiveView, IPointUnit, UpdatePolygonByDragList } from '@labelbee/lb-utils';
import { useSingleBox } from './hooks/useSingleBox';
import { useSphere } from './hooks/useSphere';
import { useZoom } from './hooks/useZoom';
import { SizeInfoForView } from './PointCloudInfos';
import { connect } from 'react-redux';
import { a2MapStateToProps, IA2MapStateProps } from '@/store/annotation/map';
import { usePointCloudViews } from './hooks/usePointCloudViews';
import useSize from '@/hooks/useSize';
import EmptyPage from './components/EmptyPage';
import { useTranslation } from 'react-i18next';
import { LabelBeeContext } from '@/store/ctx';
import ToolUtils from '@/utils/ToolUtils';
import TitleButton from './components/TitleButton';

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
  rotation: number,
  backPointCloud: PointCloud,
) => {
  const { offsetX, offsetY } = TransferCanvas2WorldOffset(currentPos, size, zoom);
  backPointCloud.camera.zoom = zoom;
  if (currentPos) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const offsetXX = offsetX * cos;
    const offsetXY = offsetX * sin;
    const { x, y, z } = backPointCloud.initCameraPosition;
    backPointCloud.camera.position.set(x + offsetXY, y - offsetXX, z + offsetY);
  }
  backPointCloud.camera.updateProjectionMatrix();
  backPointCloud.render();
};

interface IProps {
  checkMode?: boolean;
}

const PointCloudBackView = ({ currentData, config, checkMode }: IA2MapStateProps & IProps) => {
  const ptCtx = React.useContext(PointCloudContext);
  const ref = useRef<HTMLDivElement>(null);
  const size = useSize(ref);
  const { selectedBox } = useSingleBox();
  const { selectedSphere } = useSphere();
  const { syncBackviewToolZoom } = useZoom();

  const { t } = useTranslation();
  const { backViewUpdateBox, backViewUpdatePoint } = usePointCloudViews();

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
      ptCtx.setBackViewInstance(pointCloudAnnotation);
    }
  }, []);

  useEffect(() => {
    // By the way as an initialization judgment
    if (!size || !ptCtx.backViewInstance) {
      return;
    }

    const { toolInstance: backPointCloudPolygonOperation, pointCloudInstance: backPointCloud } =
      ptCtx.backViewInstance;

    /**
     * Synchronized 3d point cloud view displacement operations
     *
     * Change Orthographic Camera size
     */
    backPointCloudPolygonOperation.singleOn('renderZoom', (zoom: number, currentPos: any) => {
      if (ptCtx.selectedPointCloudBox) {
        updateBackViewByCanvas2D(
          currentPos,
          zoom,
          size,
          ptCtx.selectedPointCloudBox.rotation,
          backPointCloud,
        );
        syncBackviewToolZoom(currentPos, zoom, size);
        return;
      }
      if (selectedSphere) {
        updateBackViewByCanvas2D(currentPos, zoom, size, 0, backPointCloud);
        syncBackviewToolZoom(currentPos, zoom, size);
        return;
      }
    });

    // Synchronized 3d point cloud view displacement operations
    backPointCloudPolygonOperation.singleOn('dragMove', ({ currentPos, zoom }: any) => {
      if (!ptCtx.selectedPointCloudBox && !selectedSphere) {
        return;
      }
      updateBackViewByCanvas2D(
        currentPos,
        zoom,
        size,
        ptCtx.selectedPointCloudBox ? ptCtx.selectedPointCloudBox.rotation : 0,
        backPointCloud,
      );
    });

    backPointCloudPolygonOperation.singleOn(
      'updatePointByDrag',
      (updatePoint: IPointUnit, oldPointList: IPointUnit[]) => {
        if (selectedSphere) {
          backViewUpdatePoint?.(updatePoint, oldPointList[0]);
        }
      },
    );
    backPointCloudPolygonOperation.singleOn(
      'updatePolygonByDrag',
      (updateList: UpdatePolygonByDragList) => {
        if (ptCtx.selectedIDs.length === 1 && updateList.length === 1) {
          const { newPolygon, originPolygon } = updateList[0];

          if (newPolygon && originPolygon) {
            backViewUpdateBox(newPolygon, originPolygon);
          }
        }
      },
    );
  }, [ptCtx, size]);

  useEffect(() => {
    // Update Size
    ptCtx?.backViewInstance?.initSize(size);
  }, [size]);

  return (
    <PointCloudContainer
      className={getClassName('point-cloud-container', 'back-view')}
      title={<TitleButton title={t('BackView')} />}
      titleOnSurface={true}
    >
      <div className={getClassName('point-cloud-container', 'bottom-view-content')}>
        <div className={getClassName('point-cloud-container', 'core-instance')} ref={ref} />
        {!selectedBox && !selectedSphere && <EmptyPage />}
        <SizeInfoForView perspectiveView={EPerspectiveView.Back} />
      </div>
    </PointCloudContainer>
  );
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloudBackView,
);
