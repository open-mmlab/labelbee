import { COLORS_ARRAY, NULL_COLOR } from '@/data/Style';
import { ColorTag } from '@/components/colorTag';
import { Radio } from 'antd/es';
import React, { useState } from 'react';
import { Popover } from 'antd';
import ColorPalette from '../colorPalette';
import { CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ILimit, IDefaultSize } from '@labelbee/lb-utils';
import LimitPopover from './components/limitPopover';

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
}

const AttributeList = React.forwardRef((props: IProps, ref) => {
  const radioRef = React.useRef<any>();
  const { t } = useTranslation();
  const list = props.list || [];

  const [paletteVisible, setPaletteVisible] = useState<boolean>(false);
  const [editConfigIndex, setEditConfigIndex] = useState<number | undefined>(undefined);

  let NEW_ATTRIBUTE_COLORS = [...ATTRIBUTE_COLORS];

  // 去除默认的颜色
  if (props.forbidDefault === true) {
    NEW_ATTRIBUTE_COLORS = NEW_ATTRIBUTE_COLORS.slice(1);
  }

  let className = 'sensebee-radio-group';
  if (props.noHeightLimit) {
    className = 'sensebee-radio-group-no-limit-height';
  }

  const changeColor = (value: string, color: string) => {
    if (props.updateColorConfig) {
      props.updateColorConfig(value, color);
    }
  };

  return (
    <div className={className} style={props.style}>
      <Radio.Group
        name='radiogroup'
        defaultValue={props?.selectedAttribute}
        value={props?.selectedAttribute}
        onChange={(e) => props.attributeChanged(e.target.value)}
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
          const showLimitPopover = isChosen && hasLimit;

          return (
            <Radio value={i.value} ref={radioRef} key={i.label + index}>
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
