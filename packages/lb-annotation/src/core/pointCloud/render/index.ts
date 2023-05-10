/**
 * @file The set of pointCloud Render.
 * @author Laoluo <ron.f.luo@gmail.com>
 * @createdate 2023-05-05
 */
import * as THREE from 'three';
import { IPointCloudSegmentation, colorArr } from '@labelbee/lb-utils';
import DrawUtils from '@/utils/tool/DrawUtils';
import EventListener from '@/core/toolOperation/eventListener';
import PointCloudStore from '../store';
import { IEventBus } from '..';

interface IPointCloudRenderProps extends IEventBus {
  store: PointCloudStore;
  nextTick: () => void;
}

class PointCloudRender {
  public store: PointCloudStore;

  public nextTick: () => void;

  public on: EventListener['on'];

  public unbind: EventListener['unbind'];

  constructor({ store, on, unbind, nextTick }: IPointCloudRenderProps) {
    this.store = store;
    this.on = on;
    this.unbind = unbind;
    this.nextTick = nextTick;
    this.initMsg();
    this.animate();

    this.generateNewPoints = this.generateNewPoints.bind(this);
    this.clearStash = this.clearStash.bind(this);
    this.render3d = this.render3d.bind(this);
    this.updateNewPoints = this.updateNewPoints.bind(this);
  }

  public get scene() {
    return this.store.scene;
  }

  public initMsg() {
    // TODO, Just for showing.
    this.on('addNewPointsCloud', this.generateNewPoints);
    this.on('clearStashRender', this.clearStash);
    this.on('reRender3d', this.render3d);
    this.on('updateNewPoints', this.updateNewPoints);
  }

  public unbindMsg() {
    this.unbind('addNewPointsCloud', this.generateNewPoints);
    this.unbind('clearStashRender', this.clearStash);
    this.unbind('reRender3d', this.render3d);
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

  public clearStash = () => {
    const pointsGeo = this.scene.getObjectByName(this.store.cacheSegData?.id ?? '');

    if (pointsGeo) {
      pointsGeo.removeFromParent();
      this.render3d();
    }
  };

  // TODO, Just for showing.
  public generateNewPoints(segmentData: IPointCloudSegmentation) {
    const geometry = new THREE.BufferGeometry();
    // itemSize = 3 因为每个顶点都是一个三元组。
    geometry.setAttribute('position', new THREE.BufferAttribute(segmentData.points, 3));

    // Temporary: Just for showing the different entities.
    const customIndex = Math.floor(Math.random() * 255);

    const pointsMaterial = new THREE.PointsMaterial({ color: colorArr[customIndex].hexString, size: 10 });
    const newPoints = new THREE.Points(geometry, pointsMaterial);
    newPoints.name = segmentData.id;

    this.store.scene.add(newPoints);
    this.render3d();
  }

  public updateNewPoints = (segmentData = this.store.cacheSegData) => {
    const originPoints = this.store.scene.getObjectByName(segmentData?.id ?? '') as THREE.Points;

    if (originPoints && segmentData) {
      originPoints.geometry.setAttribute('position', new THREE.Float32BufferAttribute(segmentData.points, 3));
      originPoints.geometry.attributes.position.needsUpdate = true;
      this.render3d();
    }
  };

  public render3d = () => {
    this.store.renderer.render(this.store.scene, this.store.camera);
  };

  public animate() {
    requestAnimationFrame(this.animate.bind(this));

    // Add PointCloud
    if (this.store.cacheSegData) {
      if (this.store.addPointCloud === true) {
        this.store.addPointCloud = false;
        this.generateNewPoints(this.store.cacheSegData);
      }

      if (this.store.updatePointCloud === true) {
        this.store.updatePointCloud = false;
        this.updateNewPoints();
      }
    }

    this.clearCanvasMouse();
    this.renderCanvas2dPolygon();

    this.nextTick();
  }
}

export default PointCloudRender;
