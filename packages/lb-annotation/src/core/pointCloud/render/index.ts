/**
 * @file The set of pointCloud Render.
 * @author Laoluo <ron.f.luo@gmail.com>
 * @createdate 2023-05-05
 */
import * as THREE from 'three';
import { colorArr, IPointCloudConfig, IPointCloudSegmentation, toolStyleConverter } from '@labelbee/lb-utils';
import DrawUtils from '@/utils/tool/DrawUtils';
import EventListener from '@/core/toolOperation/eventListener';
import PointCloudStore from '../store';
import { IEventBus } from '..';

interface IPointCloudRenderProps extends IEventBus {
  store: PointCloudStore;
  nextTick: () => void;
  config?: IPointCloudConfig;
}

class PointCloudRender {
  public store: PointCloudStore;

  public nextTick: () => void;

  public on: EventListener['on'];

  public unbind: EventListener['unbind'];

  public config?: IPointCloudConfig;

  constructor({ store, on, unbind, nextTick, config }: IPointCloudRenderProps) {
    this.store = store;
    this.on = on;
    this.unbind = unbind;
    this.nextTick = nextTick;
    this.config = config;

    this.generateNewPoints = this.generateNewPoints.bind(this);
    this.clearStash = this.clearStash.bind(this);
    this.render3d = this.render3d.bind(this);
    this.updateNewPoints = this.updateNewPoints.bind(this);
    this.updatePointsColor = this.updatePointsColor.bind(this);
    this.clearAllSegmentData = this.clearAllSegmentData.bind(this);
    this.clearSelectedSegmentRender = this.clearSelectedSegmentRender.bind(this);

    this.initMsg();
    this.animate();
  }

  public get scene() {
    return this.store.scene;
  }

  public getCurrentColor(attribute = this.store.currentAttribute) {
    if (!attribute || !this.config) {
      return colorArr[0].hexString;
    }
    const { fill } = toolStyleConverter.getColorFromConfig(
      { attribute },
      { ...this.config, attributeConfigurable: true },
      {},
    );
    return fill;
  }

  public initMsg() {
    // TODO, Just for showing.
    this.on('addNewPointsCloud', this.generateNewPoints);
    this.on('updateNewPoints', this.updateNewPoints);
    this.on('clearStashRender', this.clearStash);
    this.on('clearAllSegmentData', this.clearAllSegmentData);
    this.on('reRender3d', this.render3d);
    this.on('deleteSelectedSegmentData', this.clearSelectedSegmentRender);
  }

  public unbindMsg() {
    this.unbind('addNewPointsCloud', this.generateNewPoints);
    this.unbind('updateNewPoints', this.updateNewPoints);
    this.unbind('clearStashRender', this.clearStash);
    this.unbind('clearAllSegmentData', this.clearAllSegmentData);
    this.unbind('reRender3d', this.render3d);
    this.unbind('deleteSelectedSegmentData', this.clearSelectedSegmentRender);
  }

  public get canvas2d() {
    return this.store.canvas2d;
  }

  public clearCanvasMouse() {
    this.canvas2d?.getContext('2d')?.clearRect(0, 0, this.store.containerWidth, this.store.containerHeight);
  }

  public renderCanvas2dPolygon() {
    if (this.store.polygon2d?.length > 0 && this.canvas2d) {
      DrawUtils.drawPolygon(this.canvas2d, this.store.polygon2d, {
        isClose: false,
        color: this.getCurrentColor(),
        thickness: 4,
      });
    }
  }

  public clearStash = () => {
    const pointsGeo = this.scene.getObjectByName(this.store.cacheSegData?.id ?? '');

    if (pointsGeo) {
      pointsGeo.removeFromParent();
      this.render3d();
    }
  };

  public clearAllSegmentData() {
    const len = this.scene.children.length;
    for (let i = len - 1; i >= 0; i--) {
      const point = this.scene.children[i];
      if (point.type === 'Points' && point.name !== this.store.pointCloudObjectName) {
        point.removeFromParent();
      }
    }
    this.render3d();
  }

  public clearSelectedSegmentRender(id: string = '') {
    const selectedPoints = this.scene.getObjectByName(id);
    if (selectedPoints) {
      selectedPoints.removeFromParent();
      this.render3d();
    }
  }

  // TODO, Just for showing.
  public generateNewPoints = (segmentData: IPointCloudSegmentation) => {
    const geometry = new THREE.BufferGeometry();
    // itemSize = 3 因为每个顶点都是一个三元组。
    geometry.setAttribute('position', new THREE.BufferAttribute(segmentData.points, 3));

    const pointsMaterial = new THREE.PointsMaterial({ color: this.getCurrentColor(segmentData.attribute), size: 10 });
    const newPoints = new THREE.Points(geometry, pointsMaterial);
    newPoints.name = segmentData.id;

    this.store.scene.add(newPoints);
    this.render3d();
  };

  public updateNewPoints = (segmentData: IPointCloudSegmentation) => {
    const originPoints = this.store.scene.getObjectByName(segmentData?.id ?? '') as THREE.Points;

    if (originPoints && segmentData) {
      originPoints.geometry.setAttribute('position', new THREE.Float32BufferAttribute(segmentData.points, 3));
      originPoints.material = new THREE.PointsMaterial({
        color: this.getCurrentColor(segmentData.attribute),
        size: 10,
      });
      originPoints.geometry.attributes.position.needsUpdate = true;
      originPoints.geometry.computeBoundingSphere();
      this.render3d();
    }
  };

  public updatePointsColor = (segmentData = this.store.cacheSegData) => {
    const originPoints = this.store.scene.getObjectByName(segmentData?.id ?? '') as THREE.Points;
    if (originPoints && segmentData) {
      segmentData.attribute = this.store.currentAttribute;
      originPoints.material = new THREE.PointsMaterial({
        color: this.getCurrentColor(segmentData.attribute),
        size: 10,
      });
      this.render3d();
    }
  };

  public render3d = () => {
    this.store.renderer.render(this.store.scene, this.store.camera);
  };

  public animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.clearCanvasMouse();
    this.renderCanvas2dPolygon();

    this.nextTick();
  }
}

export default PointCloudRender;
