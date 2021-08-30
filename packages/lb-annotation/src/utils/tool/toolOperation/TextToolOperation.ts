import uuid from '@/utils/uuid';
import EKeyCode from '@/constant/keyCode';
import CommonToolUtils from '@/utils/tool/CommonToolUtils';
import { BasicToolOperation, IBasicToolOperationProps } from './basicToolOperation';

interface ITextResult {
  id: string;
  sourceID: string;
  value: { [key: string]: string };
}

interface ITextToolProps extends IBasicToolOperationProps {}

class TextToolOperation extends BasicToolOperation {
  private textList: ITextResult[];

  constructor(props: ITextToolProps) {
    super(props);
    this.textList = [];
    this.setShowDefaultCursor(true);
    this.setConfig(props.config);
    this.initTextDisplayContainer();
  }

  get dataList() {
    return this.textList;
  }

  get textValueContainerID() {
    return 'textValueContainer';
  }

  get textValueContainer() {
    return document.getElementById(this.textValueContainerID);
  }

  public setResult(result: ITextResult[]) {
    this.textList = result.length === 0 ? this.getInitValue() : result;
    this.toggleTextContainerVisible(true);
    Object.keys(this.textList[0].value).forEach((k) => {
      this.renderText(k, this.textList[0].value[k]);
    });
  }

  /**
   * 获取初始值
   * @param useDefault
   */
  public getInitValue = (useDefault: boolean = true) => {
    const initValue: any = {};
    if (this.config.configList.length > 0) {
      this.config.configList.forEach((i: { key: string; default: string }) => {
        initValue[i.key] = useDefault ? i.default ?? '' : '';
      });
    }

    return [{ value: initValue, id: uuid(), sourceID: CommonToolUtils.getSourceID() }] as ITextResult[];
  };

  public updateTextValue(k: string, v: string) {
    this.textList[0].value[k] = v;
    this.renderText(k, v);
    this.emit('valueUpdated');
  }

  /**
   *
   * @param key
   * @param value
   */
  public renderText(key: string, value: string) {
    const textDom = document.getElementById(`textKey${key}`);
    if (textDom) {
      textDom.innerText = value;
    }
  }

  public getTextDomID(key: string) {
    return `textKey${key}`;
  }

  /** 初始化文本渲染元素 */
  public initTextDisplayContainer() {
    const dom = document.createElement('div');
    const domStyle: { [key: string]: string } = {
      position: 'absolute',
      right: '0',
      top: '0',
      'z-index': '20',
      'max-width': '20%',
      'font-family': 'SourceHanSansCN-Regular',
      background: 'rgb(102, 230, 255)',
      color: 'white',
      'word-break': 'break-all',
      'line-height': '24px',
      'white-space': 'pre-wrap',
      'max-height': '80%',
      'overflow-y': 'auto',
      opacity: '0.6',
    };

    dom.setAttribute(
      'style',
      Object.keys(domStyle).reduce((pre: string, key: string) => {
        pre += `${key}: ${domStyle[key]};`;
        return pre;
      }, ''),
    );

    dom.setAttribute('id', this.textValueContainerID);

    this.config.configList.forEach((i: any) => {
      const div = document.createElement('div');
      const label = document.createElement('div');
      const value = document.createElement('div');

      div.setAttribute('style', 'padding: 8px 16px');
      label.innerText = `${i.key}:`;
      value.innerText = '';
      value.setAttribute('id', this.getTextDomID(i.key));

      div.appendChild(label);
      div.appendChild(value);
      dom.appendChild(div);
    });

    this.container.appendChild(dom);
  }

  public exportData() {
    return [this.textList, this.basicImgInfo];
  }

  public destroyCanvas() {
    super.destroyCanvas();
    if (this.textValueContainer) {
      this.container.removeChild(this.textValueContainer);
    }
  }

  public onKeyDown(e: KeyboardEvent) {
    super.onKeyDown(e);

    if (e.keyCode === EKeyCode.Z) {
      this.toggleTextContainerVisible();
    }
  }

  /** 切换文本区域的显示 */
  public toggleTextContainerVisible(isVisible?: boolean) {
    if (this.textValueContainer) {
      const display = (isVisible !== undefined ? !isVisible : this.textValueContainer.style.display === 'block')
        ? 'none'
        : 'block';
      this.textValueContainer.style.display = display;
    }
  }
}

export default TextToolOperation;
