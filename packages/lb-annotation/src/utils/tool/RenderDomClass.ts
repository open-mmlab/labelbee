/**
 * 渲染 DOM 类
 */

import { IBasicText } from '@labelbee/lb-utils';
import DrawUtils from '@/utils/tool/DrawUtils';
import StyleUtils from './StyleUtils';

interface IProps {
  container: HTMLElement; // 当前结构绑定 container
  height: number;
}

export default class RenderDomClass {
  private _domMap: Map<string, HTMLElement> = new Map();

  private _container: HTMLElement;

  private _height: number;

  constructor(props: IProps) {
    this._container = props.container;
    this._height = props.height;
  }

  public wheelChange(e: any) {
    // 禁止外层滚轮操作
    e.stopPropagation();
  }

  /**
   * 清除当前渲染的标签
   */
  public clearTag(id: string) {
    const parentNode = this._container;
    const oldDom = window.self.document.getElementById(id);
    if (oldDom && parentNode && parentNode.contains(oldDom)) {
      oldDom.removeEventListener('wheel', this.wheelChange);
      parentNode?.removeChild(oldDom);
    }
  }

  /**
   * 对比当前内容和后续内容的区别
   */
  public render(annotations: IBasicText[]) {
    const oldKeys = Array.from(this._domMap.keys());
    const newKeys = annotations.map((v) => v.id);

    annotations.forEach((v) => {
      const { text, textMaxWidth, color = 'white', background = 'rgba(0, 0, 0, 0.6)', style } = v;

      if (this._domMap.has(v.id)) {
        // 更改当前 dom 的信息
        const dom = this._domMap.get(v.id);

        if (dom) {
          dom.innerHTML = text;
        }
      } else {
        // 创建 DOM 信息
        const dom = DrawUtils.drawTagByDom(this._container, text, v.id);

        if (dom) {
          dom.setAttribute(
            'style',
            `
              position: absolute;
              top: 0;
              right: 0;
              z-index: 20;
              padding: 8px 20px;
              font-size: 15px;
              max-width: ${textMaxWidth}px;
              color: ${color};
              text-align: left;
              line-height: 32px;
              word-break: break-all;
              white-space: pre-wrap;
              background: ${background};
              opacity: 0.9;
              max-height: ${this._height * 0.8}px;
              overflow-y: scroll;
              clear: both;
              ${StyleUtils.getStyle2String(style)}
            `,
          );
          dom.addEventListener('wheel', this.wheelChange);

          this._domMap.set(v.id, dom);
        }
      }
    });

    oldKeys.forEach((key: string) => {
      if (newKeys.indexOf(key) === -1) {
        // 不存在清除
        this.clearTag(key);
        this._domMap.delete(key);
      }
    });
  }
}
