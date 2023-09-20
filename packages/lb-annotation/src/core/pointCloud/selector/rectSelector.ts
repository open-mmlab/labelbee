import DefaultSelector, { ISelectorOperation } from './selector';

export default class RectSelector extends DefaultSelector implements ISelectorOperation {
  public startX?: number;

  public startY?: number;

  mouseDown(ev: MouseEvent): void {
    if (ev.button === 2) {
      this.pushPoint(ev.offsetX, ev.offsetY);
      this.startX = ev.offsetX;
      this.startY = ev.offsetY;
    }
  }

  mouseUp(ev: MouseEvent): void {
    if (ev.button === 2) {
      this.store.getPointsInPolygon(this.polygon2d);
      this.polygon2d.length = 0;
      this.startX = this.startY = NaN;
    }
  }

  mouseMove(ev: MouseEvent): void {
    if (ev.button === 2 && this.startX && this.startY) {
      const ox = this.startX;
      const oy = this.startY;
      const nx = ev.offsetX;
      const ny = ev.offsetY;

      const points = [
        { x: ox, y: oy },
        { x: nx, y: oy },
        { x: nx, y: ny },
        { x: ox, y: ny },
        { x: ox, y: oy },
      ];
      this.updatePolygon2d(points);
    }
  }
}
