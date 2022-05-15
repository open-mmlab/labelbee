/*
 * Annotation Tips Showing
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-05-11 17:15:30
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-05-12 19:34:32
 */
import React from 'react';
import { Tooltip } from 'antd';
import { prefix } from '@/constant';

interface IProps {
  tips: string;
}

const AnnotationTips = ({ tips }: IProps) => {
  if (!tips) {
    return null;
  }

  return (
    <div className={`${prefix}-tips`}>
      <div className=''>
        <Tooltip placement='bottomRight' title={tips}>
          <span className=''>{tips}</span>
        </Tooltip>
      </div>
    </div>
  );
};

export default AnnotationTips;
