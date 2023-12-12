import React, { useContext, useMemo } from 'react';
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
import VideoClipToolHotkey from '@/components/videoAnnotate/videoClipTool/components/videoClipToolHotkey'
import { VideoClipToolContext } from '@/components/videoAnnotate/videoClipTool/VideoClipToolContext'

/**
 * Format video time to display
 * Such as 61.9 => 01:01:9
 * @param {Number} time
 * @returns {String} displayTime (min:sec:mircoSec)
 */
export const videoTimeFormat = (time: number) => {
  const min = Math.floor(time / 60);
  const sec = ~~(time % 60).toFixed();
  const minSec = (time * 10).toString().split('').pop();
  const fillZero = (num: number) => (num < 10 ? `0${num}` : num);
  return `${fillZero(min)}:${fillZero(sec)}:${minSec}`;
};

export enum EPlayerType {
  Video,
  Audio,
}

const VideoProgress = () => {
  const { currentTime, duration, buffered, setCurrentTime } = React.useContext(VideoPlayerCtx);
  const progressRef = React.useRef<HTMLDivElement>(null);

  const bufferLoadedPercent = useMemo(() => {
    return `${decimalReserved((buffered / duration) * 100, 1)}%`
  }, [buffered, duration]);

  const playedPercent = useMemo(() => {
    return `${decimalReserved((currentTime / duration) * 100, 1)}%`
  }, [currentTime, duration]);

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
  const remainingTime = (remained10x > 0 ? remained10x : 0) / 10;

  return (
    <div className={getClassName('video-controller', 'time')}>
      {`${videoTimeFormat(currentTime)} / -${videoTimeFormat(remainingTime)}`}
    </div>
  );
};

interface IProps {
  footer?: any;
}
const VideoPlay = (props: { isPlay: boolean; playPause: () => void}) => {
  const { playPause, isPlay } = props
  return <span
    onClick={() => {
      playPause();
    }}
    className={getClassName('video-controller', 'playButton')}
  >
    {isPlay ? <PauseOutlined /> : <CaretRightOutlined />}
  </span>
}
const VideoController = (props: IProps) => {
  const { footer } = props
  const { playPause, isPlay, addTime, toggleClipStatus } = React.useContext(VideoPlayerCtx);
  const { result } = useContext(VideoClipToolContext)
  const count = result?.filter((i) => i.end !== null)?.length ?? 0
  const { t } = useTranslation();

  const videoProgress = <VideoProgress/>
  const videoPlayIcon = <VideoPlay playPause={playPause} isPlay={isPlay} />
  const videoTime = <VideoTime />
  const videoSpeed = <VideoSpeedButton />
  const videoPageChange = <VideoPageChange />
  const videoHotKeys = <VideoHotKeys />
  const videoClipHotKey = <VideoClipToolHotkey addTime={addTime} toggleClipStatus={toggleClipStatus} />
  const videoResultCount = <span style={{ margin: '0px 8px', fontSize: 12 }}>{`${t('ItemsOfThisPage')}: ${count}`}</span>

  if (footer) {
    if (typeof footer === 'function') {
      return footer({
        videoProgress,
        videoPlayIcon,
        videoTime,
        videoSpeed,
        videoPageChange,
        videoHotKeys,
        videoClipHotKey,
        videoResultCount
      })
    } else {
      return footer
    }
  }
  return (
    <div className={getClassName('video-controller', 'wrapper')}>
      {videoProgress}
      <div className={getClassName('video-controller')}>
        {videoPlayIcon}
        {videoTime}
        {videoSpeed}
        <div className={getClassName('video-controller', 'holder')} />
        {videoResultCount}
        {videoPageChange}
        {videoHotKeys}
      </div>
    </div>
  );
};

export default VideoController;
