import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import { CommonToolUtils, cKeyCode } from '@labelbee/lb-annotation';
import { useTranslation } from 'react-i18next';

const EKeyCode = cKeyCode.default

export const VIDEO_PLAYBACK_RATE_SPEED = [0.5, 1, 1.5, 2, 4, 6, 8, 16];
export const AUDIO_PLAYBACK_RATE_SPEED = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export enum EPlayerType {
  Video,
  Audio,
}

enum ESpeedChange {
  Increase,
  Reduce,
}

export const PLAYER_TYPE_RATE_SPEED: { [key in number]: number[] } = {
  [EPlayerType.Video]: VIDEO_PLAYBACK_RATE_SPEED,
  [EPlayerType.Audio]: AUDIO_PLAYBACK_RATE_SPEED,
};
interface IProps {
  onChange: (rate: number) => void;
  playerType: number;
}

const SpeedController = (props: IProps) => {
  const { onChange, playerType } = props;
  const { t } = useTranslation();
  const PLAYBACK_RATE_SPEED = PLAYER_TYPE_RATE_SPEED[playerType];
  const MAX_PLAYBACK_RATE_SPEED = PLAYBACK_RATE_SPEED.slice(-1)[0];
  const MIN_PLAYBACK_RATE_SPEED = PLAYBACK_RATE_SPEED[0];
  const [rate, setRate] = useState(1);
  const setPlaybackRate = (speedChange: ESpeedChange) => {
    const indexChanges = speedChange === ESpeedChange.Increase ? 1 : -1;
    if (indexChanges === 1 && rate === MAX_PLAYBACK_RATE_SPEED) {
      return;
    }
    if (indexChanges === -1 && rate === MIN_PLAYBACK_RATE_SPEED) {
      return;
    }
    const newPlaybackRateIndex = PLAYBACK_RATE_SPEED.findIndex((i) => i === rate) + indexChanges;
    const newPlaybackRate = PLAYBACK_RATE_SPEED[newPlaybackRateIndex];
    setRate(newPlaybackRate);
    onChange(newPlaybackRate);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (!CommonToolUtils.hotkeyFilter(e)) {
      return;
    }
    /* 加速 */
    if (e.keyCode === EKeyCode.Up) {
      setPlaybackRate(ESpeedChange.Increase);
    }

    /* 减速 */
    if (e.keyCode === EKeyCode.Down) {
      setPlaybackRate(ESpeedChange.Reduce);
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });
  return (
    <div className={styles.speedControllerWrap}>
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 12 }}>{t('Speed')}</span>
        {rate}x
      </span>
      <span className={styles.speedController}>
        <CaretUpOutlined onClick={() => setPlaybackRate(ESpeedChange.Increase)} />
        <CaretDownOutlined onClick={() => setPlaybackRate(ESpeedChange.Reduce)} />
      </span>
    </div>
  );
};

export default SpeedController;
