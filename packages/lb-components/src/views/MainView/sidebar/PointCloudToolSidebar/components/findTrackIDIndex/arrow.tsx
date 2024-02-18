/*
 * @file ArrowComponent use antd styles
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @date 2024年2月18日
 */

import React from 'react';
import classNames from 'classnames';

import { ReactComponent as LeftArrowSvg } from '@/assets/annotation/pointCloudTool/leftArrow.svg';
import { ReactComponent as RightArrowSvg } from '@/assets/annotation/pointCloudTool/rightArrow.svg';

interface IArrowProps {
  disabled: boolean;
  onClick: () => void;
  type: 'left' | 'right';
}

const ArrowComponent = (props: IArrowProps) => {
  const { disabled, onClick, type } = props;
  return (
    <li
      className={classNames({
        'ant-pagination-disabled': disabled,
        [`ant-pagination-${type === 'left' ? 'prev' : 'next'}`]: true,
      })}
      onClick={onClick}
    >
      <button className='ant-pagination-item-link' type='button'>
        <span role='img' className={`anticon anticon-${type}`}>
          {type === 'left' ? <LeftArrowSvg /> : <RightArrowSvg />}
        </span>
      </button>
    </li>
  );
};

export default ArrowComponent;
