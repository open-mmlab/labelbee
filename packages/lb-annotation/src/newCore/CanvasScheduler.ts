/**
 * @file Scheduling creation for multi-layer canvas
 * @createdate 2022-06-22
 * @author Ron <ron.f.luo@gmail.com>
 */
interface ICanvasBasicOperation {
  createCanvas(id: string, options?: { size?: { width: number; height: number } }): HTMLCanvasElement;
  createCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement;
  destroyCanvas(id: string): HTMLElement | null;

  switchOrder?: (key: string) => void;
}

interface ICavnasSchdulerProps {
  container: HTMLElement;
}

class CanvasScheduler implements ICanvasBasicOperation {
  private container: HTMLElement;

  constructor(props: ICavnasSchdulerProps) {
    this.container = props.container;
  }

  public createCanvas(id: string | HTMLCanvasElement, options?: { size?: { width: number; height: number } }) {
    // Add Directly
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

export { CanvasScheduler };
