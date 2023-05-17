import React from 'react';
import { getClassName } from '@/utils/dom';
import { Slider } from 'antd';

interface IProps {
  onChange: (size: number) => void;
}

const PointCloudSizeSlider = ({ onChange }: IProps) => {
  return (
    <span className={getClassName('point-cloud-container', 'slider-container')}>
      <span className={getClassName('point-cloud-container', 'slider-container', 'circle')} />
      <span className={getClassName('point-cloud-container', 'slider-container', 'slider')}>
        <Slider onChange={onChange} min={1} max={8} />
      </span>
      <span
        className={getClassName('point-cloud-container', 'slider-container', 'circle')}
        style={{ width: '10px', height: '10px' }}
      />
    </span>
  );
};

export default PointCloudSizeSlider;
