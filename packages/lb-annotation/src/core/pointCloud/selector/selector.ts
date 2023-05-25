import PointCloudStore from '../store';

export interface ISelectorOperation {
  mouseDown(ev: MouseEvent): void;
  mouseUp(ev: MouseEvent): void;
  mouseMove(ev: MouseEvent): void;
}

/**
 * Unify all operation.
 */
export interface ISelectorEvent {
  which: number; // 0 left, 1 middle, 2 right;
  offsetX: number;
  offsetY: number;
}

export default class DefaultSelector {
  public store: PointCloudStore;

  public polygon2d: ICoordinate[];

  constructor(store: PointCloudStore) {
    this.store = store;
    this.polygon2d = [];
  }

  pushPoint(x: number, y: number) {
    this.polygon2d.push({ x, y });
    this.store.syncPolygon2d(this.polygon2d);
  }

  updatePolygon2d(polygon2d: ICoordinate[]) {
    this.polygon2d = polygon2d;
    this.store.syncPolygon2d(this.polygon2d);
  }
}
