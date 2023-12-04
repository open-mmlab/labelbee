import lockSvg from '@/assets/attributeIcon/icon_eyeLock_a.svg';
import unlockSvg from '@/assets/attributeIcon/icon_eyeLock_h.svg';
import { COLORS_ARRAY, NULL_COLOR } from '@/data/Style';
import { ColorTag } from '@/components/colorTag';
import { Radio } from 'antd/es';
import React, { useState, useEffect } from 'react';
import { Popover, message } from 'antd';
import ColorPalette from '../colorPalette';
import { CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ILimit, IDefaultSize } from '@labelbee/lb-utils';
import LimitPopover from './components/limitPopover';
import _ from 'lodash';
import { CommonToolUtils, MathUtils } from '@labelbee/lb-annotation';

export const ATTRIBUTE_COLORS = [NULL_COLOR].concat(COLORS_ARRAY);

interface IProps {
  list: Array<{
    label: string;
    value: string;
    color?: string;
    limit?: ILimit;
  }>;
  selectedAttribute?: string;
  attributeChanged: (v: string) => void;
  forbidDefault?: boolean;
  forbidColor?: boolean;
  noHeightLimit?: boolean;
  num?: number | string;
  style?: React.CSSProperties;
  enableColorPicker?: boolean;
  updateColorConfig?: (value: string, color: string) => void;
  updateSize?: (size: IDefaultSize) => void;
  attributeLockChange?: (list: any) => void;
  forbidShowLimitPopover?: boolean;
}

const AttributeList = React.forwardRef((props: IProps, ref) => {
  const radioRef = React.useRef<any>();
  const { t } = useTranslation();
  const list = props.list || [];

  const [paletteVisible, setPaletteVisible] = useState<boolean>(false);
  const [editConfigIndex, setEditConfigIndex] = useState<number | undefined>(undefined);
  const [attributeLockList, setAttributeLockList] = useState<any[]>([]);

  let NEW_ATTRIBUTE_COLORS = [...ATTRIBUTE_COLORS];

  // 去除默认的颜色
  if (props.forbidDefault === true) {
    NEW_ATTRIBUTE_COLORS = NEW_ATTRIBUTE_COLORS.slice(1);
  }

  let className = 'sensebee-radio-group';
  if (props.noHeightLimit) {
    className = 'sensebee-radio-group-no-limit-height';
  }

  const keyDown = (e: any) => {
    if (!CommonToolUtils.hotkeyFilter(e) || props?.forbidColor) {
      // 如果为输入框则进行过滤
      return;
    }
    let keyCode = e.keyCode;
    // 文件夹标签工具没有无属性
    if (props.forbidDefault === true) {
      keyCode = keyCode - 1;
    }
    let attributeInfo;

    if (MathUtils.isInRange(e.keyCode, [48, 57])) {
      attributeInfo = props.list[keyCode - 48];
    }

    if (MathUtils.isInRange(e.keyCode, [96, 105])) {
      attributeInfo = props.list[keyCode - 96];
    }
    if (e.shiftKey && attributeInfo) {
      if (!props?.attributeLockChange) {
        // 过滤属性查看事件
        return;
      }
      checkLock(e, attributeInfo);
      e.preventDefault();
      return;
    }

    if (MathUtils.isInRange(e.keyCode, [48, 57]) || MathUtils.isInRange(e.keyCode, [96, 105])) {
      props?.attributeChanged?.(attributeInfo?.value ?? '');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', keyDown);
    return () => window.removeEventListener('keydown', keyDown);
  });

  const changeColor = (value: string, color: string) => {
    if (props.updateColorConfig) {
      props.updateColorConfig(value, color);
    }
  };

  const attributeClick = (e: any, attributeInfo: any) => {
    if (e.shiftKey && props?.attributeLockChange) {
      checkLock(e, attributeInfo);
      return;
    }
    props.attributeChanged(e.target.value);
  };

  const checkLock = (e: any, attributeInfo: any) => {
    if (props?.forbidColor) {
      return;
    }
    const hadLock = attributeLockList.includes(attributeInfo.value);
    let newAttributeLockList = _.cloneDeep(attributeLockList);
    if (hadLock) {
      newAttributeLockList = newAttributeLockList.filter((i) => i !== attributeInfo.value);
    } else {
      newAttributeLockList.push(attributeInfo.value);
    }
    setAttributeLockList(newAttributeLockList);
    props?.attributeLockChange?.(newAttributeLockList);
    if (!hadLock) {
      message.success(t('AttributeLockNotify', { label: attributeInfo.label }))
    }
    e.preventDefault();
  };

  return (
    <div className={className} style={props.style}>
      <Radio.Group
        name='radiogroup'
        defaultValue={props?.selectedAttribute}
        value={props?.selectedAttribute}
        ref={ref as any}
      >
        {list.map((i: any, index: number) => {
          let hotKey: number | string = props?.num ?? index;
          const isChosen = i?.value === props?.selectedAttribute;

          if (props.forbidDefault === true && typeof hotKey === 'number') {
            // 禁止 default 将从 1 开始
            hotKey++;
          }

          // 超出范围无法展示
          if (!(typeof hotKey === 'number' && hotKey <= 9 && hotKey >= 0)) {
            hotKey = '-';
          }

          let color =
            index > 8 && !props.forbidDefault
              ? COLORS_ARRAY[(index - 1) % COLORS_ARRAY.length]
              : NEW_ATTRIBUTE_COLORS[index % NEW_ATTRIBUTE_COLORS.length];

          if (i?.color) {
            color = i.color;
          }

          const { defaultSize, logicalCondition, sizeRange } = i?.limit?.sizeLimit || {};
          // Determine if a scope configuration exists
          const hasLimit =
            i?.limit?.positionLimit || defaultSize || sizeRange || logicalCondition?.length > 0;
          const showLimitPopover = isChosen && hasLimit && props.forbidShowLimitPopover !== true;

          return (
            <Radio value={i.value} ref={radioRef} key={i.label + index} onClick={(e) => attributeClick(e, i)}>
              <span className='sensebee-radio-label' title={i.label}>
                {!props?.forbidColor && (
                  <Popover
                    content={
                      <ColorPalette
                        defaultColor={color}
                        setColor={(color) => changeColor(i.value, color)}
                      />
                    }
                    title={
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span>{t('Palette')}</span>
                        <CloseOutlined onClick={() => setPaletteVisible(false)} />
                      </div>
                    }
                    visible={paletteVisible && editConfigIndex === index}
                    onVisibleChange={(visible: any) => {
                      if (!visible) {
                        return;
                      }
                      setPaletteVisible(visible);
                    }}
                  >
                    <ColorTag
                      color={color}
                      style={{ cursor: 'pointer', marginRight: '8px' }}
                      onClick={() => {
                        if (props?.enableColorPicker) {
                          setEditConfigIndex(index);
                          setPaletteVisible(true);
                        }
                      }}
                    />
                  </Popover>
                )}
                {i.label}
              </span>

              {!props?.forbidColor && props?.attributeLockChange && (
                <img
                  onClick={(e) => checkLock(e, i)}
                  src={attributeLockList.includes(i.value) ? lockSvg : unlockSvg}
                  style={{
                    display: attributeLockList.includes(i.value) ? 'inline-block' : '',
                  }}
                  className='sensebee-radio-icon'
                />
              )}
              {showLimitPopover && <LimitPopover limit={i.limit} updateSize={props?.updateSize} />}
              <span className='sensebee-radio-num'>{hotKey}</span>
            </Radio>
          );
        })}
      </Radio.Group>
    </div>
  );
});

export default AttributeList;
