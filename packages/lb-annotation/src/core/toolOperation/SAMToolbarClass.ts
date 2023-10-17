/**
 * @file SAM交互工具栏，显示在框的左上方，提供增加、删减、重置、完成功能
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @date 2023年10月8日
 */

import AxisUtils from '@/utils/tool/AxisUtils';
import StyleUtils from '@/utils/tool/StyleUtils';

const TOOLBAR_SIZE = {
  height: 38,
};

// 距离框左上角高出的距离
const TOOLBAR_TOP_OFFSET = 8;

const BUTTON_GROUP_STYLE = {
  height: '22px',
  border: '1px solid #666fff',
  color: '#666fff',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  borderRadius: '4px',
  padding: '0 8px',
};

export default class SAMToolbarClass {
  private container: HTMLElement;

  private disabled: boolean;

  private _toolbarDOM?: HTMLElement;

  private _radioGroupDOM?: HTMLElement;

  private _buttonGroupDOM?: HTMLElement;

  private i18n: any;

  private onToggleClickType: (type: 'add' | 'remove') => void;

  private onReset: () => void;

  private onFinish: () => void;

  constructor(props: any) {
    const { container, toggleClickType, finish, reset, i18n } = props;
    this.container = container;
    this.onToggleClickType = toggleClickType;
    this.onFinish = finish;
    this.onReset = reset;
    this.disabled = false;
    this.i18n = i18n;
    this._toolbarDOM = this.initToolbarDOM();
    this._radioGroupDOM = this.initRadioGroupDOM();
    this._buttonGroupDOM = this.initButtonGroupDOM();
    this.appendToContainer();
    this.onClick = this.onClick.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.eventBinding();
    this.onToggle('add');
  }

  public appendToContainer() {
    if (!this._toolbarDOM || !this._radioGroupDOM || !this._buttonGroupDOM) {
      return;
    }
    this.container.appendChild(this._toolbarDOM);
    this._toolbarDOM.appendChild(this._radioGroupDOM);
    this._toolbarDOM.appendChild(this._buttonGroupDOM);
  }

  public clearToolbarDOM() {
    if (this._toolbarDOM && this.container.contains(this._toolbarDOM)) {
      this.eventUnbinding();
      this.container.removeChild(this._toolbarDOM);
    }
  }

  public initToolbarDOM() {
    const _toolbarDOM = document.createElement('div');
    _toolbarDOM.setAttribute('id', 'LABELBEE_SAM_TOOLBAR');
    StyleUtils.setDOMStyle(_toolbarDOM, {
      display: 'flex',
      position: 'absolute',
      fontSize: '14px',
      height: `${TOOLBAR_SIZE.height}px`,
      padding: '0 8px',
      borderRadius: '4px',
      backgroundColor: '#FFFFFF',
      zIndex: '10',
    });
    return _toolbarDOM;
  }

  public initRadioGroupDOM() {
    const RADIO_GROUP = [
      {
        text: `${this.i18n.t('AddPoints')}(+)`,
        value: 'add',
      },
      {
        text: `${this.i18n.t('RemovePoints')}(-)`,
        value: 'remove',
      },
    ];

    const radioGroupDOM = document.createElement('div');
    radioGroupDOM.setAttribute('id', 'LABELBEE_SAM_TOOLBAR_RADIO_GROUP');

    StyleUtils.setDOMStyle(radioGroupDOM, {
      height: '100%',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
    });

    let str: string = '';

    RADIO_GROUP.forEach((item) => {
      str += `<label class="ant-radio-wrapper"
      ><span class="ant-radio"
        ><input
          class="ant-radio-input"
          type="radio"
          value="${item.value}"
          checked="" /><span class="ant-radio-inner"></span></span
      ><span data-value="${item.value}">${item.text}</span></label
    >`;
    });

    radioGroupDOM.innerHTML = str;
    return radioGroupDOM;
  }

  public initButtonGroupDOM() {
    const BUTTON_GROUP = [
      {
        text: `${this.i18n.t('Reset')}`,
        value: 'reset',
      },
      {
        text: `${this.i18n.t('Finish')}`,
        value: 'finish',
      },
    ];

    const buttonGroupDOM = document.createElement('div');
    buttonGroupDOM.setAttribute('id', 'LABELBEE_SAM_TOOLBAR_BUTTON_GROUP');

    StyleUtils.setDOMStyle(buttonGroupDOM, {
      height: '100%',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      gap: '8px',
    });

    BUTTON_GROUP.forEach((item) => {
      const dom = document.createElement('div');
      dom.setAttribute('data-value', item.value);
      dom.textContent = item.text;
      const style = { ...BUTTON_GROUP_STYLE };

      if (item.value === 'finish') {
        Object.assign(style, {
          color: 'white',
          backgroundColor: '#666fff',
        });
      }

      StyleUtils.setDOMStyle(dom, style);
      buttonGroupDOM.appendChild(dom);
    });

    return buttonGroupDOM;
  }

  public update(position: { left: number; top: number }) {
    const { left, top } = position;
    if (!this._toolbarDOM) {
      return;
    }
    StyleUtils.setDOMStyle(this._toolbarDOM, {
      left: `${left}px`,
      top: `${top}px`,
    });
  }

  public onClick(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    if (this.disabled) {
      return;
    }

    if (this._radioGroupDOM?.contains(e.target as HTMLElement)) {
      const target = e.target as HTMLElement;
      const value = target.getAttribute('value') || target.getAttribute('data-value');
      if (value) {
        this.onToggleClickType(value as 'add' | 'remove');
      }
      return;
    }

    if (this._buttonGroupDOM?.contains(e.target as HTMLElement)) {
      const target = e.target as HTMLElement;
      const value = target.getAttribute('data-value');

      if (value === 'reset') {
        this.onReset();
      }

      if (value === 'finish') {
        this.onFinish();
      }
    }
  }

  public eventBinding() {
    this._toolbarDOM?.addEventListener('click', this.onClick);
    this._toolbarDOM?.addEventListener('mouseup', this.onMouseUp);
  }

  public onMouseUp(e: MouseEvent) {
    // 防止点击 toolbar 时触发 canvas 的 mouseup 事件
    e.stopPropagation();
    e.preventDefault();
  }

  public eventUnbinding() {
    this._toolbarDOM?.removeEventListener('click', this.onClick);
    this._toolbarDOM?.removeEventListener('mouseup', this.onMouseUp);
  }

  public setDisabled(disabled: boolean) {
    if (!this._toolbarDOM || !this._radioGroupDOM || !this._buttonGroupDOM || disabled === this.disabled) {
      return;
    }

    this.disabled = disabled;

    StyleUtils.setDOMStyle(this._toolbarDOM, {
      filter: disabled ? 'grayscale(100%)' : 'none',
      cursor: disabled ? 'not-allowed' : 'default',
    });

    StyleUtils.setDOMStyle(this._radioGroupDOM, {
      pointerEvents: disabled ? 'none' : 'auto',
    });

    StyleUtils.setDOMStyle(this._buttonGroupDOM, {
      pointerEvents: disabled ? 'none' : 'auto',
    });
  }

  public onToggle(type: 'add' | 'remove') {
    this._radioGroupDOM?.querySelectorAll('label').forEach((item) => {
      const value = item.querySelector('input')?.getAttribute('value');
      item.setAttribute('class', `ant-radio-wrapper${value === type ? ' ant-radio-wrapper-checked' : ''}`);
      item.querySelector('.ant-radio')?.setAttribute('class', `ant-radio${value === type ? ' ant-radio-checked' : ''}`);
    });
  }
}

export const getSAMToolbarOffset = ({
  rect,
  currentPos,
  zoom,
}: {
  rect: IRect;
  currentPos: ICoordinate;
  zoom: number;
}) => {
  const topOffset = TOOLBAR_SIZE.height;

  const coordinate = AxisUtils.getOffsetCoordinate(rect, currentPos, zoom);

  const left = coordinate.x;
  const top = coordinate.y - topOffset - TOOLBAR_TOP_OFFSET;

  return {
    left: left < 0 ? 0 : left,
    top: top < 0 ? 0 : top,
  };
};
