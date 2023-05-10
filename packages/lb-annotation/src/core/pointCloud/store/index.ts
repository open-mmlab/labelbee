/**
 * @file PointCloud Store.
 * @author Laoluo <ron.f.luo@gmail.com>
 * @createdate 2023-05-05
 */

import * as THREE from 'three';
import { IPointCloudSegmentation } from '@labelbee/lb-utils';
import { isInPolygon } from '@/utils/tool/polygonTool';
import EventListener from '@/core/toolOperation/eventListener';
import { IPointCloudDelegate } from '..';
import uuid from '@/utils/uuid';

const DEFAULT_PREFIX = 'LABELBEE_CANVAS_';

export type ThreePoints = THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;

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
  public updatePointCloud: boolean = false;

  public addPointCloud = false;

  // TODO. clear later.
  private pointCloudObjectName = 'pointCloud';

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
    this.initMsg();
  }

  public initMsg() {
    // TODO, Just for showing.
    this.on('clearStash', this.clearStash);
    this.on('addStash2Store', this.addStash2Store);
  }

  public unbindMsg() {
    this.unbind('clearStash', this.clearStash);
    this.unbind('addStash2Store', this.addStash2Store);
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

  public setHoverPointsID(id: string) {
    this.hoverPointsID = id;
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

      for (let i = 0; i < len; i += 3) {
        const vector3d = new THREE.Vector3(cloudDataArrayLike[i], cloudDataArrayLike[i + 1], cloudDataArrayLike[i + 2]);
        vector3d.project(this.camera);
        const projection = { x: 0, y: 0 };
        projection.x = Math.round((vector3d.x * this.container.clientWidth) / 2 + this.container.clientWidth / 2);
        projection.y = Math.round((-vector3d.y * this.container.clientHeight) / 2 + this.container.clientHeight / 2);
        const isIn = isInPolygon(projection, polygon);
        if (isIn) {
          const key = `${cloudDataArrayLike[i]}@${cloudDataArrayLike[i + 1]}@${cloudDataArrayLike[i + 2]}`;

          /**
           * TODO: Has visible.
           * If it
           */
          if (this.cloudData.get(key).visible === false) {
            vertices.push(cloudDataArrayLike[i], cloudDataArrayLike[i + 1], cloudDataArrayLike[i + 2]);
            this.cloudData.get(key).visible = true;
          }
        }
      }
      const verticesArray = new Float32Array(vertices);

      if (this.cacheSegData) {
        const { points } = this.cacheSegData;
        const combinedLength = points.length + verticesArray.length;
        const combined = new Float32Array(combinedLength);
        combined.set(points, 0);
        combined.set(verticesArray, points.length);
        this.cacheSegData = {
          ...this.cacheSegData,
          points: combined,
        };
        this.updatePointCloud = true;
      } else {
        this.cacheSegData = {
          id: uuid(),
          attribute: '',
          points: verticesArray,
        };
        this.addPointCloud = true;
      }

      this.syncCacheMsg();
    }
  }

  public syncCacheMsg() {
    this.emit('syncCacheData', this.cacheSegData);
  }

  // Save temporary data to pointCloud Store.
  public addStash2Store() {
    if (this.cacheSegData) {
      this.segmentData.set(this.cacheSegData.id, this.cacheSegData);

      this.cacheSegData = undefined;
      this.syncCacheMsg();
    }
  }

  public clearStash() {
    if (this.cacheSegData) {
      if (this.segmentData.has(this.cacheSegData.id)) {
        // restore data.
        this.emit('updateNewPoints', this.segmentData.get(this.cacheSegData.id));
      } else {
        this.emit('clearStashRender');
      }
      this.cacheSegData = undefined;
      this.syncCacheMsg();
    }
  }

  public editPoints() {
    const hoverPoints = this.segmentData.get(this.hoverPointsID);
    if (hoverPoints) {
      debugger;
      this.cacheSegData = {
        ...hoverPoints,
        points: new Float32Array(hoverPoints.points),
      };
      this.updatePointCloud = true;
      this.syncCacheMsg();
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

  public resetSegDataSize() {
    this.allSegmentPoints.forEach((points) => {
      points.material.size = 5;
    });
  }

  public resetSegDataSizeAndRender() {
    this.resetSegDataSize();
    this.emit('reRender3d');
  }

  public highlightPoints(newPoints: ThreePoints) {
    // Just No data can highlight.
    if (this.cacheSegData) {
      return;
    }

    this.resetSegDataSize();
    newPoints.material.size = 10;
    this.hoverPointsID = newPoints.name;
    this.emit('reRender3d');
  }
}

export default PointCloudStore;
