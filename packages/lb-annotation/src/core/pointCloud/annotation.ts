/**
 * @file Unified management of pointCloud & pointCloud2dOperation (Three views => Top & Side & Back)
 * @createDate 2022-07-18
 * @author Ron <ron.f.luo@gmail.com>
 */

import { IPointCloudBox, PointCloudUtils } from '@labelbee/lb-utils';
import { EPolygonPattern } from '@/constant/tool';
import { CanvasScheduler } from '@/newCore';
import { IPolygonData } from '@/types/tool/polygon';
import { PointCloud } from '.';
import PointCloud2dOperation, { IPointCloud2dOperationProps } from '../toolOperation/pointCloud2dOperation';

interface IPointCloudAnnotationOperation {
  updateData: (pcdPath: string, result: string) => void;
}

interface IPointCloudAnnotationProps {
  container: HTMLElement;
  size: ISize;

  pcdPath?: string;
  polygonOperationProps?: IPointCloud2dOperationProps;
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

  public pointCloud2dOperation: PointCloud2dOperation;

  public canvasScheduler: CanvasScheduler;

  constructor({ size, container, pcdPath, polygonOperationProps }: IPointCloudAnnotationProps) {
    const defaultOrthographic = this.getDefaultOrthographic(size);

    const imgSrc = createEmptyImage(size);

    const image = new Image();
    image.src = imgSrc;
    const canvasScheduler = new CanvasScheduler({ container });

    // 1. PointCloud initialization
    const pointCloud = new PointCloud({
      container,
      noAppend: true,
      isOrthographicCamera: true,
      orthographicParams: defaultOrthographic,
    });

    if (pcdPath) {
      pointCloud.loadPCDFile(pcdPath);
    }
    canvasScheduler.createCanvas(pointCloud.renderer.domElement);

    // 2. PointCloud2dOperation initialization
    const defaultPolygonProps = {
      container,
      size,
      config: '{ "textConfigurable": false }',
      imgNode: image,
      isAppend: false,
    };
    if (polygonOperationProps) {
      Object.assign(defaultPolygonProps, polygonOperationProps);
    }

    const polygonOperation = new PointCloud2dOperation(defaultPolygonProps);

    polygonOperation.eventBinding();
    polygonOperation.setPattern(EPolygonPattern.Rect);

    canvasScheduler.createCanvas(polygonOperation.canvas, { size });

    // 3. Data record
    this.pointCloud2dOperation = polygonOperation;
    this.pointCloudInstance = pointCloud;
    this.canvasScheduler = canvasScheduler;
  }

  /**
   * Get default boundary by size.
   * @param size
   * @returns
   */
  public getDefaultOrthographic(size: ISize) {
    return {
      left: -size.width / 2,
      right: size.width / 2,
      top: size.height / 2,
      bottom: -size.height / 2,
      near: 100,
      far: -100,
    };
  }

  /**
   * Init size when the viewport updated.
   * @param size
   */
  public initSize(size: ISize) {
    // PointCloud camera init.
    this.pointCloudInstance.initOrthographicCamera(this.getDefaultOrthographic(size));
    this.pointCloudInstance.init();
    this.pointCloudInstance.initCamera();
    this.pointCloudInstance.render();

    const imgSrc = createEmptyImage(size);
    const image = new Image();
    image.src = imgSrc;
    image.onload = () => {
      /**
       * Update the polygonOperation.
       * Notice. It needs to update polygon if it shows polygon.
       * (Like `ptCtx.topViewInstance.updatePolygonList(ptCtx.pointCloudBoxList);`)
       */
      this.pointCloud2dOperation.setImgNode(image);
      this.pointCloud2dOperation.setCanvasSize(size);
      this.pointCloud2dOperation.initImgPos();
    };
  }

  public addPolygonListOnTopView(result: string) {
    const pointCloudDataList = PointCloudUtils.getBoxParamsFromResultList(result);
    const polygonList = PointCloudUtils.getPolygonListFromResultList(result);

    this.updatePolygonList(pointCloudDataList, polygonList);
  }

  public updatePolygonList = (pointCloudDataList: IPointCloudBox[], extraList?: IPolygonData[]) => {
    let polygonList = pointCloudDataList.map((v) => {
      const { polygon2d: pointList } = this.pointCloudInstance.getBoxTopPolygon2DCoordinate(v);
      return {
        id: v.id,
        sourceID: '',
        pointList,
        isRect: true,
      };
    }) as IPolygonData[];

    if (extraList) {
      polygonList = polygonList.concat(extraList);
    }

    this.pointCloud2dOperation.setResult(polygonList);
  };

  /**
   * Init or Update PointCloud Data
   * @param pcdPath
   * @param result
   * @returns
   */
  public updateData(pcdPath: string, result: string) {
    if (!this.pointCloud2dOperation || !this.pointCloudInstance) {
      return;
    }

    this.pointCloudInstance.loadPCDFile(pcdPath);
    this.addPolygonListOnTopView(result);
  }

  /**
   * Init All Position
   * 1. PointCloud camera change to topView
   * 2. Initial Polygon Position.
   */
  public initAllPosition() {
    this.pointCloudInstance.updateTopCamera();
    this.pointCloud2dOperation.initPosition();
  }

  /**
   * Clear All Data
   * 1. pointCloud Data
   * 2. polygonOperation Data
   */
  public clearAllData() {
    this.pointCloudInstance.clearPointCloudAndRender();
    this.pointCloud2dOperation.clearResult();
  }
}
