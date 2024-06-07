/*
 * @file Provides a slider component for adjusting the rotation angle sensitivity in a point cloud context.
 *       The slider allows values between 1 and 5, with marks at 0.5, 1, 2, 3, and 4.
 *       The current sensitivity value is managed via the PointCloudContext.
 * @author Vincent He <hexing@senseauto.com>
 * @date 2024-06-05
 */
import React from 'react';
import { Slider } from 'antd';
import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
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
  const ptCtx = React.useContext(PointCloudContext);

  const handleSliderChange = (value: number) => {
    ptCtx.setRectRotateSensitivity(value);
  };

  return (
    <div className={styles.rectRotateSensitivitySlider}>
      <div className={styles.title}>{i18n.t('RotationAngleSensitivity')}</div>
      <div className='toolStyle'>
        <div id='style-rectRotateSensitivity'>
          <Slider
            min={0.5}
            max={4}
            step={null}
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
