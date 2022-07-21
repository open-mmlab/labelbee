/**
 * @file Unified management of pointCloud  &  pointCloud2dOpeartion
 * @createdate 2022-07-18
 * @author Ron <ron.f.luo@gmail.com>
 */

import { PointCloudUtils } from '@labelbee/lb-utils';
import { EPolygonPattern } from '@/constant/tool';
import { CanvasSchduler } from '@/newCore';
import { IPolygonData } from '@/types/tool/polygon';
import { PointCloud } from '.';
import PointCloud2dOperation from '../toolOperation/pointCloud2dOperation';

interface IPointCloudAnnotationOperation {
  updateData: (pcdPath: string, result: string) => void;
}

interface IPointCloudAnnotationProps {
  container: HTMLElement;
  size: ISize;

  pcdPath?: string;
}

const createEmptyImage = (size: { width: number; height: number }) => {
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

  public canvasSchuler: CanvasSchduler;

  constructor({ size, container, pcdPath }: IPointCloudAnnotationProps) {
    const defaultOrthographic = {
      left: -size.width / 2,
      right: size.width / 2,
      top: size.height / 2,
      bottom: -size.height / 2,
      near: 100,
      far: -100,
    };

    const imgSrc = createEmptyImage(size);

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
    this.canvasSchuler = canvasSchuler;
  }

  public addPolygonListOnTopView(result: string) {
    const pointCloudDataList = PointCloudUtils.getBoxParamsFromResultList(result);
    const polygonList = pointCloudDataList.map((v) => {
      const { polygon2d: pointList } = this.pointCloudInstance.getBoxTopPolygon2DCoordinate(v);
      return {
        id: v.id,
        sourceID: '',
        pointList,
        isRect: true,
      };
    }) as IPolygonData[];

    this.pointCloud2dOpeartion.setResult(polygonList);
  }

  /**
   * Init or Update PointCloud Data
   * @param pcdPath
   * @param result
   * @returns
   */
  public updateData(pcdPath: string, result: string) {
    if (!this.pointCloud2dOpeartion || !this.pointCloudInstance) {
      return;
    }

    this.pointCloudInstance.loadPCDFile(pcdPath);
    this.addPolygonListOnTopView(result);
  }
}
