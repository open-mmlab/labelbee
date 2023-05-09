/**
 * @file Unify management of pointCloud & pointCloud2dOperation (Three views => Top & Side & Back)
 * @createDate 2022-07-18
 * @author Ron <ron.f.luo@gmail.com>
 */

import { IPointCloudBox, IPointCloudSphere, IPointCloudConfig, PointCloudUtils, ILine } from '@labelbee/lb-utils';
import { EPolygonPattern, EToolName, THybridToolName } from '@/constant/tool';
import { CanvasScheduler } from '@/newCore';
import { IPolygonData, IPolygonPoint } from '@/types/tool/polygon';
import { PointCloud } from '.';
import PointCloud2dOperation, { IPointCloud2dOperationProps } from '../toolOperation/pointCloud2dOperation';
import { IPointOperationProps } from '../toolOperation/pointOperation';
import { HybridToolUtils, ToolScheduler } from '../scheduler';

interface IPointCloudAnnotationOperation {
  updateData: (pcdPath: string, result: string) => void;
}

interface IPointCloudAnnotationProps {
  container: HTMLElement;
  size: ISize;

  pcdPath?: string;
  extraProps?: IPointCloud2dOperationProps | IPointOperationProps;

  config: IPointCloudConfig;

  checkMode?: boolean;
  toolName: THybridToolName;
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

  public pointCloud2dOperation!: PointCloud2dOperation;

  public canvasScheduler: CanvasScheduler;

  public toolScheduler: ToolScheduler;

  public toolInstance: any; // 用于存储当前工具实例

  public config: IPointCloudConfig;

  constructor({ size, container, pcdPath, extraProps, config, checkMode, toolName }: IPointCloudAnnotationProps) {
    const defaultOrthographic = this.getDefaultOrthographic(size);

    const imgSrc = createEmptyImage(size);

    const image = new Image();
    image.src = imgSrc;

    const toolScheduler = new ToolScheduler({ container, size, toolName });
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
    const defaultProps = {
      size,
      config: JSON.stringify({ ...config, attributeConfigurable: true, hideAttribute: true }),
      imgNode: image,
      checkMode,
      // forbidOperation: true,
      // forbidOperation: !!checkMode,
    };
    if (extraProps) {
      Object.assign(defaultProps, extraProps);
    }

    // init operations
    let toolList: EToolName[] = [];

    if (HybridToolUtils.isSingleTool(toolName)) {
      toolList = [toolName] as EToolName[];
    } else {
      toolList = toolName as EToolName[];
    }

    toolList.forEach((tool, i) => {
      let toolInstance;
      if (tool === EToolName.PointCloudPolygon) {
        const pointCloudPolygonOperation = toolScheduler.createOperation(tool, image, defaultProps);
        pointCloudPolygonOperation.eventBinding();
        pointCloudPolygonOperation.setPattern(EPolygonPattern.Rect);
        this.toolInstance = pointCloudPolygonOperation;
        this.toolInstance.eventBinding();
        // need to be deleted
        this.pointCloud2dOperation = pointCloudPolygonOperation;
      } else {
        /** Tools can't enable textConfigurable */
        toolInstance = toolScheduler.createOperation(tool, image, { ...defaultProps, textConfigurable: false });
      }
      if (i === toolList.length - 1) {
        if (!this.toolInstance) {
          this.toolInstance = toolInstance;
          this.toolInstance.eventBinding();
        }
        // The last one by default is the topmost operation.
      }
    });

    // 3. Data record
    this.pointCloudInstance = pointCloud;
    this.canvasScheduler = canvasScheduler;
    this.toolScheduler = toolScheduler;

    this.config = config;
  }

  public updateConfig(config: IPointCloudConfig) {
    this.config = config;
    this.pointCloud2dOperation.setConfig(JSON.stringify(config));
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

    // Init the camera
    this.pointCloudInstance.updateTopCamera();
    this.pointCloudInstance.setDefaultControls();

    // Update Canvas Size
    this.pointCloudInstance.initRenderer();

    // Update range of orthographicCamera.
    this.pointCloudInstance.initOrthographicCamera(this.getDefaultOrthographic(size));

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
      this.toolInstance.setImgNode(image);
      this.toolInstance.initImgPos();

      // this.pointCloud2dOperation.setImgNode(image);
      // this.pointCloud2dOperation.initImgPos();
    };

    // It need to update directly
    this.pointCloud2dOperation.setCanvasSize(size);
  }

  public addPolygonListOnTopView(result: string) {
    const pointCloudDataList = PointCloudUtils.getBoxParamsFromResultList(result);
    const polygonList = PointCloudUtils.getPolygonListFromResultList(result);
    this.updatePolygonList(pointCloudDataList, polygonList);
  }

  public updateLineList = (lineList: ILine[]) => {
    this.toolScheduler.updateDataByToolName(EToolName.Line, lineList ?? []);
  };

  public addLineListOnTopView(result: string) {
    const lineList = PointCloudUtils.getLineListFromResultList(result);
    this.updateLineList(lineList);
  }

  public addPointListOnTopView(result: string) {
    const sphereList = PointCloudUtils.getSphereParamsFromResultList(result);
    this.updatePointList(sphereList);
  }

  public updatePolygonList = (pointCloudDataList: IPointCloudBox[], extraList?: IPolygonData[]) => {
    let polygonList = pointCloudDataList.map((v: IPointCloudBox) => {
      const { polygon2d: pointList } = this.pointCloudInstance.getBoxTopPolygon2DCoordinate(v);
      return {
        id: v.id,
        sourceID: '',
        pointList,
        isRect: true,
        valid: v.valid ?? true,
        attribute: v.attribute,
      };
    }) as IPolygonData[];

    if (extraList) {
      // Convert extraList(polygonList) from PointCloud coordinate to Canvas Coordinate
      polygonList = polygonList.concat(
        extraList.map((v: IPolygonData) => ({
          ...v,
          pointList: v?.pointList?.map((point: IPolygonPoint) =>
            PointCloudUtils.transferWorld2Canvas(point, this.toolInstance.size),
          ),
        })),
      );
    }

    this.toolScheduler.updateDataByToolName(EToolName.PointCloudPolygon, polygonList);
  };

  public updatePointList = (sphereList: IPointCloudSphere[]) => {
    const pointList = sphereList?.map((v: IPointCloudSphere) => {
      const { point2d } = this.pointCloudInstance.getSphereTopPoint2DCoordinate(v);
      return {
        ...point2d,
        id: v.id,
        sourceID: '',
        valid: v.valid ?? true,
        attribute: v.attribute,
        textAttribute: '',
      };
    }) as IPointUnit[];
    this.toolScheduler.updateDataByToolName(EToolName.Point, pointList);
  };

  /**
   * Init or Update PointCloud Data
   * @param pcdPath
   * @param result
   * @returns
   */
  public updateData(pcdPath: string, result: string, config?: { radius?: number }) {
    if (!this.toolInstance || !this.pointCloudInstance) {
      return;
    }
    this.pointCloudInstance.loadPCDFile(pcdPath, config?.radius);
    this.addPolygonListOnTopView(result);
    this.addLineListOnTopView(result);
    this.addPointListOnTopView(result);
  }

  /**
   * switch to chosen canvas。
   *
   */
  public switchToCanvas(toolName: EToolName) {
    const newInstance = this.toolScheduler.switchToCanvas(toolName);
    if (newInstance) {
      newInstance.eventBinding();
      this.toolInstance = newInstance;
      return newInstance;
    }
    return this.toolInstance;
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
