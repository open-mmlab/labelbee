import { componentCls } from '@/constant';
import React from 'react';

interface IProps {
  text: string; // icon 文本
  Icon: any;
  iconChildren: React.ReactNode;
  marginLeft?: number;
}

const IconWithText = (props: IProps) => {
  const { Icon, text, iconChildren, ...otherProps } = props;

  const marginLeft = props.marginLeft === undefined ? 30 : props.marginLeft;

  return (
    <div {...otherProps} className={componentCls} >
      <div className={`${componentCls}__iconWithText`} style={{ marginLeft }}>
        <div className='iconGroup'>
          <Icon className='icon' />
          {iconChildren}
        </div>

        <span className='name'>{text}</span>
      </div>
    </div>
  );
};

export default IconWithText;
