import { COLORS_ARRAY, NULL_COLOR } from '@/data/Style';
import { ColorTag } from '@/components/colorTag';
import { Radio } from 'antd/es';
import React from 'react';

export const ATTRIBUTE_COLORS = [NULL_COLOR].concat(COLORS_ARRAY);

interface IProps {
  list: Array<{
    label: string;
    value: string;
  }>;
  selectedAttribute: string;
  attributeChanged: (v: string) => void;
  forbidDefault?: boolean;
  forbidColor?: boolean;
  noHeightLimit?: boolean;
  num?: number;
}

const AttributeList = React.forwardRef((props: IProps, ref) => {
  const radioRef = React.useRef<any>();

  const list = props.list || [];

  let NEW_ATTRIBUTE_COLORS = [...ATTRIBUTE_COLORS];

  // 去除默认的颜色
  if (props.forbidDefault === true) {
    NEW_ATTRIBUTE_COLORS = NEW_ATTRIBUTE_COLORS.slice(1);
  }

  let className = 'sensebee-radio-group';
  if (props.noHeightLimit) {
    className = 'sensebee-radio-group-no-limit-height';
  }

  return (
    <div className={className}>
      <Radio.Group
        name="radiogroup"
        defaultValue={props?.selectedAttribute}
        value={props?.selectedAttribute}
        onChange={(e) => props.attributeChanged(e.target.value)}
        ref={ref as any}
      >
        {list.map((i: any, index: number) => {
          let hotKey: number | string = props?.num ?? index;

          if (props.forbidDefault === true) {
            // 禁止 default 将从 1 开始
            hotKey++;
          }

          // 超出范围无法展示
          if (!(typeof hotKey === 'number' && hotKey <= 9 && hotKey >= 0)) {
            hotKey = '-';
          }

          return (
            <Radio
              value={i.value}
              ref={radioRef}
              key={index}
            >
              <span className="sensebee-radio-label" title={i.label}>
                {!props?.forbidColor && (
                  <ColorTag
                    color={
                      index > 8 && !props.forbidDefault
                        ? COLORS_ARRAY[(index - 1) % COLORS_ARRAY.length]
                        : NEW_ATTRIBUTE_COLORS[
                          index % NEW_ATTRIBUTE_COLORS.length
                        ]
                    }
                    style={{ marginRight: '8px' }}
                  />
                )}
                {i.label}
              </span>
              <span className="sensebee-radio-num">{hotKey}</span>
            </Radio>
          );
        })}
      </Radio.Group>
    </div>
  );
});

export default AttributeList;
