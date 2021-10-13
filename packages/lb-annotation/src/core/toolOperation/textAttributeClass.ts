import EKeyCode from '../../constant/keyCode';
import { TEXT_ATTRIBUTE_LINE_HEIGHT, TEXT_ATTRIBUTE_MAX_LENGTH } from '../../constant/tool';

const defaultWidth = 30;

interface ITextareaData {
  width?: number;
  textAttribute: string;
  color: string;
}

interface IBaseInfo {
  getCurrentSelectedData: () => ITextareaData | undefined;
  updateSelectedTextAttribute: (newTextAttribute: string) => void;
}

interface ITextAttributeProps {
  container: HTMLElement;
  width?: number;
  icon: HTMLImageElement;
  color: string;
}

/** 文本属性默认宽度 */
const DEFAULT_TEXT_WIDTH = 164;

export default class TextAttributeClass {
  private container: HTMLElement; // 挂载位置

  private _textareaDOM?: HTMLTextAreaElement; // 修改的文本的 textarea

  private _textAttributeDOM?: HTMLElement; // 顶层定位存储

  private _textDOM?: HTMLSpanElement; // 文本

  private _iconDOM?: HTMLElement; // icon

  private getCurrentSelectedData: () => ITextareaData | undefined;

  private updateSelectedTextAttribute: (newTextAttribute: string) => void; // 用于更新当前的结果

  constructor(props: ITextAttributeProps & IBaseInfo) {
    const { container, icon, color, getCurrentSelectedData, updateSelectedTextAttribute } = props;
    const width = props.width || DEFAULT_TEXT_WIDTH;
    this.container = container;
    this.getCurrentSelectedData = getCurrentSelectedData;
    this.updateSelectedTextAttribute = updateSelectedTextAttribute;
    this._textAttributeDOM = this.initTextAttributeDOM();
    this._iconDOM = this.initIconDOM(icon);
    this._textDOM = this.initTextDOM(width, TEXT_ATTRIBUTE_LINE_HEIGHT);
    this._textareaDOM = this.initTextareaDOM(width, color);

    // 绑定到 dom 上
    this.appendToContainer();
  }

  public get isExit() {
    if (!this._textAttributeDOM) {
      return false;
    }

    return this.container.contains(this._textAttributeDOM);
  }

  public get isExitTextareaDOM() {
    if (!this._textareaDOM) {
      return false;
    }

    return this.container.contains(this._textareaDOM);
  }

  public updateIcon(icon: any) {
    if (this._iconDOM) {
      this._iconDOM.innerHTML = icon;
    }
  }

  public appendToContainer() {
    if (!this._textAttributeDOM || !this._textDOM || !this._iconDOM) {
      return;
    }

    this.container.appendChild(this._textAttributeDOM);
    this._textAttributeDOM.appendChild(this._textDOM);
    this._textAttributeDOM.appendChild(this._iconDOM);
  }

  public initTextAttributeDOM() {
    const _textAttributeDOM = document.createElement('div'); // 最顶层
    _textAttributeDOM.setAttribute('id', 'textArea'); // 为什么是这个？
    return _textAttributeDOM;
  }

  public initTextDOM(width: number, lineHeight: number) {
    const _textDOM = document.createElement('span');
    _textDOM.setAttribute(
      'style',
      `
        width: ${Math.max(width, defaultWidth)}px;
        line-height: ${lineHeight}px;
        word-break: break-all;
        white-space: pre-line;
        font-style: italic;
      `,
    );
    return _textDOM;
  }

  public initIconDOM(icon: any) {
    const _iconDOM = document.createElement('div');
    _iconDOM.setAttribute('id', 'annotation_text');
    _iconDOM.innerHTML = icon;
    _iconDOM.addEventListener('mouseup', (e: MouseEvent) => {
      e.stopPropagation();
      this.renderTextarea();
    });
    _iconDOM.addEventListener('mousedown', (e: MouseEvent) => {
      e.stopPropagation();
    });
    _iconDOM.addEventListener('contextmenu', (e: MouseEvent) => {
      e.stopPropagation();
    });
    _iconDOM.setAttribute(
      'style',
      `
        position: absolute;
        left: -20px;
        top: 4px;
        cursor: pointer;
        z-index: 10
      `,
    );
    return _iconDOM;
  }

  public initTextareaDOM(width: number, color: string) {
    const _textareaDOM = document.createElement('textarea');
    _textareaDOM.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    _textareaDOM.addEventListener('mouseup', (e) => {
      e.stopPropagation();
    });

    _textareaDOM.setAttribute(
      'style',
      `
      background-color: transparent;
      border-radius: 5px;
      border-color: ${color};
      outline: none;
      resize: none;
      width: ${Math.max(width, 30)}px;
      `,
    );
    _textareaDOM.setAttribute('maxLength', `${TEXT_ATTRIBUTE_MAX_LENGTH}`);
    return _textareaDOM;
  }

  public removeTextDOM() {
    if (!this._textAttributeDOM) {
      return;
    }

    if (this._textDOM) {
      this._textAttributeDOM.removeChild(this._textDOM);
    }
  }

  public removeIconDOM() {
    if (!this._textAttributeDOM) {
      return;
    }

    if (this._iconDOM) {
      this._textAttributeDOM.removeChild(this._iconDOM);
    }
  }

  public removeTextareaDOM() {
    if (this._textareaDOM && this._textAttributeDOM && this._textAttributeDOM?.contains(this._textareaDOM)) {
      this._textAttributeDOM?.removeChild(this._textareaDOM);
    }
  }

  public submitTextarea() {
    if (this._textareaDOM) {
      this.updateSelectedTextAttribute(this._textareaDOM?.value);
      this.removeTextareaDOM();
      this.clearTextAttribute();
    }
  }

  public textKeyDown = (e: KeyboardEvent) => {
    e.stopPropagation();
    switch (e.keyCode) {
      case EKeyCode.Enter:
        this.submitTextarea();
        this.appendToContainer();
        break;

      default: {
        break;
      }
    }
  };

  public clearTextAttribute() {
    if (this._textAttributeDOM && this.container.contains(this._textAttributeDOM)) {
      this.container.removeChild(this._textAttributeDOM);
    }
  }

  private renderTextarea() {
    if (!this._textAttributeDOM || !this._textareaDOM) {
      return;
    }

    const data = this.getCurrentSelectedData();
    if (!data) {
      return;
    }

    const { width = DEFAULT_TEXT_WIDTH, textAttribute, color } = data;
    this._textareaDOM.value = `${textAttribute}`;
    this._textareaDOM.setAttribute(
      'style',
      `
      background-color: rgba(0,0,0,0.4);
      border-radius: 5px;
      border-color: ${color};
      outline: none;
      resize: none;
      font-style: italic;
      font-weight: 900;
      text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.6);
      width: ${Math.max(width, defaultWidth)}px;
      `,
    );
    this._textareaDOM.setAttribute('maxLength', `${TEXT_ATTRIBUTE_MAX_LENGTH}`);

    this._textAttributeDOM.appendChild(this._textareaDOM);
    this.removeIconDOM();
    this.removeTextDOM();
    this._textareaDOM.focus();
    this._textareaDOM.addEventListener('keydown', this.textKeyDown); // 注意泄漏
  }

  /**
   * 更新当前文本定位、内容
   * @param textAttribute
   * @param position
   */
  public update(textAttribute: string, position: { left: number; top: number; color: string; width?: number }) {
    const { left, top, color, width = DEFAULT_TEXT_WIDTH } = position;

    const newWidth = Math.max(width, defaultWidth);
    this._textAttributeDOM?.setAttribute(
      'style',
      `
        position: absolute; 
        width: ${newWidth}px;
        font-size: 14px; 
        left:${left}px; 
        top: ${top}px; 
        color: ${color};
      `,
    );

    if (this._textDOM) {
      this._textDOM.innerHTML = `${textAttribute}`;
    }

    if (this._textareaDOM) {
      this._textareaDOM.style.width = `${newWidth}px`;
      this._textareaDOM.style.borderColor = `${color}`;
    }
  }

  /**
   * 用于外层切换选中框调用
   */
  public changeSelected() {
    // 判断是否开启了 textarea
    if (this.isExitTextareaDOM) {
      this.submitTextarea();
    }
  }
}
