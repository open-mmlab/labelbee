import React from 'react';
import styles from './index.module.scss';
import CutIconSvg from '@/assets/annotation/video/icon_videoCut.svg'
import TimeIconSvg from '@/assets/annotation/video/icon_timePoint.svg'

const VideoClipToolHotkey = ({
  toggleClipStatus,
  addTime,
}: {
  toggleClipStatus?: () => void;
  addTime?: () => void;
}) => {
  return (
    <div className={styles.clipToolbar}>
      <span className={styles.buttonWrapper}>
        <img
          src={CutIconSvg}
          className={styles.cutButton}
          onClick={() => {
            toggleClipStatus?.();
          }}
        />
        截取
      </span>
      <span className={styles.buttonWrapper}>
        <img
          src={TimeIconSvg}
          className={styles.localButton}
          onClick={addTime}
        />
        标时间点
      </span>
    </div>
  );
};

export default VideoClipToolHotkey;
