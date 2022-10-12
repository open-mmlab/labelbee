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
  tips?: string;
  path?: string;
}

const AnnotationTips = ({ path, tips }: IProps) => {
  if (!path && !tips) {
    return null;
  }

  return (
    <div className={`${prefix}-tips`}>
      <Tooltip placement='bottomRight' title={tips}>
        <span className={`${prefix}-tips__leftContent`} title={tips}>
          {tips}
        </span>
      </Tooltip>
      <Tooltip placement='bottomRight' title={path}>
        <span className={`${prefix}-tips__path`}>{path}</span>
      </Tooltip>
    </div>
  );
};

export default AnnotationTips;
