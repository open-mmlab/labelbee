import React from 'react';
import { getClassName } from '@/utils/dom';
import {
  CaretRightOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  PauseOutlined,
} from '@ant-design/icons';
import { VideoPlayerCtx } from '../..';
import { Pagination } from '@/views/MainView/toolFooter/Pagination';
import hotkey from '@/assets/annotation/video/icon_keyboard_h.svg';
import ToolHotKey from '@/views/MainView/toolFooter/FooterTips/ToolHotKey';
import { useTranslation } from 'react-i18next';
import { decimalReserved } from '../../utils';
import { cTool } from '@labelbee/lb-annotation';
const { EVideoToolName } = cTool;

/**
 * Format video time to display
 * Such as 61.9 => 01:01:9
 * @param {Number} time
 * @returns {String} displayTime (min:sec:mircoSec)
 */
const videoTimeFormat = (time: number) => {
  const min = Math.floor(time / 60);
  const sec = ~~(time % 60).toFixed();
  const minSec = (time * 10).toString().split('').pop();
  const fillZero = (num: number) => (num < 10 ? `0${num}` : num);
  return `${fillZero(min)}:${fillZero(sec)}:${minSec}`;
};

const VideoProgress = () => {
  const { currentTime, duration, buffered, setCurrentTime } = React.useContext(VideoPlayerCtx);
  const progressRef = React.useRef<HTMLDivElement>(null);
  const bufferLoadedPercent = `${decimalReserved((buffered / duration) * 100, 1)}%`;
  const playedPercent = `${decimalReserved((currentTime / duration) * 100, 1)}%`;
  const toCurrentTime = (event: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const offsetX = event.clientX;
      const width = progressRef.current.clientWidth;
      const toTime = decimalReserved((offsetX / width) * duration, 1);
      setCurrentTime(toTime);
    }
  };

  return (
    <div
      className={getClassName('video-progress')}
      ref={progressRef}
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        toCurrentTime(event);
      }}
    >
      <div className={getClassName('video-slider')}>
        <div className={getClassName('video-slider', 'played')} style={{ width: playedPercent }} />
        <div
          className={getClassName('video-slider', 'loaded')}
          style={{ width: bufferLoadedPercent }}
        />
        <div className={getClassName('video-slider', 'played')} style={{ width: playedPercent }} />
      </div>

      <div className={getClassName('video-slider-bar')} style={{ left: playedPercent }} />
    </div>
  );
};

const VideoSpeedButton = () => {
  const { updateNextPlaybackRate, playbackRate } = React.useContext(VideoPlayerCtx);
  const { t } = useTranslation();

  return (
    <span className={getClassName('video-controller', 'speed')}>
      <span>{t('Speed')}</span>
      <span className={getClassName('video-controller', 'speedNum')}>{`${playbackRate}x`}</span>
      <span className={getClassName('video-controller', 'speedButton')}>
        <CaretUpOutlined
          onClick={() => {
            updateNextPlaybackRate();
          }}
        />
        <CaretDownOutlined
          onClick={() => {
            updateNextPlaybackRate(false);
          }}
        />
      </span>
    </span>
  );
};

const VideoHotKeys = () => {
  const { t } = useTranslation();
  return (
    <ToolHotKey
      title={
        <span className={getClassName('video-controller', 'hotkey')}>
          <img src={hotkey} />
          {t('Hotkeys')}
        </span>
      }
      style={{}}
      toolName={EVideoToolName.VideoTagTool}
    />
  );
};

const VideoPageChange = () => {
  const { imgIndex, imgList, pageBackward, pageJump, pageForward } =
    React.useContext(VideoPlayerCtx);

  return (
    <Pagination
      isVideo={true}
      pageBackward={pageBackward}
      imgIndex={imgIndex}
      pageJump={pageJump}
      totalPage={imgList.length}
      pageForward={pageForward}
      footerCls={getClassName('video-controller')}
    />
  );
};

const VideoTime = () => {
  const { currentTime, duration } = React.useContext(VideoPlayerCtx);
  const remained10x = duration * 10 - currentTime * 10;
  const remaingTime = (remained10x > 0 ? remained10x : 0) / 10;

  return (
    <div className={getClassName('video-controller', 'time')}>
      {`${videoTimeFormat(currentTime)} / -${videoTimeFormat(remaingTime)}`}
    </div>
  );
};

const VideoController = () => {
  const { playPause, isPlay } = React.useContext(VideoPlayerCtx);

  return (
    <div className={getClassName('video-controller', 'wrapper')}>
      <VideoProgress />
      <div className={getClassName('video-controller')}>
        <span
          onClick={() => {
            playPause();
          }}
          className={getClassName('video-controller', 'playButton')}
        >
          {isPlay ? <PauseOutlined /> : <CaretRightOutlined />}
        </span>
        <VideoTime />
        <VideoSpeedButton />
        <div className={getClassName('video-controller', 'holder')} />
        <VideoPageChange />
        <VideoHotKeys />
      </div>
    </div>
  );
};

export default VideoController;
