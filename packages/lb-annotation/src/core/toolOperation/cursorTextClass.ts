import StyleUtils from '@/utils/tool/StyleUtils';

const TEXT_HEIGHT = 30;

const MARGIN = 10;

export default class CursorTextClass {
  private container: HTMLElement;

  private _textDOM?: HTMLDivElement;

  constructor(props: any) {
    const { container } = props;
    this.container = container;
    this._textDOM = this.initTextDOM();
    this.appendToContainer();
  }

  public initTextDOM() {
    const _textDOM = document.createElement('div');

    StyleUtils.setDOMStyle(_textDOM, {
      display: 'none',
      position: 'absolute',
      fontSize: '14px',
      height: `${TEXT_HEIGHT}px`,
      lineHeight: `${TEXT_HEIGHT}px`,
      padding: '0 8px',
      borderRadius: '2px',
      backgroundColor: '#FFFFFF',
      zIndex: '10',
      color: 'white',
      whiteSpace: 'nowrap',
    });

    return _textDOM;
  }

  public appendToContainer() {
    if (!this._textDOM) {
      return;
    }
    this.container.appendChild(this._textDOM);
  }

  public clearTextDOM() {
    if (this._textDOM && this.container.contains(this._textDOM)) {
      this.container.removeChild(this._textDOM);
    }
  }

  public update(position: { left: number; top: number }, color: string, text: string) {
    const { left, top } = position;
    if (!this._textDOM) {
      return;
    }

    StyleUtils.setDOMStyle(this._textDOM, {
      display: 'block',
      left: `${left + MARGIN}px`,
      top: `${top - TEXT_HEIGHT - MARGIN}px`,
      backgroundColor: color,
    });

    this._textDOM.innerHTML = text;
  }
}
