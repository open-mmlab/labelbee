/**
 * @file PointCloud Store.
 * @author Laoluo <ron.f.luo@gmail.com>
 * @createdate 2023-05-05
 */

import * as THREE from 'three';
import {
  EPointCloudSegmentCoverMode,
  EPointCloudSegmentFocusMode,
  EPointCloudSegmentMode,
  IPointCloudSegmentation,
  PointCloudUtils,
} from '@labelbee/lb-utils';
import { isInPolygon } from '@/utils/tool/polygonTool';
import EventListener from '@/core/toolOperation/eventListener';
import uuid from '@/utils/uuid';
import { IPointCloudDelegate } from '..';
import pointCloudFSM from './fsm';

const DEFAULT_PREFIX = 'LABELBEE_CANVAS_';

export type ThreePoints = THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;

/**
 * TODO:
 * Need to think about store:
 * 1. The definition of points in IPointCloudSegmentation is Float32Array ?
 * 2. CloudData store the status ?
 */
class PointCloudStore {
  public canvas2d: HTMLCanvasElement | null = null;

  private container: HTMLElement;

  public renderer: THREE.WebGLRenderer;

  public scene: THREE.Scene;

  public camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;

  public polygon2d: ICoordinate[] = [];

  public forbidOperation = false;

  public raycaster = new THREE.Raycaster();

  /** Mouse Data */
  public mouse = new THREE.Vector2();

  /** Data Store */
  // PointCloud Data.
  public cloudData = new Map();

  // Each entity.
  public segmentData = new Map<string, IPointCloudSegmentation>();

  // Save the temporarily segmentData.
  public cacheSegData?: IPointCloudSegmentation;

  /** Raycaster Hover PointsID */
  public hoverPointsID: string = '';

  /** Render Status */
  public segmentMode = EPointCloudSegmentMode.Add;

  public segmentCoverMode = EPointCloudSegmentCoverMode.Cover;

  public segmentFocusMode = EPointCloudSegmentFocusMode.Unfocus;

  public hideSegment = false;

  public updatePointCloud: boolean = false;

  public addPointCloud = false;

  public orbiting = false;

  // current attribute of segmentation points
  public currentAttribute: string = '';

  // TODO. clear later.
  public pointCloudObjectName = 'pointCloud';

  private emit: EventListener['emit'];

  private on: EventListener['on'];

  private unbind: EventListener['unbind'];

  constructor({ container, scene, camera, renderer, emit, on, unbind }: IPointCloudDelegate) {
    this.container = container;
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.emit = emit;
    this.on = on;
    this.unbind = unbind;

    this.createCanvas2d();

    this.clearStash = this.clearStash.bind(this);
    this.addStash2Store = this.addStash2Store.bind(this);
    this.updateCheck2Edit = this.updateCheck2Edit.bind(this);
    this.setAttribute = this.setAttribute.bind(this);
    this.setSegmentMode = this.setSegmentMode.bind(this);
    this.setSegmentCoverMode = this.setSegmentCoverMode.bind(this);
    this.setSegmentFocusMode = this.setSegmentFocusMode.bind(this);
    this.switchSegmentHideMode = this.switchSegmentHideMode.bind(this);
    this.clearSegmentResult = this.clearSegmentResult.bind(this);
    this.initMsg();
    this.setupRaycaster();
  }

  public initMsg() {
    // TODO, Just for showing.
    this.on('clearStash', this.clearStash);
    this.on('addStash2Store', this.addStash2Store);
    this.on('updateCheck2Edit', this.updateCheck2Edit);
    this.on('setSegmentMode', this.setSegmentMode);
    this.on('setSegmentCoverMode', this.setSegmentCoverMode);
    this.on('setSegmentFocusMode', this.setSegmentFocusMode);
    this.on('switchHideSegment', this.switchSegmentHideMode);
    this.on('clearAllSegmentData', this.clearSegmentResult);
  }

  public unbindMsg() {
    this.unbind('clearStash', this.clearStash);
    this.unbind('addStash2Store', this.addStash2Store);
    this.unbind('updateCheck2Edit', this.updateCheck2Edit);
    this.unbind('setSegmentMode', this.setSegmentMode);
    this.unbind('setSegmentCoverMode', this.setSegmentCoverMode);
    this.unbind('setSegmentFocusMode', this.setSegmentFocusMode);
    this.unbind('switchHideSegment', this.switchSegmentHideMode);
    this.unbind('clearAllSegmentData', this.clearSegmentResult);
  }

  public get containerWidth() {
    return this.container.clientWidth;
  }

  public get containerHeight() {
    return this.container.clientHeight;
  }

  public get allSegmentPoints(): ThreePoints[] {
    return this.scene.children.filter(
      (v) => v.type === 'Points' && v.name !== this.pointCloudObjectName,
    ) as ThreePoints[];
  }

  public get segmentStatus() {
    return pointCloudFSM.segmentStatus;
  }

  public get isReadyStatus() {
    return pointCloudFSM.isReadyStatus;
  }

  public get isCheckStatus() {
    return pointCloudFSM.isCheckStatus;
  }

  public get isEditStatus() {
    return pointCloudFSM.isEditStatus;
  }

  /**
   * Need to update the name.
   */
  public get formatData() {
    const newArray = this.segmentData.values();
    const arr = [];
    /**
     * TODO： Need to update.
     */
    // @ts-ignore
    for (const v of newArray) {
      arr.push({
        attribute: v.attribute,
        id: v.id,
        indexes: v.indexes,
      });
    }

    return arr;
  }

  public get pointCloudArray() {
    return this.scene.getObjectByName(this.pointCloudObjectName) as THREE.Points;
  }

  public clearSegmentResult() {
    this.segmentData = new Map();
  }

  public updateCurrentSegment(segmentData: IPointCloudSegmentation[]) {
    this.segmentData = new Map();
    const { pointCloudArray } = this;

    if (!pointCloudArray) {
      return;
    }

    const position = pointCloudArray.geometry.attributes.position.array;

    segmentData.forEach((data) => {
      // indexes to points.
      const points: number[] = [];
      data.indexes.forEach((index) => {
        points.push(position[index * 3], position[index * 3 + 1], position[index * 3 + 2]);
      });

      const newPoints = {
        ...data,
        points: new Float32Array(points),
      };
      this.segmentData.set(data.id, newPoints);
      this.emit('addNewPointsCloud', {
        ...data,
        points: new Float32Array(points),
      });
    });
  }

  public statusToggle() {
    pointCloudFSM.statusToggle();
  }

  public updateStatus2Edit() {
    pointCloudFSM.updateStatus2Edit();
  }

  public createCanvas(id: string) {
    const canvas = document.createElement('canvas');
    canvas.id = id;
    this.updateCanvasBasicStyle(canvas, { width: this.containerWidth, height: this.containerHeight }, 10);
    return canvas;
  }

  public createCanvas2d() {
    this.canvas2d = this.createCanvas(`${DEFAULT_PREFIX}2d`);
    this.container.appendChild(this.canvas2d);
  }

  public setupRaycaster() {
    this.raycaster.params = {
      Mesh: {},
      Line: { threshold: 1 },
      LOD: {},
      Points: { threshold: 0.2 },
      Sprite: {},
    };
  }

  public setHoverPointsID(id: string) {
    this.hoverPointsID = id;
  }

  public setSegmentMode(mode: EPointCloudSegmentMode) {
    this.segmentMode = mode;
  }

  public setSegmentCoverMode(coverMode: EPointCloudSegmentCoverMode) {
    this.segmentCoverMode = coverMode;
  }

  public setSegmentFocusMode(focusMode: EPointCloudSegmentFocusMode) {
    this.segmentFocusMode = focusMode;
    if (focusMode === EPointCloudSegmentFocusMode.Focus) {
      this.emit('clearPointCloud');
    }
    if (focusMode === EPointCloudSegmentFocusMode.Unfocus) {
      this.emit('loadPCDFile');
    }
    this.emit('reRender3d');
    this.updatePointCloudBySegment(
      focusMode === EPointCloudSegmentFocusMode.Focus ? [] : [...this.segmentData.values()],
    );
  }

  public switchSegmentHideMode(hideSegment: boolean) {
    this.hideSegment = hideSegment;
    this.updatePointCloudBySegment(hideSegment === true ? [] : [...this.segmentData.values()]);
  }

  public updateCanvasBasicStyle(canvas: HTMLCanvasElement, size: ISize, zIndex: number) {
    const pixel = 1;
    canvas.style.position = 'absolute';
    canvas.width = size.width * pixel;
    canvas.height = size.height * pixel;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.zIndex = `${zIndex} `;
  }

  public syncPolygon2d(polygon2d: ICoordinate[]) {
    this.polygon2d = polygon2d;
  }

  // TODO. Not the last version.
  public getPointsInPolygon(originPolygon: ICoordinate[]) {
    const polygon = originPolygon;
    const originPoints = this.scene.getObjectByName(this.pointCloudObjectName) as THREE.Points;

    const cloudDataArrayLike = originPoints?.geometry?.attributes?.position?.array;
    if (cloudDataArrayLike) {
      const len = cloudDataArrayLike.length;
      const vertices = [];
      const covers = [];

      const indexes = [];

      for (let i = 0; i < len; i += 3) {
        const vector3d = new THREE.Vector3(cloudDataArrayLike[i], cloudDataArrayLike[i + 1], cloudDataArrayLike[i + 2]);
        vector3d.project(this.camera);
        const projection = { x: 0, y: 0 };
        projection.x = Math.round((vector3d.x * this.container.clientWidth) / 2 + this.container.clientWidth / 2);
        projection.y = Math.round((-vector3d.y * this.container.clientHeight) / 2 + this.container.clientHeight / 2);
        const isIn = isInPolygon(projection, polygon);
        if (isIn) {
          const x = cloudDataArrayLike[i];
          const y = cloudDataArrayLike[i + 1];
          const z = cloudDataArrayLike[i + 2];
          const key = PointCloudUtils.getCloudKeys(x, y, z);

          /**
           * TODO: Has visible.
           *
           */
          if (this.segmentMode === EPointCloudSegmentMode.Remove) {
            this.cloudData.get(key).visible = false;
            vertices.push(cloudDataArrayLike[i], cloudDataArrayLike[i + 1], cloudDataArrayLike[i + 2]);
          }
          if (this.segmentMode === EPointCloudSegmentMode.Add) {
            if (this.segmentCoverMode === EPointCloudSegmentCoverMode.Cover) {
              vertices.push(cloudDataArrayLike[i], cloudDataArrayLike[i + 1], cloudDataArrayLike[i + 2]);
              indexes.push(i / 3);
              if (this.cloudData.get(key).visible === true) {
                covers.push(cloudDataArrayLike[i], cloudDataArrayLike[i + 1], cloudDataArrayLike[i + 2]);
              }
            }
            if (this.segmentCoverMode === EPointCloudSegmentCoverMode.Uncover) {
              if (this.cloudData.get(key).visible === false) {
                vertices.push(cloudDataArrayLike[i], cloudDataArrayLike[i + 1], cloudDataArrayLike[i + 2]);
              }
            }
            if (this.cloudData.get(key).visible === false) {
              this.cloudData.get(key).visible = true;
            }
          }
        }
      }
      const verticesArray = new Float32Array(vertices);
      const coversArray = new Float32Array(covers);

      this.updateStatusBySelector(verticesArray, coversArray, indexes);
    }
  }

  public updateStatusBySelector(verticesArray: Float32Array, coversArray: Float32Array, indexes: number[]) {
    switch (this.segmentMode) {
      case EPointCloudSegmentMode.Add:
        if (this.cacheSegData) {
          const { points, coverPoints = new Float32Array([]) } = this.cacheSegData;
          const combinedLength = points.length + verticesArray.length;
          const combined = new Float32Array(combinedLength);
          combined.set(points, 0);
          combined.set(verticesArray, points.length);
          const coverCombinedLength = coverPoints.length + coversArray.length;
          const coverCombined = new Float32Array(coverCombinedLength);
          coverCombined.set(coverPoints, 0);
          coverCombined.set(coversArray, coverPoints.length);
          this.cacheSegData = {
            ...this.cacheSegData,
            points: combined,
            coverPoints: coverCombined,
          };
          this.emit('updateNewPoints', this.cacheSegData);
        } else {
          this.cacheSegData = {
            id: uuid(),
            attribute: this.currentAttribute,
            points: verticesArray,
            coverPoints: coversArray,
            indexes,
          };
          this.emit('addNewPointsCloud', this.cacheSegData);
        }
        break;

      case EPointCloudSegmentMode.Remove:
        // Split the point in originPoint
        if (this.cacheSegData) {
          const { points } = this.cacheSegData;
          this.cacheSegData = {
            ...this.cacheSegData,
            points: this.splitPointsFromPoints(points, verticesArray),
          };
          this.emit('updateNewPoints', this.cacheSegData);
        }
        break;

      default: {
        //
      }
    }

    this.updateStatus2Edit();

    this.emit('syncPointCloudStatus', {
      segmentStatus: this.segmentStatus,
      cacheSegData: this.cacheSegData,
    });
  }

  public splitPointsFromPoints(originPoints: Float32Array, splitPoints: Float32Array) {
    const splitMap = new Map();
    for (let i = 0; i < splitPoints.length; i += 3) {
      splitMap.set(PointCloudUtils.getCloudKeys(splitPoints[i], splitPoints[i + 1], splitPoints[i + 2]), 1);
    }

    const result = [];
    for (let i = 0; i < originPoints.length; i += 3) {
      const key = PointCloudUtils.getCloudKeys(originPoints[i], originPoints[i + 1], originPoints[i + 2]);
      if (!splitMap.has(key)) {
        result.push(originPoints[i], originPoints[i + 1], originPoints[i + 2]);
      }
    }

    return new Float32Array(result);
  }

  public syncPointCloudStatus() {
    this.statusToggle();
    const { segmentStatus, cacheSegData } = this;
    this.emit('syncPointCloudStatus', { segmentStatus, cacheSegData });
  }

  // Save temporary data to pointCloud Store.
  public addStash2Store() {
    if (this.isEditStatus && this.cacheSegData) {
      if (this.cacheSegData.coverPoints && this.cacheSegData.coverPoints.length !== 0) {
        this.updateCoverPoints(this.cacheSegData.coverPoints);
      }
      delete this.cacheSegData.coverPoints;
      this.segmentData.set(this.cacheSegData.id, this.cacheSegData);
      this.cacheSegData = undefined;
      this.syncPointCloudStatus();
    }
  }

  // rerender pointcloud by filtered segment data
  public updatePointCloudBySegment = (segArr: IPointCloudSegmentation[]) => {
    this.segmentData.forEach((seg, id) => {
      if (id !== this.cacheSegData?.id) {
        const segPoints = this.scene.getObjectByName(id);
        if (segPoints) {
          segPoints.removeFromParent();
        }
      }
    });
    if (segArr.length !== 0) {
      segArr.map((seg) => {
        this.emit('addNewPointsCloud', seg);
        return seg;
      });
    }
    this.emit('reRender3d');
  };

  public updateCoverPoints = (coverPoints: Float32Array = new Float32Array([])) => {
    this.segmentData.forEach((seg, id) => {
      if (id !== this.cacheSegData?.id) {
        const newPoints = this.splitPointsFromPoints(seg.points, coverPoints);
        seg.points = newPoints;

        // update points in threeJs
        const originPoints = this.scene.getObjectByName(id) as THREE.Points;
        if (originPoints) {
          originPoints.geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPoints, 3));
          originPoints.geometry.attributes.position.needsUpdate = true;
        }
      }
    });
    this.emit('reRender3d');
  };

  public updateCloudDataStatus(points: Float32Array, status: { [key: string]: any }) {
    for (let i = 0; i < points.length; i += 3) {
      const x = points[i];
      const y = points[i + 1];
      const z = points[i + 2];
      const key = PointCloudUtils.getCloudKeys(x, y, z);
      const data = this.cloudData.get(key);
      Object.keys(status).forEach((k: string) => {
        data[k] = status[k];
      });
    }
  }

  public clearStash() {
    if (this.isEditStatus && this.cacheSegData) {
      this.updateCloudDataStatus(this.cacheSegData.points, { visible: false });
      if (this.segmentData.has(this.cacheSegData.id)) {
        // restore data.
        const originSegmentData = this.segmentData.get(this.cacheSegData.id);
        if (originSegmentData) {
          this.emit('updateNewPoints', originSegmentData);
          this.updateCloudDataStatus(originSegmentData?.points, { visible: true });
        }
      } else {
        // Clear All Data.
        this.emit('clearStashRender');
      }
      this.cacheSegData = undefined;
      this.syncPointCloudStatus();
    }
  }

  public updateCheck2Edit() {
    if (this.isCheckStatus) {
      this.syncPointCloudStatus();
    }
  }

  public checkPoints() {
    const hoverPoints = this.segmentData.get(this.hoverPointsID);
    if (hoverPoints) {
      this.cacheSegData = {
        ...hoverPoints,
        points: new Float32Array(hoverPoints.points),
      };
      pointCloudFSM.updateStatus2Check();
      this.emit('syncPointCloudStatus', {
        segmentStatus: this.segmentStatus,
        cacheSegData: this.cacheSegData,
      });
    }
  }

  /**
   * Change CheckInstance to EditInstance.
   */
  public editPoints() {
    const hoverPoints = this.segmentData.get(this.hoverPointsID);
    if (hoverPoints) {
      this.cacheSegData = {
        ...hoverPoints,
        points: new Float32Array(hoverPoints.points),
      };
      this.emit('updateNewPoints');
      this.syncPointCloudStatus();
    }
  }

  // Add pointCloud Render
  public setForbidOperation(forbidOperation: boolean) {
    this.forbidOperation = forbidOperation;
  }

  public updateMouse(offset: ICoordinate) {
    // Calculate pointer position in normalized device coordinates.
    // (-1 to +1) for both components.
    const x = (offset.x / this.containerWidth) * 2 - 1;
    const y = -(offset.y / this.containerHeight) * 2 + 1;

    this.mouse.setX(x);
    this.mouse.setY(y);
  }

  public resetAllSegDataSize() {
    this.allSegmentPoints.forEach((points) => {
      // If it has data in cache. Not to update style.
      if (this.cacheSegData?.id === points.name) {
        return;
      }
      points.material.size = 5;
    });
  }

  public resetHoverPointsID() {
    this.hoverPointsID = '';
  }

  public resetAllSegDataSizeAndRender() {
    this.resetAllSegDataSize();
    this.emit('reRender3d');
  }

  public highlightPoints(newPoints: ThreePoints) {
    // Just No data can highlight.
    if (!(this.isCheckStatus || this.isReadyStatus)) {
      return;
    }

    this.resetAllSegDataSize();
    newPoints.material.size = 10;
    this.hoverPointsID = newPoints.name;
    this.emit('reRender3d');
  }

  public setAttribute(attribute: string) {
    this.currentAttribute = attribute;
  }
}

export default PointCloudStore;
