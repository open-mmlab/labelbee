import DefaultSelector, { ISelectorOperation } from './selector';

export default class CircleSelector extends DefaultSelector implements ISelectorOperation {
  public radius = 20;

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
      this.polygon2d.length = 0;
      const precision = 64;
      const PI2 = Math.PI * 2;
      const ox = this.startX;
      const oy = this.startY;
      const nx = ev.offsetX;
      const ny = ev.offsetY;

      const r = Math.sqrt((nx - ox) * (nx - ox) + (ny - oy) * (ny - oy));
      for (let a = 0; a < PI2; a += PI2 / precision) {
        this.pushPoint(ox + r * Math.cos(a), oy - r * Math.sin(a));
      }
    }
  }
}
