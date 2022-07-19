/**
 * @file Unified management of pointCloud  &  pointCloud2dOpeartion
 * @createdate 2022-07-18
 * @author Ron <ron.f.luo@gmail.com>
 */

import { EPolygonPattern } from '@/constant/tool';
import { CanvasSchduler } from '@/newCore';
import { PointCloud } from '.';
import PointCloud2dOperation from '../toolOperation/pointCloud2dOperation';

interface IPointCloudAnnotationOperation {}

interface IPointCloudAnnotationProps {
  container: HTMLElement;
  size: ISize;

  pcdPath?: string;
}

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

export class PointCloudAnnotation implements IPointCloudAnnotationOperation {
  public pointCloudInstance: PointCloud;

  public pointCloud2dOpeartion: PointCloud2dOperation;

  constructor({ size, container, pcdPath }: IPointCloudAnnotationProps) {
    const defaultOrthographic = {
      left: -size.width / 2,
      right: size.width / 2,
      top: size.height / 2,
      bottom: -size.height / 2,
      near: 100,
      far: -100,
    };

    const imgSrc = CreateEmptyImage(size);

    const image = new Image();
    image.src = imgSrc;
    const canvasSchuler = new CanvasSchduler({ container });

    // 1. PointCloud initialization
    const pointCloud = new PointCloud({
      container,
      noAppend: true,
      isOrthographicCamera: true,
      orthgraphicParams: defaultOrthographic,
    });

    if (pcdPath) {
      pointCloud.loadPCDFile(pcdPath);
    }
    canvasSchuler.createCanvas(pointCloud.renderer.domElement);

    // 2. PointCloud2dOperation initialization
    const polygonOperation = new PointCloud2dOperation({
      container,
      size,
      config: '{ "textConfigurable": false }',
      imgNode: image,
      isAppend: false,
    });

    polygonOperation.eventBinding();
    polygonOperation.setPattern(EPolygonPattern.Rect);

    canvasSchuler.createCanvas(polygonOperation.canvas, { size });

    // 3. Data record
    this.pointCloud2dOpeartion = polygonOperation;
    this.pointCloudInstance = pointCloud;
  }
}
