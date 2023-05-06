import DefaultSelector, { ISelectorOperation } from './selector';

export default class LassoSelector extends DefaultSelector implements ISelectorOperation {
  mouseDown(ev: MouseEvent): void {
    if (ev.button === 2) {
      this.pushPoint(ev.offsetX, ev.offsetY);
    }
  }

  mouseUp(ev: MouseEvent): void {
    if (ev.button === 2) {
      this.store.getPointsInPolygon(this.polygon2d);
      this.updatePolygon2d([]);
    }
  }

  mouseMove(ev: MouseEvent): void {
    if (ev.button === 2) {
      this.pushPoint(ev.offsetX, ev.offsetY);
    }
  }
}
