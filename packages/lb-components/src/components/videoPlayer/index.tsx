/**
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @file Implement video player, including mouse and keyboard event
 * @date 2022-06-02
 */

import React from 'react';
import VideoController from './components/controller';
import VideoTrack from '@/components/videoAnnotate/videoClipTool/components/videoTrack'
import { getClassName } from '@/utils/dom';
import { cKeyCode } from '@labelbee/lb-annotation';
import { IFileItem } from '@/types/data';
import { decimalReserved } from './utils';
import FileException from '../fileException';

const EKeyCode = cKeyCode.default;

export const PLAYER_CONTROL_BAR_HEIGHT = 60;

export const VideoPlayerCtx = React.createContext<{
  videoRef?: React.RefObject<HTMLVideoElement> | null;
  isPlay: boolean;
  playPause: () => void;
  updateNextPlaybackRate: (isForward?: boolean) => void;
  setCurrentTime: (time: number) => void;
  playbackRate: number;
  currentTime: number;
  duration: number;
  buffered: number;
  imgList: IFileItem[];
  imgIndex: number;
  pageBackward: () => void;
  pageJump: (page: string) => void;
  pageForward: () => void;
  addTime?: () => void;
  toggleClipStatus?: () => void;
}>({
  isPlay: false,
  playPause: () => {},
  updateNextPlaybackRate: () => {},
  playbackRate: 1,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  setCurrentTime: () => {},
  imgList: [],
  imgIndex: -1,
  pageBackward: () => {},
  pageJump: (page: string) => {},
  pageForward: () => {},
  addTime: () => {},
  toggleClipStatus: () => {},
});

const PER_INTERVAL = 50;
const PER_FORWARD = 0.1;
const PLAYBACK_RATES = [0.5, 1, 1.5, 2, 4, 6, 8, 16];

interface IVideoPlayerProps {
  imgList: IFileItem[];
  imgIndex: number;
  pageBackward: () => void;
  pageJump: (page: string) => void;
  pageForward: () => void;
  valid: boolean;
  setVideoRef?: (video: HTMLVideoElement) => void;
  showVideoTrack?: boolean;
  onTrackResize?: any;
  footer?: any;
  dataLoaded?: (totalTime: number) => void;
  addTime?: () => void;
  toggleClipStatus?: () => void;
  drawLayerSlot?: any;
}

interface IVideoPlayerState {
  playbackRate: number;
  currentTime: number;
  isPlay: boolean;
  duration: number;
  buffered: number;
  error: boolean;
}

export class VideoPlayer extends React.Component<IVideoPlayerProps, IVideoPlayerState> {
  public videoRef?: React.RefObject<HTMLVideoElement>;
  public timeInterval?: number;

  public constructor(props: IVideoPlayerProps) {
    super(props);
    this.state = {
      playbackRate: 1,
      currentTime: 0,
      isPlay: false,
      duration: 0,
      buffered: 0,
      error: false,
    };
    this.videoRef = React.createRef();
  }

  public get videoElm() {
    return this.videoRef?.current;
  }

  public get videoSrc() {
    const { imgIndex, imgList } = this.props;
    return imgIndex > -1 ? imgList[imgIndex]?.url ?? '' : '';
  }

  public changePlaybackPate = (playbackRate: number) => {
    if (this.videoElm) {
      this.videoElm.playbackRate = playbackRate;
      this.setState({
        playbackRate,
      });
    }
  };

  public playPause = () => {
    if (this.videoElm?.paused) {
      this.videoElm?.play();
    } else {
      this.videoElm?.pause();
    }
  };

  public updateNextPlaybackRate = (isForward = true) => {
    const idx = PLAYBACK_RATES.findIndex((r) => r === this.state.playbackRate);
    let nextIdx = isForward ? Math.min(idx + 1, PLAYBACK_RATES.length - 1) : Math.max(idx - 1, 0);
    this.changePlaybackPate(PLAYBACK_RATES[nextIdx]);
  };

  public fastForward = () => {
    if (this.videoElm) {
      this.setCurrentTime(this.videoElm.currentTime + PER_FORWARD);
    }
  };

  public rewind = () => {
    if (this.videoElm) {
      this.setCurrentTime(this.videoElm.currentTime - PER_FORWARD);
    }
  };

  /**
   * Implement Video's keydown
   * Play / Pause           -   Space
   * Rewind / FastForward   -   ⬅️  /  ➡️
   * Speed                  -   ⬆️  /  ⬇
   * @param event
   */
  public keydown = (event: KeyboardEvent) => {
    if (event.keyCode === EKeyCode.Space) {
      event.preventDefault();
      this.playPause();
    }

    if (event.keyCode === EKeyCode.Up) {
      event.preventDefault();
      this.updateNextPlaybackRate();
    }

    if (event.keyCode === EKeyCode.Down) {
      event.preventDefault();
      this.updateNextPlaybackRate(false);
    }

    if (event.keyCode === EKeyCode.Left) {
      event.preventDefault();
      this.rewind();
    }

    if (event.keyCode === EKeyCode.Right) {
      event.preventDefault();
      this.fastForward();
    }
  };

  public onPlay = () => {
    this.setState(
      {
        isPlay: true,
      },
      this.onVideoStart,
    );
  };

  public onPause = () => {
    this.onVideoStopped();
  };

  public onTimeUpdate = () => {
    if (this.videoElm) {
      this.setState({
        currentTime: decimalReserved(this.videoElm?.currentTime, 1),
      })
    }
  }

  public onVideoStopped = () => {
    this.setState({
      isPlay: false,
    });

    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = undefined;
    }

    /** Due to speedrate can less than PER_INTERVAL, it need to set current time after stopped */
    if (this.videoElm) {
      this.setCurrentTime(this.videoElm.currentTime);
    }
  };

  public onVideoStart = () => {
    this.timeInterval = window.setInterval(() => {
      if (this.videoElm) {
        try {
          if (this.videoElm?.buffered.length > 0) {
            const buffered = this.videoElm?.buffered.end(0);

            this.setState({
              currentTime: decimalReserved(this.videoElm?.currentTime, 1),
              buffered,
            });
          }
        } catch (error) {
          console.error(error);
        }
      }
    }, PER_INTERVAL);
  };

  public resetVideoData = () => {
    this.setState({
      currentTime: 0,
      buffered: 0,
      error: false,
      isPlay: false,
    });

    if (this.videoElm) {
      this.videoElm.playbackRate = this.state.playbackRate;
    }

    this.onVideoStopped();
  };

  public setDuration = () => {
    if (this.videoElm) {
      const duration = decimalReserved(this.videoElm?.duration, 1);
      this.props.dataLoaded?.(duration)
      this.setState({
        duration,
      });
    }
  };

  public setCurrentTime = (currentTime: number) => {
    if (this.videoElm) {
      this.videoElm.currentTime = currentTime;
      this.setState({
        currentTime,
      });
    }
  };

  public reload = () => {
    this.videoElm?.load();
  };

  public onError = () => {
    this.resetVideoData();
    this.setState({ error: true });
  };

  public componentDidMount() {
    window.addEventListener('keydown', this.keydown);
    if (this.videoRef?.current && this.props.setVideoRef) {
      this.props.setVideoRef(this.videoRef?.current as HTMLVideoElement);
    }
  }

  public componentWillUnmount() {
    window.removeEventListener('keydown', this.keydown);
  }

  public render() {
    const { isPlay, playbackRate, currentTime, duration, buffered, error } = this.state;
    const { imgList, imgIndex, pageBackward, pageJump, pageForward, valid, footer, drawLayerSlot } = this.props;

    const remainingTime = isNaN(duration) ? 0 : Math.max(decimalReserved(duration, 1) - currentTime, 0);
    const {
      playPause,
      updateNextPlaybackRate,
      onPause,
      onPlay,
      onTimeUpdate,
      resetVideoData,
      setDuration,
      setCurrentTime,
      onError,
      videoRef,
      videoSrc,
    } = this;

    return (
      <VideoPlayerCtx.Provider
        // eslint-disable-next-line react/jsx-no-constructed-context-values
        value={{
          videoRef: this.videoRef,
          addTime: this.props.addTime,
          toggleClipStatus: this.props.toggleClipStatus,
          isPlay,
          playPause,
          updateNextPlaybackRate,
          playbackRate,
          currentTime,
          duration,
          buffered,
          setCurrentTime,
          imgIndex,
          imgList,
          pageBackward,
          pageJump,
          pageForward,
        }}
      >
        <>
          {drawLayerSlot?.({ currentTime, remainingTime, zoom: 1, currentPos: { x: 0, y: 0 } })}
          <div className={getClassName('video-wrapper')}>
            <div className={getClassName('video-container')}>
              <video
                ref={videoRef}
                className={getClassName(this.props.showVideoTrack ? 'video-track' : 'video')}
                src={videoSrc}
                onPause={onPause}
                onPlay={onPlay}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={resetVideoData}
                onError={onError}
                onDurationChange={setDuration}
                width='100%'
                height='100%'
                onClick={playPause}
              />
              {
                this.props.showVideoTrack && <VideoTrack
                  currentTime={currentTime}
                  onTrackResize={this.props.onTrackResize}
                  onTrackResizeStart={() => {
                    this.videoElm?.pause();
                  }}
                  readonly={false}
                />
              }
              <FileException
                fileType='video'
                errorProps={{
                  reloadImage: this.reload,
                  backgroundColor: '#e2e2e2',
                  ignoreOffsetY: true,
                  isError: error,
                }}
                invalidProps={{
                  isValid: valid,
                }}
              />
            </div>
            <VideoController footer={footer}/>
          </div>
        </>
      </VideoPlayerCtx.Provider>
    );
  }
}

export default VideoPlayer;
