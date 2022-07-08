/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-22 11:08:31
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-07-08 11:08:02
 */
import {
  PolygonOperation,
  cTool,
  CanvasSchduler,
  PointCloud,
  MathUtils,
} from '@labelbee/lb-annotation';
import { getClassName } from '@/utils/dom';
import { PointCloudContainer } from './PointCloudLayout';
import React, { useEffect, useRef, useState } from 'react';
import { synchronizeSideView, synchronizeTopView } from './PointCloudTopView';
import { PointCloudContext } from './PointCloudContext';
import { IPointCloudBox } from '@labelbee/lb-utils';

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

let BackPointCloud: any;
let BackPointCloudPolygonOperation: any;

const updateBackViewByCanvas2D = (
  currentPos: { x: number; y: number },
  zoom: number,
  size: { width: number; height: number },
  selectedPointCloudBox: IPointCloudBox,
) => {
  const { offsetX, offsetY } = TransferCanvas2WorldOffset(currentPos, size, zoom);
  BackPointCloud.camera.zoom = zoom;
  if (currentPos) {
    const cos = Math.cos(selectedPointCloudBox.rotation);
    const sin = Math.sin(selectedPointCloudBox.rotation);
    const offsetXX = offsetX * cos;
    const offsetXY = offsetX * sin;
    const { x, y, z } = BackPointCloud.initCameraPosition;
    BackPointCloud.camera.position.set(x - offsetXY, y - offsetXX, z + offsetY);
  }
  BackPointCloud.camera.updateProjectionMatrix();
  BackPointCloud.render();
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
        BackPointCloud = pointCloud;
        canvasSchuler.createCanvas(pointCloud.renderer.domElement);

        const polygonOperation = new PolygonOperation({
          container: ref.current as HTMLDivElement,
          size,
          config: '{ "textConfigurable": false, "poinCloudPattern": true }',
          imgNode: image,
          isAppend: false,
        });
        polygonOperation.eventBinding();
        polygonOperation.setPattern(EPolygonPattern.Rect);
        BackPointCloudPolygonOperation = polygonOperation;

        canvasSchuler.createCanvas(polygonOperation.canvas, { size });
        setSize(size);
      };
    }
  }, []);

  useEffect(() => {
    if (!size) {
      return;
    }

    /**
     * Synchronized 3d point cloud view displacement operations
     *
     * Change Orthographic Camera size
     */
    BackPointCloudPolygonOperation.singleOn('renderZoom', (zoom: number, currentPos: any) => {
      if (!ptCtx.selectedPointCloudBox) {
        return;
      }
      updateBackViewByCanvas2D(currentPos, zoom, size, ptCtx.selectedPointCloudBox);
    });

    // Synchronized 3d point cloud view displacement operations
    BackPointCloudPolygonOperation.singleOn('dragMove', ({ currentPos, zoom }: any) => {
      if (!ptCtx.selectedPointCloudBox) {
        return;
      }
      updateBackViewByCanvas2D(currentPos, zoom, size, ptCtx.selectedPointCloudBox);
    });

    BackPointCloudPolygonOperation.singleOn(
      'updatePolygonByDrag',
      ({ newPolygon, originPolygon }: any) => {
        if (!ptCtx.selectedPointCloudBox) {
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

        const { newBoxParams } = BackPointCloud.getNewBoxByBackUpdate(
          offsetCenterPoint,
          offsetWidth,
          offsetHeight,
          ptCtx.selectedPointCloudBox,
        );

        synchronizeTopView(newBoxParams, newPolygon);
        synchronizeSideView(newBoxParams, newPolygon);
        ptCtx.updateSelectedPointCloud(newPolygon.id, newBoxParams);
      },
    );
  }, [ptCtx, size]);

  return (
    <PointCloudContainer
      className={getClassName('point-cloud-container', 'back-view')}
      title='背视图'
    >
      <div style={{ width: '100%', height: 300 }} ref={ref} />
    </PointCloudContainer>
  );
};

export default PointCloudSideView;

export { BackPointCloud, BackPointCloudPolygonOperation };
