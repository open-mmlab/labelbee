/**
 * @file PointCloud Segmentation Operation
 * @author Laoluo <ron.f.luo@gmail.com>
 * @createdate 2023-05-05
 */

import { EPointCloudSegmentStatus } from '@labelbee/lb-utils';
import LassoSelector from './selector/lassoSelector';
import PointCloudStore, { ThreePoints } from './store';
import CircleSelector from './selector/circleSelector';

interface IProps {
  dom: HTMLElement;
  store: PointCloudStore;
}

class PointCloudSegmentOperation {
  private dom: HTMLElement;

  // Operation Selector
  public currentTool: LassoSelector | CircleSelector;

  public currentToolName: 'LassoSelector' | 'CircleSelector';

  public store: PointCloudStore;

  // Selector
  public lassoSelector: LassoSelector;

  public circleSelector: CircleSelector;

  constructor(props: IProps) {
    this.dom = props.dom;
    this.store = props.store;

    this.lassoSelector = new LassoSelector(this.store);
    this.circleSelector = new CircleSelector(this.store);
    this.currentTool = this.lassoSelector;
    this.currentToolName = 'LassoSelector';
    this.dom.addEventListener('pointermove', this.onMouseMove.bind(this));
    this.dom.addEventListener('pointerdown', this.onMouseDown.bind(this));
    this.dom.addEventListener('pointerup', this.onMouseUp.bind(this));
    this.updateSelector2Lasso = this.updateSelector2Lasso.bind(this);
    this.updateSelector2Circle = this.updateSelector2Circle.bind(this);

    // this.setupRaycaster();
  }

  public getCoordinate(e: MouseEvent) {
    const bounding = this.dom.getBoundingClientRect();
    return {
      x: e.clientX - bounding.left,
      y: e.clientY - bounding.top,
    };
  }

  public get forbidOperation() {
    return this.store.forbidOperation;
  }

  public get isForbid() {
    return this.forbidOperation;
  }

  public updateSelector2Lasso() {
    this.currentTool = this.lassoSelector;
    this.currentToolName = 'LassoSelector';
  }

  public updateSelector2Circle() {
    this.currentTool = this.circleSelector;
    this.currentToolName = 'CircleSelector';
  }

  public onMouseMove = (iev: MouseEvent) => {
    /**
     * Just ready and check status can update Mouse.
     */
    if (this.store.isCheckStatus || this.store.isReadyStatus) {
      this.store.updateMouse({ x: iev.offsetX, y: iev.offsetY });
    }

    if (this.isForbid || this.store.checkMode) {
      return;
    }

    const ev = {
      offsetX: iev.offsetX,
      offsetY: iev.offsetY,
      button: iev.buttons,
    };

    this.currentTool.mouseMove(ev as MouseEvent);
  };

  public onMouseDown = (iev: MouseEvent) => {
    if (this.isForbid || this.store.checkMode) {
      return;
    }

    this.currentTool.mouseDown(iev);
  };

  public onMouseUp = (iev: MouseEvent) => {
    if (this.isForbid || this.store.orbiting === true || this.store.checkMode) {
      return;
    }

    if (this.baseMouseDown(iev)) {
      return;
    }

    this.currentTool.mouseUp(iev);
  };

  public baseMouseDown = (e: MouseEvent) => {
    // TODO: Need to forbid operation when orbit
    if (this.store.checkMode) {
      return;
    }
    switch (e.button) {
      case 0:
        if (this.store.isReadyStatus || this.store.isCheckStatus) {
          this.store.checkPoints();
          return true;
        }
        break;

      default: {
        //
      }
    }
  };

  public _raycasting = () => {
    if ([EPointCloudSegmentStatus.Ready, EPointCloudSegmentStatus.Check].includes(this.store.segmentStatus)) {
      const { mouse, camera, raycaster } = this.store;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(this.store.allSegmentPoints, false);

      const intersect = intersects[0];

      if (intersect) {
        this.store.highlightPoints(intersect.object as ThreePoints);
      } else {
        // TODO. Need to optimize.
        this.store.resetAllSegDataSizeAndRender();
        this.store.resetHoverPointsID();
      }
    }
  };
}

export { PointCloudSegmentOperation };
