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
        <i
          className={styles.cutButton}
          onClick={() => {
            toggleClipStatus?.();
          }}
          style={{ backgroundImage: CutIconSvg }}
        />
        截取
      </span>
      <span className={styles.buttonWrapper}>
        <i
          className={styles.localButton}
          onClick={addTime}
          style={{ backgroundImage: TimeIconSvg }}
        />
        标时间点
      </span>
    </div>
  );
};

export default VideoClipToolHotkey;
