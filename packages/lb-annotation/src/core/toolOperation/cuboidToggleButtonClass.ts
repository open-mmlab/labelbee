import { ECuboidDirection } from '@/constant/annotation';
import cuboidFAB from '@/assets/attributeIcon/icon_cuboidFAB.svg';
import cuboidMore from '@/assets/attributeIcon/icon_cuboidMore.svg';
import cuboidRight from '@/assets/attributeIcon/icon_cuboidRight.svg';
import cuboidLeft from '@/assets/attributeIcon/icon_cuboidLeft.svg';
import cuboidTop from '@/assets/attributeIcon/icon_cuboidTop.svg';

interface IBaseInfo {
  cuboidButtonMove: (type: 'in' | 'out') => void;
  toggleDirection: (direction: ECuboidDirection) => void;
}

interface ITextAttributeProps {
  container: HTMLElement;
}

const MORE_ICON_LISTS = [
  {
    icon: cuboidRight,
    id: 'cuboidRight',
  },
  {
    icon: cuboidLeft,
    id: 'cuboidLeft',
  },
  {
    icon: cuboidTop,
    id: 'cuboidTop',
  },
];

export default class CuboidToggleButtonClass {
  private container: HTMLElement;

  private direction: ECuboidDirection;

  private _cuboidButtonDOM?: HTMLElement;

  private _cuboidFABDOM?: HTMLElement; // Switch icons forward and back

  private isFrontSide: boolean; // Is it front

  private _cuboidMoreDOM?: HTMLElement; // More icons

  private _cuboidMoreListDOM?: HTMLElement; // More icon lists

  private cuboidButtonMove: (type: 'in' | 'out') => void;

  private onToggleDirection: (direction: ECuboidDirection) => void;

  constructor(props: ITextAttributeProps & IBaseInfo) {
    const { container, cuboidButtonMove, toggleDirection } = props;
    this.container = container;
    this.direction = ECuboidDirection.Front;
    this.isFrontSide = true;
    this.cuboidButtonMove = cuboidButtonMove;
    this.onToggleDirection = toggleDirection;
    this._cuboidButtonDOM = this.initCuboidButtonDOM();
    this._cuboidFABDOM = this.initcuboidFABDOM(cuboidFAB);
    this._cuboidMoreDOM = this.initcuboidMoreDOM(cuboidMore);
    this._cuboidMoreListDOM = this.initcuboidMoreListDOM();

    // 绑定到 dom 上
    this.appendToContainer();
  }

  public appendToContainer() {
    if (!this._cuboidButtonDOM || !this._cuboidFABDOM || !this._cuboidMoreDOM) {
      return;
    }

    this.container.appendChild(this._cuboidButtonDOM);
    this._cuboidButtonDOM.appendChild(this._cuboidFABDOM);
    this._cuboidButtonDOM.appendChild(this._cuboidMoreDOM);
  }

  public initCuboidButtonDOM() {
    const _cuboidButtonDOM = document.createElement('div'); // Top floor
    _cuboidButtonDOM.setAttribute('id', 'LABELBEE_CUBOID_BUTTON_BOX');
    _cuboidButtonDOM.setAttribute(
      'style',
      `
        width: 40px;
        height: 74px;
        border-radius: 10px;
        background-color: #FFFFFF;
        z-index: 10;
      `,
    );
    _cuboidButtonDOM.addEventListener('mouseover', (e: MouseEvent) => {
      e.stopPropagation();
      setTimeout(() => {
        this.cuboidButtonMove('in');
      }, 100);
    });
    _cuboidButtonDOM.addEventListener('mouseleave', (e: MouseEvent) => {
      e.stopPropagation();
      setTimeout(() => {
        this.cuboidButtonMove('out');
      }, 100);
    });
    return _cuboidButtonDOM;
  }

  // Switching forward and back
  public initcuboidFABDOM(icon: any) {
    const _cuboidFAB = document.createElement('div');
    _cuboidFAB.setAttribute('id', 'CUBOID_FORWARD_AND_BACK_SWITCH');
    // const img = document.createElement('img');
    // img.src = icon;
    _cuboidFAB.innerHTML = icon;

    // _cuboidFAB.appendChild(img);
    _cuboidFAB.addEventListener('mouseup', (e: MouseEvent) => {
      e.stopPropagation();
      this.isFrontSide = !this.isFrontSide;
      this.direction = this.isFrontSide ? ECuboidDirection.Front : ECuboidDirection.Back;
      this.onToggleDirection(this.direction);
    });
    return _cuboidFAB;
  }

  // More
  public initcuboidMoreDOM(icon: any) {
    const _iconDOM = document.createElement('div');
    _iconDOM.setAttribute('id', 'CUBOID_MORE_ICON');
    // const img = document.createElement('img');
    // img.src = icon;
    // _iconDOM.appendChild(img);
    _iconDOM.innerHTML = icon;

    _iconDOM.addEventListener('mouseup', (e: MouseEvent) => {
      if (this._cuboidButtonDOM && this._cuboidMoreListDOM) {
        if (this._cuboidButtonDOM.contains(this._cuboidMoreListDOM)) {
          this.clearCuboidMoreListDOM();
        } else {
          this._cuboidButtonDOM.appendChild(this._cuboidMoreListDOM);
        }
      }
      e.stopPropagation();
    });
    _iconDOM.addEventListener('mousedown', (e: MouseEvent) => {
      e.stopPropagation();
    });
    _iconDOM.addEventListener('contextmenu', (e: MouseEvent) => {
      e.stopPropagation();
    });
    return _iconDOM;
  }

  // View more icons
  public initcuboidMoreListDOM() {
    const cuboidMoreListDOM = document.createElement('div');
    cuboidMoreListDOM.setAttribute('id', 'CUBOID_MORE_LIST_ICON');
    cuboidMoreListDOM.setAttribute(
      'style',
      `
        height: 36px;
        border-radius: 10px;
        background-color: #FFFFFF;
        z-index: 10;
        padding: 8px 10px;
        position: absolute;
        bottom: 0px;
        left: 44px;
        display: flex;
      `,
    );
    let str: string = '';

    const iconStyle = `margin-left:4px;margin-right:4px;display:flex;align-items:center;`;
    MORE_ICON_LISTS.forEach((i, index) => {
      // The last icon is a different width, so special treatment
      const lastIconStyle = index === MORE_ICON_LISTS.length - 1 ? 'margin-left:0px;margin-right:0px;' : '';
      str += `<span id=${i.id} key=${index} style=${iconStyle}${lastIconStyle}>${i.icon}</span>`;
    });

    cuboidMoreListDOM.innerHTML = str;
    cuboidMoreListDOM.childNodes.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        // @ts-ignore
        switch (item?.id) {
          case 'cuboidLeft':
            this.onToggleDirection(ECuboidDirection.Left);
            break;
          case 'cuboidRight':
            this.onToggleDirection(ECuboidDirection.Right);
            break;
          case 'cuboidTop':
            this.onToggleDirection(ECuboidDirection.Top);
            break;
          default:
            break;
        }
        this.clearCuboidMoreListDOM();
        this.cuboidButtonMove('out');
      });
    });
    return cuboidMoreListDOM;
  }

  /**
   * Update current button (top)
   * @param position
   */
  public update(position: { left: number; top: number; color: string; width?: number }) {
    const { left, top, color } = position;
    this._cuboidButtonDOM?.setAttribute(
      'style',
      `
        position: absolute; 
        font-size: 14px; 
        left:${left}px; 
        top: ${top}px; 
        color: ${color};
        width: 41px;
        height: 74px;
        border-radius: 10px;
        background-color: #FFFFFF;
        cursor: pointer;
        text-align: center;
        padding-top: 10px;
        z-index: 10;
      `,
    );
  }

  // Clear toggle button (top)
  public clearCuboidButtonDOM() {
    if (this._cuboidButtonDOM && this.container.contains(this._cuboidButtonDOM)) {
      this.container.removeChild(this._cuboidButtonDOM);
    }
  }

  // Clear More Icon button display
  public clearCuboidMoreListDOM() {
    if (this._cuboidButtonDOM && this._cuboidMoreListDOM && this._cuboidButtonDOM.contains(this._cuboidMoreListDOM)) {
      this._cuboidButtonDOM.removeChild(this._cuboidMoreListDOM);
    }
  }
}
