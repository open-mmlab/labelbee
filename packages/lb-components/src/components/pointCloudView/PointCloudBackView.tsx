/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-22 11:08:31
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-07-08 11:08:02
 */
import {
  PointCloud,
  MathUtils,
  PointCloudAnnotation,
  getCuboidFromPointCloudBox,
} from '@labelbee/lb-annotation';
import { getClassName } from '@/utils/dom';
import { PointCloudContainer } from './PointCloudLayout';
import React, { useEffect, useRef } from 'react';
import { PointCloudContext } from './PointCloudContext';
import { usePointCloudBoxes } from './hooks/usePointCloudBoxes';
import {
  EPerspectiveView,
  IPointCloudBox,
  IPolygonData,
  IPolygonPoint,
  UpdatePolygonByDragList,
} from '@labelbee/lb-utils';
import { SizeInfoForView } from './PointCloudInfos';
import { connect } from 'react-redux';
import { a2MapStateToProps, IA2MapStateProps } from '@/store/annotation/map';
import { synchronizeSideView, synchronizeTopView } from './hooks/usePointCloudViews';
import useSize from '@/hooks/useSize';
import EmptyPage from './components/EmptyPage';
import { useTranslation } from 'react-i18next';
import { LabelBeeContext } from '@/store/ctx';

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

const PointCloudSideView = ({ currentData, config }: IA2MapStateProps) => {
  const ptCtx = React.useContext(PointCloudContext);
  const ref = useRef<HTMLDivElement>(null);
  const size = useSize(ref);
  const { updateSelectedBox, selectedBox } = usePointCloudBoxes();
  const { t } = useTranslation();

  const transferPolygonDataToBoxParams = (
    newPolygon: IPolygonData,
    originPolygon: IPolygonData,
  ) => {
    debugger
    if (
      !ptCtx.selectedPointCloudBox ||
      !ptCtx.mainViewInstance ||
      !currentData.url ||
      !ptCtx.backViewInstance
    ) {
      return;
    }

    const { pointCloudInstance: backPointCloud } = ptCtx.backViewInstance;

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

    let { newBoxParams } = backPointCloud.getNewBoxByBackUpdate(
      offsetCenterPoint,
      offsetWidth,
      offsetHeight,
      ptCtx.selectedPointCloudBox,
    );

    // Update count
    if (ptCtx.mainViewInstance) {
      const { count } = ptCtx.mainViewInstance.getSensesPointZAxisInPolygon(
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

    synchronizeTopView(newBoxParams, newPolygon, ptCtx.topViewInstance, ptCtx.mainViewInstance);
    synchronizeSideView(newBoxParams, newPolygon, ptCtx.sideViewInstance, currentData.url);
    ptCtx.mainViewInstance.highlightOriginPointCloud(newBoxParams);

    updateSelectedBox(newBoxParams);
  };

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
      });
      ptCtx.setBackViewInstance(pointCloudAnnotation);
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
      (updateList: UpdatePolygonByDragList) => {
        if (ptCtx.selectedIDs.length === 1 && updateList.length === 1) {
          transferPolygonDataToBoxParams(updateList[0].newPolygon, updateList[0].originPolygon);
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
      title={t('BackView')}
      toolbar={<SizeInfoForView perspectiveView={EPerspectiveView.Back} />}
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
