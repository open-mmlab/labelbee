import { Checkbox } from 'antd/es';
import React from 'react';

interface IProps {
  selectedAttribute: string[];
  attributeChanged: () => void;
  num?: any;
  list?: any[];
}

const CheckboxList = (props: IProps) => {
  const checkboxRef = React.useRef<any>(null);
  const list = props.list || [];
  return (
    <div className="sensebee-checkbox-group">
      <Checkbox.Group
        name="checkboxgroup"
        // defaultValue={props.selectedAttribute}
        value={props.selectedAttribute}
        onChange={() => props.attributeChanged()}
      >
        {list.map((i: any, index: number) => (
          // @ts-ignore
          <Checkbox value={i.value} ref={checkboxRef} onFocus={() => {
              checkboxRef?.current?.blur();
            }}
            key={index}
          >
            <span className="sensebee-checkbox-label" title={i.label}>
              {i.label}
            </span>
            <span className="sensebee-checkbox-num">{props?.num ?? index}</span>
          </Checkbox>
        ))}
      </Checkbox.Group>
    </div>
  );
};

export default CheckboxList;
