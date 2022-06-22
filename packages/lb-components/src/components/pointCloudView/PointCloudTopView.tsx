/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-22 11:08:31
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-27 19:45:27
 */
import { getClassName } from '@/utils/dom';
import {
  PolygonOperation,
  cTool,
  CanvasSchduler,
  PointCloud,
  MathUtils,
} from '@labelbee/lb-annotation';
import { EPerspectiveView } from '@labelbee/lb-utils';
import React, { useEffect, useRef } from 'react';
import { pointCloudMain } from './PointCloud3DView';
import { PointCloudContainer } from './PointCloudLayout';

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

const PointCloudTopView = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const mockImgInfo = {
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
      };

      const defaultOrthographic = {
        left: -mockImgInfo.width / 2,
        right: mockImgInfo.width / 2,
        top: mockImgInfo.height / 2,
        bottom: -mockImgInfo.height / 2,
        near: 100,
        far: -100,
      };

      const container = ref.current;
      const imgSrc = CreateEmptyImage(mockImgInfo);

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
        pointCloud.loadPCDFile('http://10.53.25.142:8001/1/000001.pcd');
        canvasSchuler.createCanvas(pointCloud.renderer.domElement);

        const polygonOperation = new PolygonOperation({
          container: ref.current as HTMLDivElement,
          size: mockImgInfo,
          config: '{ textConfigurable: false }',
          imgNode: image,
          isAppend: false,
        });
        polygonOperation.eventBinding();
        polygonOperation.setPattern(EPolygonPattern.Rect);
        polygonOperation.on('polygonCreated', (newPolygon: any) => {
          const [point1, point2, point3] = newPolygon.pointList.map((v: any) =>
            TransferCanvas2World(v, mockImgInfo),
          );

          const centerPoint = MathUtils.getLineCenterPoint([point1, point3]);
          const height = MathUtils.getLineLength(point1, point2);
          const width = MathUtils.getLineLength(point2, point3);

          const rotation = MathUtils.getRadiusFromQuadrangle(newPolygon.pointList);
          const newParams = {
            center: {
              x: centerPoint.x,
              y: centerPoint.y,
              z: 1,
            },
            volume: {
              width,
              height,
              depth: 10,
            },
            rotation,
          };

          // Control the 3Dview data to create box
          pointCloudMain.generateBox(newParams);
          pointCloudMain.updateCamera(newParams, EPerspectiveView.Front);
          pointCloudMain.controls.update();
          pointCloudMain.render();
        });

        // Synchronized 3d point cloud view displacement operations
        polygonOperation.on('renderZoom', (zoom: number, currentPos: any) => {
          const { offsetX, offsetY } = TransferCanvas2WorldOffset(currentPos, mockImgInfo, zoom);
          pointCloud.camera.zoom = zoom;
          if (currentPos) {
            // @ts-ignore TODO
            pointCloud.camera.left = defaultOrthographic.left + offsetX;
            // @ts-ignore TODO
            pointCloud.camera.right = defaultOrthographic.right + offsetX;
            // @ts-ignore TODO
            pointCloud.camera.top = defaultOrthographic.top + offsetY;
            // @ts-ignore TODO
            pointCloud.camera.bottom = defaultOrthographic.bottom + offsetY;
          }
          pointCloud.camera.updateProjectionMatrix();
          pointCloud.render();
        });

        // Synchronized 3d point cloud view displacement operations
        polygonOperation.on('dragMove', ({ currentPos, zoom }) => {
          const { offsetX, offsetY } = TransferCanvas2WorldOffset(currentPos, mockImgInfo, zoom);
          pointCloud.camera.zoom = zoom;
          // @ts-ignore TODO
          pointCloud.camera.left = defaultOrthographic.left + offsetX;
          // @ts-ignore TODO
          pointCloud.camera.right = defaultOrthographic.right + offsetX;
          // @ts-ignore TODO
          pointCloud.camera.top = defaultOrthographic.top + offsetY;
          // @ts-ignore TODO
          pointCloud.camera.bottom = defaultOrthographic.bottom + offsetY;
          pointCloud.camera.updateProjectionMatrix();
          pointCloud.render();
        });

        canvasSchuler.createCanvas(polygonOperation.canvas, { size: mockImgInfo });
      };
    }
  }, []);

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
