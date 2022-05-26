import React from 'react';
import VideoController from './components/controller';
import { getClassName } from '@/utils/dom';
import { cKeyCode } from '@labelbee/lb-annotation';

const EKeyCode = cKeyCode.default;

const videoSrc =
  'https://sensebee.oss-accelerate.aliyuncs.com/Development%2F6629%2F1.mp4?Expires=1653562799&OSSAccessKeyId=LTAI4Fcnhge5ysEwVNGjQCpU&Signature=qVwAv2MWHPswT1ETFAuBeEhF%2Fuc%3D';

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
}>({
  isPlay: false,
  playPause: () => {},
  updateNextPlaybackRate: () => {},
  playbackRate: 1,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  setCurrentTime: () => {},
});

const PER_INTERVAL = 50;
const PER_FORWARD = 0.1;
const PLAYBACK_RATES = [0.5, 1, 1.5, 2, 4, 6, 8, 16];

interface IProps {}
interface IState {
  playbackRate: number;
  currentTime: number;
  isPlay: boolean;
  duration: number;
  buffered: number;
}

export const decimalReserved = (num: number, places: number = 2) =>
  typeof num === 'number' ? parseFloat(num.toFixed(places)) : num;

class VideoPlayer extends React.Component<IProps, IState> {
  public videoRef?: React.RefObject<HTMLVideoElement>;
  public timeInterval?: number;

  constructor(props: IProps) {
    super(props);
    this.state = {
      playbackRate: 1,
      currentTime: 0,
      isPlay: false,
      duration: 0,
      buffered: 0,
    };
    this.videoRef = React.createRef();
  }

  get videoElm() {
    return this.videoRef?.current;
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

  public updateNextPlaybackRate = (isForward: boolean = true) => {
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

  public keyUpEvents = (event: KeyboardEvent) => {
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
    this.setState(
      {
        isPlay: false,
      },
      this.onVideoStopped,
    );
  };

  public onVideoStopped = () => {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = undefined;
    }
  };

  public onVideoStart = () => {
    this.timeInterval = window.setInterval(() => {
      if (this.videoElm) {
        const buffered = this.videoElm?.buffered.end(0);

        this.setState({
          currentTime: decimalReserved(this.videoElm?.currentTime, 1),
          buffered,
        });
      }
    }, PER_INTERVAL);
  };

  public resetVideoData = () => {
    console.log(11);
    this.setState({
      currentTime: 0,
      buffered: 0,
    });
  };

  public setDuration = () => {
    if (this.videoElm) {
      this.setState({
        duration: decimalReserved(this.videoElm?.duration, 1),
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

  public componentDidMount() {
    window.addEventListener('keyup', this.keyUpEvents);
  }

  public componentWillMount() {
    window.removeEventListener('keyup', this.keyUpEvents);
  }

  public shouldComponentUpdate() {
    return true;
  }

  public render() {
    const { isPlay, playbackRate, currentTime, duration, buffered } = this.state;

    const {
      playPause,
      updateNextPlaybackRate,
      onPause,
      onPlay,
      resetVideoData,
      setDuration,
      setCurrentTime,
    } = this;

    return (
      <VideoPlayerCtx.Provider
        value={{
          videoRef: this.videoRef,
          isPlay,
          playPause,
          updateNextPlaybackRate,
          playbackRate,
          currentTime,
          duration,
          buffered,
          setCurrentTime,
        }}
      >
        <div className={getClassName('video-wrapper')}>
          <video
            ref={this.videoRef}
            className={getClassName('video')}
            src={videoSrc}
            onPause={onPause}
            onPlay={onPlay}
            onLoadedMetadata={resetVideoData}
            onError={resetVideoData}
            onDurationChange={setDuration}
            onLoadedData={() => {
              console.log(123);
            }}
          />
          <VideoController />
        </div>
      </VideoPlayerCtx.Provider>
    );
  }
}

export default VideoPlayer;
