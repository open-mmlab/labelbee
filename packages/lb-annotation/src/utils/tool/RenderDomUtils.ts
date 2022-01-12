import locale from '../../locales';
import { EMessage } from '../../locales/constants';

export default class RenderDomUtils {
  public static renderInvalidPage(container: HTMLElement, size: ISize, lang: string) {
    const invalidDOM = document.createElement('div');
    invalidDOM.setAttribute(
      'style',
      `
        position: absolute;
        left: 0px;
        top: 0px;
        width: ${size.width}px;
        height: ${size.height}px;
        background: rgba(255, 87, 34, 1);
        overflow: hidden;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 30px;
        opacity: 0.7;
        z-index: 30;
      `,
    );
    invalidDOM.innerHTML = locale.getMessagesByLocale(EMessage.InvalidImage, lang);

    container.appendChild(invalidDOM);

    return invalidDOM;
  }
}
