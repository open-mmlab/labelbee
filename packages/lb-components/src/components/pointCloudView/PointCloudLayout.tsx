import { getClassName } from '@/utils/dom';
import classNames from 'classnames';
import React from 'react';

export const PointCloudContainer: React.FC<{
  title: string;
  toolbar?: React.ReactElement;
  className?: string;
}> = ({ title, toolbar, children, className }) => {
  console.log(classNames([className, getClassName('point-cloud-container')]));

  return (
    <div className={classNames([className, getClassName('point-cloud-container')])}>
      <div className={getClassName('point-cloud-container', 'header')}>
        <span>{title}</span>

        {toolbar && <span>{toolbar}</span>}
      </div>

      <div>{children}</div>
    </div>
  );
};
