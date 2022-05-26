import React, { useState, MouseEventHandler } from 'react';
import { getClassName } from '@/utils/dom';
import {
  CaretRightOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  PauseOutlined,
} from '@ant-design/icons';
import { VideoPlayerCtx, decimalReserved } from '../..';
import { Pagination } from '@/views/MainView/toolFooter/Pagination';
import hotkey from '@/assets/annotation/video/icon_keyboard_h.svg';

/**
 * 视频音频时间格式化, 转化为 min:sec:mircoSec
 * 例如: 61.9 => 01:01:9
 * @param time
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
  const progressRef = React.useRef<HTMLDivElement | null>();
  const bufferLoadedPercent = `${decimalReserved((buffered / duration) * 100, 1)}%`;
  const playedPercent = `${decimalReserved((currentTime / duration) * 100, 1)}%`;
  const toCurrentTime = (event: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const offsetX = event.clientX;
      const width = progressRef.current.clientWidth;
      const toTime = decimalReserved((offsetX / width) * duration, 1);
      setCurrentTime(toTime);
      console.log(event.target, toTime, offsetX);
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

      <div className={getClassName('video-slider-bar')} style={{ left: playedPercent }}></div>
    </div>
  );
};

const VideoSpeedButton = () => {
  const { updateNextPlaybackRate, playbackRate } = React.useContext(VideoPlayerCtx);

  return (
    <span className={getClassName('video-controller', 'speed')}>
      <span>倍速</span>
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
  return (
    <span className={getClassName('video-controller', 'hotkey')}>
      <img src={hotkey} />
      快捷键
    </span>
  );
};

const VideoPageChange = () => {
  return (
    <Pagination
      isVideo={true}
      pageBackward={() => {}}
      imgIndex={1}
      pageJump={() => {}}
      totalPage={20}
      pageForward={() => {}}
      footerCls={getClassName('video-controller')}
    />
  );
};

const VideoTime = () => {
  const { currentTime, duration } = React.useContext(VideoPlayerCtx);
  const remaingTime = (duration * 10 - currentTime * 10) / 10;

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
