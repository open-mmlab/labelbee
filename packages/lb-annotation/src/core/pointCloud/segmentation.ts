/**
 * @file PointCloud Segmentation Operation
 * @author Laoluo <ron.f.luo@gmail.com>
 * @createdate 2023-05-05
 */

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

  public store: PointCloudStore;

  // Selector
  public lassoSelector: LassoSelector;

  public circleSelector: CircleSelector;

  constructor(props: IProps) {
    this.dom = props.dom;
    this.store = props.store;

    this.lassoSelector = new LassoSelector(this.store);
    this.circleSelector = new CircleSelector(this.store);
    this.currentTool = this.circleSelector;
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

  public updateSelector2Lasso() {
    this.currentTool = this.lassoSelector;
  }

  public updateSelector2Circle() {
    this.currentTool = this.circleSelector;
  }

  public onMouseMove = (iev: MouseEvent) => {
    if (this.forbidOperation) {
      return;
    }

    const ev = {
      offsetX: iev.offsetX,
      offsetY: iev.offsetY,
      button: iev.buttons,
    };

    // TODO: Need add more status to sync mouse
    this.store.updateMouse({ x: ev.offsetX, y: ev.offsetY });

    this.currentTool.mouseMove(ev as MouseEvent);
  };

  public onMouseDown = (iev: MouseEvent) => {
    if (this.forbidOperation) {
      return;
    }

    this.currentTool.mouseDown(iev);
  };

  public onMouseUp = (iev: MouseEvent) => {
    if (this.forbidOperation || this.store.orbiting === true) {
      return;
    }

    if (this.baseMouseDown(iev)) {
      return;
    }

    this.currentTool.mouseUp(iev);
  };

  public baseMouseDown = (e: MouseEvent) => {
    // TODO: Need to forbid operation when orbit
    if (e.button === 0 && this.store.hoverPointsID) {
      this.store.editPoints();

      return true;
    }
  };

  public _raycasting = () => {
    const { mouse, camera, raycaster } = this.store;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(this.store.allSegmentPoints, false);

    const intersect = intersects[0];

    if (intersect) {
      this.store.highlightPoints(intersect.object as ThreePoints);
    } else {
      // TODO. Need to optimize.
      this.store.resetSegDataSizeAndRender();
    }
  };
}

export { PointCloudSegmentOperation };
