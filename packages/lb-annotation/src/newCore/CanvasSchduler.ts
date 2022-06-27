/*
 * Canvas Schduler
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-22 14:59:33
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-27 16:57:59
 */
interface ICanvasBasicOperation {
  createCanvas(id: string, options?: { size?: { width: number; height: number } }): HTMLCanvasElement;
  createCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement;
  destroyCanvas(id: string): HTMLElement | null;
}

interface ICavnasSchdulerProps {
  container: HTMLElement;
}

class CanvasSchduler implements ICanvasBasicOperation {
  private container: HTMLElement;

  constructor(props: ICavnasSchdulerProps) {
    this.container = props.container;
  }

  public createCanvas(id: string | HTMLCanvasElement, options?: { size?: { width: number; height: number } }) {
    if (typeof id !== 'string') {
      this.container.appendChild(id);
      id.style.position = 'absolute';
      id.style.left = '0';
      id.style.top = '0';
      return id;
    }

    const canvas = document.createElement('canvas');
    canvas.id = id;
    if (options && options.size) {
      canvas.width = options.size.width;
      canvas.height = options.size.height;
    }

    this.container.appendChild(canvas);

    return canvas;
  }

  public destroyCanvas(id: string) {
    const dom = document.getElementById(id);
    if (dom) {
      this.container.removeChild(dom);
    }
    return dom;
  }
}

export { CanvasSchduler };
