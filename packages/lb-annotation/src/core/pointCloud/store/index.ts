/**
 * @file PointCloud Store.
 * @author Laoluo <ron.f.luo@gmail.com>
 * @createdate 2023-05-05
 */

import * as THREE from 'three';
import { isInPolygon } from '@/utils/tool/polygonTool';
import { IPointCloudDelegate } from '..';
import EventListener from '@/core/toolOperation/eventListener';

const DEFAULT_PREFIX = 'LABELBEE_CANVAS_';

class PointCloudStore {
  public canvas2d: HTMLCanvasElement | null = null;

  private container: HTMLElement;

  public renderer: THREE.WebGLRenderer;

  public scene: THREE.Scene;

  public camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;

  public polygon2d: ICoordinate[] = [];

  public forbidOperation = false;

  // TODO. clear later.
  private pointCloudObjectName = 'pointCloud';

  private emit: EventListener['emit'];

  constructor({ container, scene, camera, renderer, emit }: IPointCloudDelegate) {
    this.container = container;
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.emit = emit;

    this.createCanvas2d();
  }

  public get containerWidth() {
    return this.container.clientWidth;
  }

  public get containerHeight() {
    return this.container.clientHeight;
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
    console.time('GetPolygon');
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
          vertices.push(cloudDataArrayLike[i], cloudDataArrayLike[i + 1], cloudDataArrayLike[i + 2]);
        }
      }
      const verticesArray = new Float32Array(vertices);

      this.emit('addNewPointsCloud', verticesArray);
    }
  }

  public setForbidOperation(forbidOperation: boolean) {
    this.forbidOperation = forbidOperation;
  }
}

export default PointCloudStore;
