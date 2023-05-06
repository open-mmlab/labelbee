/**
 * @file The set of pointCloud Render.
 * @author Laoluo <ron.f.luo@gmail.com>
 * @createdate 2023-05-05
 */
import * as THREE from 'three';
import DrawUtils from '@/utils/tool/DrawUtils';
import EventListener from '@/core/toolOperation/eventListener';
import PointCloudStore from '../store';
import { IEventBus } from '..';

interface IPointCloudRenderProps extends IEventBus {
  store: PointCloudStore;
}

class PointCloudRender {
  public store: PointCloudStore;

  public on: EventListener['on'];

  public unbind: EventListener['unbind'];

  constructor({ store, on, unbind }: IPointCloudRenderProps) {
    this.store = store;
    this.on = on;
    this.unbind = unbind;
    this.initMsg();
    this.animate();
  }

  public initMsg() {
    // TODO, Just for showing.
    this.on('addNewPointsCloud', this.generateNewPoints.bind(this));
  }

  public unbindMsg() {
    this.unbind('addNewPointsCloud', this.generateNewPoints.bind(this));
  }

  public get canvas2d() {
    return this.store.canvas2d;
  }

  public clearCanvasMouse() {
    this.canvas2d?.getContext('2d')?.clearRect(0, 0, this.store.containerWidth, this.store.containerHeight);
  }

  public renderCanvas2dPolygon() {
    if (this.store.polygon2d?.length > 0 && this.canvas2d) {
      DrawUtils.drawPolygon(this.canvas2d, this.store.polygon2d, { isClose: false, color: 'red' });
    }
  }

  // TODO, Just for showing.
  public generateNewPoints(verticesArray: Float32Array) {
    const geometry = new THREE.BufferGeometry();
    // itemSize = 3 因为每个顶点都是一个三元组。
    geometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
    const pointsMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 10 });
    const newPoints = new THREE.Points(geometry, pointsMaterial);

    this.store.scene.add(newPoints);
    this.render3d();
  }

  public render3d() {
    this.store.renderer.render(this.store.scene, this.store.camera);
  }

  public animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.clearCanvasMouse();
    this.renderCanvas2dPolygon();
  }
}

export default PointCloudRender;
