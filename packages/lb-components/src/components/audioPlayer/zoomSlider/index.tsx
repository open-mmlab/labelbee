import React, { useEffect } from 'react';
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { Slider } from 'antd';
import { precisionAdd, precisionMinus } from '@/utils/audio';
import { cKeyCode } from '@labelbee/lb-annotation';

import { useLatest } from 'ahooks';

import styles from './index.module.scss';
import { useTranslation } from 'react-i18next';

const EKeyCode = cKeyCode.default

// 建议用户裁剪音频到10分钟以下送标
export const audioZoomInfo = {
  min: 1,
  max: 150,
  ratio: 1,
};

interface IZoomSliderProps {
  /** 缩放时调用的方法，需要在外部控制最大值和最小值 */
  onChange: (val: number) => void;
  zoom: number;
}

const ZoomSlider = (props: IZoomSliderProps) => {
  const { onChange, zoom } = props;
  const { t } = useTranslation();
  const zoomRef = useLatest(zoom);

  const changeHandler = (newValue: number) => {
    onChange(newValue);
  };

  const iconStyle = {
    fontSize: 14,
    margin: `0 8px`,
    cursor: 'pointer',
  };

  const zoomIn = () => {
    const nextZoom = precisionAdd(zoomRef.current, audioZoomInfo.ratio);
    changeHandler(nextZoom);
  };

  const zoomOut = () => {
    const nextZoom = precisionMinus(zoomRef.current, audioZoomInfo.ratio);
    changeHandler(nextZoom);
  };

  const keyDownEvents = (e: KeyboardEvent) => {
    switch (e.keyCode) {
      case EKeyCode.I:
        if (e.ctrlKey) {
          zoomIn();
        }
        break;
      case EKeyCode.O:
        if (e.ctrlKey) {
          e.preventDefault();
          zoomOut();
        }
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', keyDownEvents);
    return () => {
      document.removeEventListener('keydown', keyDownEvents);
    };
  }, []);

  return (
    <div className={styles.sliderContainer}>
      <div>{t('Scale')}</div>
      <ZoomOutOutlined style={iconStyle} onClick={zoomOut} />
      <div
        style={{
          width: 120,
        }}
      >
        <Slider
          min={audioZoomInfo.min}
          max={audioZoomInfo.max}
          step={audioZoomInfo.ratio}
          onChange={changeHandler}
          value={zoom}
        />
      </div>
      <ZoomInOutlined style={iconStyle} onClick={zoomIn} />
    </div>
  );
};

export default ZoomSlider;
