import React from 'react';
import { Slider } from 'antd';
import { IPointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import useAnnotatedBoxStore from '@/store/annotatedBox';
import { i18n } from '@labelbee/lb-utils';
import styles from './index.module.scss';

const marks = {
  0.5: 0.5,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
};

const RectRotateSensitivitySlider = () => {
  const state = useAnnotatedBoxStore();
  const ptCtx = state.ptCtx as IPointCloudContext;

  const handleSliderChange = (value: number) => {
    ptCtx.setRectRotateSensitivity(value); // 假设setRectRotateSensitivity是用于更新旋转灵敏度的方法
  };

  return (
    <div className={styles.rectRotateSensitivitySlider}>
      <div className={styles.title}>{i18n.t('RotationAngleSensitivity')}</div>
      <div className='toolStyle'>
        <div id='style-rectRotateSensitivity'>
          <Slider
            min={1}
            max={5}
            step={1}
            value={ptCtx.rectRotateSensitivity}
            onChange={handleSliderChange}
            marks={marks}
          />
        </div>
      </div>
    </div>
  );
};

export default RectRotateSensitivitySlider;
