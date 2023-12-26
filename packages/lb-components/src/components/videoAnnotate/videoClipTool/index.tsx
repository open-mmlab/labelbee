import { AttributeUtils, MathUtils, CommonToolUtils, uuid } from '@labelbee/lb-annotation';
import { jsonParser } from '@/utils';
import { precisionAdd, precisionMinus, isImageValue } from '@/utils/audio'
import { message } from 'antd';
import _ from 'lodash';
import React from 'react';
import styles from './index.module.scss';
import { IVideoTimeSlice } from '@labelbee/lb-utils';
import {
  VideoClipToolContextProvider,
} from './VideoClipToolContext';
import {
  EClipStatus,
  EDirection,
  ETimeSliceType,
  PER_SLICE_CHANGE,
  SLICE_MIN_TIME,
} from './constant';
import VideoPlayer  from '@/components/videoPlayer';
import VideoTimeSlicesOverVideo from './components/videoTimeSlicesOverVideo';
import { IVideoAnnotateProps } from '@/components/videoAnnotate';
import ClipIconSvg from '@/assets/annotation/video/icon_videoCutting.svg'
import { decimalReserved } from '@/components/videoPlayer/utils'

interface IVideoClipProps extends IVideoAnnotateProps {
  pageForward: () => void;
  pageJump: (page: string) => void;
  pageBackward: () => void;
  onMounted: (instance: any) => void;
  onUnmounted: () => void;
}

interface IState {
  result: IVideoTimeSlice[];
  selectedAttribute: string;
  textValue: string;
  clipStatus: EClipStatus;
  selectedID: string;
  loading: boolean;
  videoError: boolean;
  remainingTime: number;
  currentTime: number;
  configLoading: boolean; // 动态标签加载配置
  valid: boolean;
}

class VideoClipTool extends React.Component<IVideoClipProps, IState> {
  public get videoUrl() {
    const { imgIndex, imgList } = this.props;
    return imgList[imgIndex]?.url || '';
  }

  public get isClipping() {
    return this.state.clipStatus === EClipStatus.Clipping;
  }

  /** 结果JSON */
  public get resultJSON() {
    const { imgIndex, imgList } = this.props;
    if (imgList.length === 0 || !imgList[imgIndex]) {
      return '[]';
    }
    return imgList[imgIndex].result;
  }

  public get disabled() {
    return !this.state.valid || this.state.videoError;
  }

  public get loading() {
    return (
      this.state.loading ||
      this.state.configLoading
    );
  }

  public get defaultTextAttribute() {
    return AttributeUtils.getTextAttribute(this.state.result, this.props.config.textCheckType);
  }

  public get defaultAttribute() {
    return this.state.selectedAttribute
  }

  public get selectedSliceIndex() {
    return this.state.result.findIndex((i) => i.id === this.state.selectedID);
  }

  public get exportContext() {
    return {
      selectedID: this.state.selectedID,
      result: this.state.result,
      clipStatus: this.state.clipStatus,
      videoPlayer: this.videoPlayer,
      attributeList: this.props.config.attributeList,
      onSelectedTimeSlice: this.onSelectedTimeSlice,
      removeTimeSlice: this.removeTimeSlice,
      updateSelectedSliceTimeProperty: this.updateSelectedSliceTimeProperty,
    }
  }
  public fns: Map<string, any[]> = new Map();
  public videoPlayer?: any;
  public videoNode?: HTMLVideoElement;
  public videoRef?: HTMLVideoElement;

  public throttledUpdateTime = _.throttle(
    (newValue: number) => {
      this.videoPlayer.currentTime = newValue;
    },
    100,
    {
      trailing: true,
    },
  );

  public constructor(props: IVideoClipProps) {
    super(props);
    this.state = {
      result: [],
      selectedAttribute: '',
      textValue: '',
      clipStatus: EClipStatus.Stop,
      selectedID: '',
      loading: false,
      videoError: false,
      remainingTime: 0,
      currentTime: 0,
      configLoading: false,
      valid: true,
    };
  }

  public get valid() {
    return this.state.valid;
  }

  /** 步骤信息 */
  public stepInfo = () => {
    return this.props.stepInfo;
  };

  public componentDidMount() {
    this.setState({
      loading: false,
    });
    this.setResult(false)
    this.props.onMounted(this);
    window.addEventListener('keydown', this.keyDownEvents);
  }

  public componentWillUnmount() {
    this.props.onUnmounted();
    window.removeEventListener('keydown', this.keyDownEvents);
  }


  public shouldComponentUpdate(newProps: any, newState: IState) {
    const indexChanges = newProps.imgIndex - this.props.imgIndex;
    const stepChanges = newProps.step - this.props.step;
    if (indexChanges !== 0 || stepChanges !== 0) {
      this.setResult(true, newProps);

      if (stepChanges !== 0) {
        // 用于视频截取工具跳转到视频截取工具的视频没有二次加载
        this.setState({
          loading: false,
        });
      }
    }
    return true;
  }

  public emitEvent = (event: string) => {
    const listener = this.fns.get(event);
    if (listener) {
      listener.forEach((fn) => {
        if (fn) {
          fn();
        }
      });
    }
  };

  public singleOn(event: string, func: () => void) {
    this.fns.set(event, [func]);
  }

  public on(event: string, func: () => void) {
    this.singleOn(event, func);
  }

  public unbindAll(eventName: string) {
    this.fns.delete(eventName);
  }

  public setValid = (valid: boolean) => {
    this.setState({ valid })
    if (valid === false) {
      this.clearResult()
      this.updateSidebar()
    }
  };

  public updateSidebar = () => {
    this.emitEvent('changeClipSidebar');
  }

  public exportData = () => {
    const duration = this.videoRef?.duration ?? 0;

    return [
      this.state.result.filter((i) => i.end !== null),
      { valid: this.state.valid, duration }
    ];
  }
  /**
   * 微调选中截取片段的开始时间（start）
   * @param changeTime
   */
  public updateSelectedSliceTimeStartByPer = (changeTime: number) => {
    if (this.state.clipStatus === EClipStatus.Clipping) {
      message.info('截取中不支持调整开始时间');
      return;
    }

    if (this.selectedSliceIndex > -1) {
      const duration = this.videoPlayer?.duration ?? 0;
      const { end: currEnd, start: currStart, type } = this.state.result[this.selectedSliceIndex];
      const newStartTime = MathUtils.withinRange(precisionAdd(currStart, changeTime), [
        0,
        precisionMinus(type === ETimeSliceType.Time ? duration : currEnd, PER_SLICE_CHANGE),
      ]);

      this.updateSelectedSliceTimeProperty(newStartTime, 'start');
    }
  };

  /**
   * 微调选中截取片段的最后时间（end）
   * @param changeTime
   */
  public updateSelectedSliceTimeEndByPer = (changeTime: number) => {
    if (this.state.clipStatus === EClipStatus.Clipping) {
      message.info('截取中不支持调整结束时间');
      return;
    }

    if (this.selectedSliceIndex > -1) {
      const timeSlice = this.state.result[this.selectedSliceIndex];
      const duration = this.videoPlayer?.duration ?? 0;

      if (timeSlice.type === ETimeSliceType.Time) {
        message.info('时间点仅支持调整开始时间');
        return;
      }

      const { end: currEnd, start: currStart } = timeSlice;
      const newEndTime = MathUtils.withinRange(precisionAdd(currEnd as number, changeTime), [
        precisionAdd(currStart, PER_SLICE_CHANGE),
        duration,
      ]);

      this.updateSelectedSliceTimeProperty(newEndTime, 'end');
    }
  };

  public updateSelectedSliceTimeProperty = (val: number, key: 'start' | 'end') => {
    if (this.selectedSliceIndex > -1) {
      const { result } = this.state;
      result[this.selectedSliceIndex][key] = val;
      this.setState({
        result: _.cloneDeep(result),
      });
      this.updateSidebar()
    }
  };

  public keyDownEvents = (e: KeyboardEvent) => {
    if (!CommonToolUtils.hotkeyFilter(e)) {
      return;
    }
    const target = e.target as any;
    if (target && target?.tag === 'INPUT' && target?.type === 'radio') {
      e.preventDefault();
    }
    switch (e.key.toLocaleLowerCase()) {
      case 'x':
        this.toggleClipStatus();
        break;
      case 'e':
        this.addTime();
        break;
      case 'escape':
        this.cancelClipped();
        break;
      case '-':
        this.updateSelectedSliceTimeStartByPer(-PER_SLICE_CHANGE);
        break;
      case '=':
        this.updateSelectedSliceTimeStartByPer(PER_SLICE_CHANGE);
        break;
      case '[':
        this.updateSelectedSliceTimeEndByPer(-PER_SLICE_CHANGE);
        break;
      case ']':
        this.updateSelectedSliceTimeEndByPer(PER_SLICE_CHANGE);
        break;
      default:
        break;
    }
  };

  public videoLoaded = (totalTime?: number) => {
    const result = this.resultJSON;
    const existResult = result && !['', '{}'].includes(result);
    const duration = totalTime ? parseFloat(totalTime.toFixed(2)) : 0;
    const payload = {
      loading: false,
    };
    if (!jsonParser(result)?.duration) {
      Object.assign(payload, {
        result: JSON.stringify({ ...jsonParser(result), duration }),
      });
    }
    if (!existResult) {
      Object.assign(payload, {
        result: JSON.stringify({
          width: 0,
          height: 0,
          rotate: 0,
          valid: true,
          duration,
        }),
      });
    }

    this.setState({
      loading: false,
    });
  };

  public setVideoError = (videoError: boolean, errorType: any, curTime: number) => {
    if (videoError) {
      const { clipStatus } = this.state;
      const isClipping = clipStatus === EClipStatus.Clipping;
      if (isClipping) {
        this.toggleClipStatus(curTime);
      }
    }

    this.setState({ videoError, loading: false });
  };

  public clearResult = () => {
    this.setState({
      result: [],
      selectedID: '',
      textValue: '',
    });
    this.updateSidebar()
  };

  /** 取消截取 */
  public cancelClipped = () => {
    const { result, selectedID, clipStatus } = this.state;
    if (clipStatus !== EClipStatus.Clipping) {
      return;
    }
    const timeSliceIndex = result.findIndex((i) => i.id === selectedID);
    if (timeSliceIndex > -1) {
      result.splice(timeSliceIndex, 1);
      this.setState({
        result,
        selectedID: '',
        clipStatus: EClipStatus.Stop,
      });
      this.updateSidebar()
    }
  };

  /**
   * 切换截取状态，如为开启则添加end为null的数据，否则将对应截取片段的时间补全
   * @param curTime
   * @returns
   */
  public toggleClipStatus = (curTime?: number) => {
    if (this.disabled) {
      return;
    }

    const { clipStatus: curClipStatus, selectedAttribute } = this.state;
    const isStopped = curClipStatus !== EClipStatus.Clipping;

    let clipStatus = isStopped ? EClipStatus.Clipping : EClipStatus.Stop;
    let { result, selectedID, textValue } = this.state;
    const newResult = _.cloneDeep(result);
    const currentTime = curTime || this.videoPlayer?.currentTime;
    const duration = this.videoPlayer?.duration;

    if (duration === undefined || currentTime === undefined) {
      return;
    }

    const sliceStart = decimalReserved(currentTime, 2);

    if (isStopped) {
      const id = uuid();
      selectedID = id;
      newResult.push({
        start: sliceStart,
        end: null,
        attribute: selectedAttribute,
        textAttribute: this.defaultTextAttribute,
        duration,
        id,
        type: ETimeSliceType.Period,
      });
      textValue = this.defaultTextAttribute;
    } else {
      const timeSliceIndex = newResult.findIndex((i) => i.id === selectedID);
      const timeSlice = newResult[timeSliceIndex];

      if (timeSlice) {
        const timeLen = currentTime - timeSlice.start;

        if (timeLen < SLICE_MIN_TIME) {
          newResult.splice(timeSliceIndex, 1);
          message.info(`截取片段不能短于${SLICE_MIN_TIME}s`);
          clipStatus = EClipStatus.Stop;
          selectedID = '';
          textValue = '';
        } else {
          newResult[timeSliceIndex].end = decimalReserved(currentTime, 2);
          this.videoPlayer?.pause();
          message.success(`已截取片段${result.length}`);
        }
      }
    }

    this.setState(
      {
        clipStatus,
        result: newResult,
        selectedID,
        textValue,
      }
    );
    this.updateSidebar()
  };

  /** 添加时间点 */
  public addTime = () => {
    if (this.disabled) {
      return;
    }

    const { result, selectedAttribute, selectedID } = this.state;
    const id = uuid();
    const newResult = _.cloneDeep(result);
    const currentTime = this.videoPlayer?.currentTime || 0;
    newResult.push({
      start: currentTime,
      end: currentTime,
      attribute: selectedAttribute,
      textAttribute: this.defaultTextAttribute,
      id,
      type: ETimeSliceType.Time,
      duration: this.videoPlayer?.duration ?? 0,
    });
    const newState = {
      result: newResult,
      selectedID: id,
      textValue: this.defaultTextAttribute,
    } as any;

    const currentSnippet = newResult.find((i) => i.id === selectedID);

    /** 不影响正在截取的片段 */
    if (this.isClipping && currentSnippet) {
      delete newState.selectedID;
      delete newState.textValue;
      message.success(`已截取时间点${newResult.length - 1}`);
    } else {
      this.videoPlayer?.pause();
    }
    this.setState(newState);
    this.updateSidebar()
  };

  /**
   * 视频右键操作
   * @param e
   */
  public contextToCancel = (e: MouseEvent) => {
    if (this.state.clipStatus === EClipStatus.Stop) {
      e.preventDefault();
      this.setState({
        selectedID: '',
      });
      this.updateSidebar()
    }
  };

  /**
   * 重新调整片段长度
   * @param id
   * @param direction
   * @param changedPercent
   */
  public onTrackResize = (id: string, direction: EDirection, changedPercent: number) => {
    const { result } = this.state;
    const res = result.find((i) => i.id === id);
    if (res) {
      const duration = res.duration;
      const isLeft = direction === 'left';
      const key = isLeft ? 'start' : 'end';
      const changeValue = isLeft ? -duration * changedPercent : duration * changedPercent;
      const range = isLeft
        ? [0, Math.max((res.end ?? 0) - SLICE_MIN_TIME, 0)]
        : [res.start + SLICE_MIN_TIME, duration];
      const newValue = MathUtils.withinRange(changeValue + (res?.[key] ?? 0), range);
      res[key] = newValue;
      this.throttledUpdateTime(newValue);
    }

    this.setState({
      result: [...result],
    });
    this.updateSidebar()
  };

  /**
   * 渲染页面标注视频组件
   * @returns
   */
  public renderMediaContent = () => {
    const { pageForward, pageJump, pageBackward } = this.props;

    const {
      result,
      currentTime,
      videoError,
      valid,
    } = this.state;

    return (
      <div className={styles.clipContainer}>
        <VideoPlayer
          imgIndex={this.props.imgIndex}
          imgList={this.props.imgList}
          pageBackward={pageBackward}
          pageForward={pageForward}
          pageJump={pageJump}
          valid={valid}
          setVideoRef={(video) => {
            this.videoPlayer = video;
          }}
          showVideoTrack={!videoError}
          onTrackResize={this.onTrackResize}
          drawLayerSlot={this.props.drawLayerSlot}
          footer={this.props.footer}
          dataLoaded={this.videoLoaded}
        />
        <VideoTimeSlicesOverVideo
          result={result}
          currentTime={currentTime}
          attributeList={this.props.config.attributeList}
          extraStyle={{ top: this.props.drawLayerSlot ? 40 : 0 }}
        />
        {this.isClipping && <i className={styles.clipping} style={{ backgroundImage: ClipIconSvg }}/>}
      </div>
    );
  };

  /**
   * 选中片段
   * @param i
   * @returns
   */
  public onSelectedTimeSlice = (i: IVideoTimeSlice) => {
    if (this.isClipping) {
      return;
    }

    this.setState({
      selectedID: i.id,
      selectedAttribute: i.attribute,
      textValue: i.textAttribute,
    });
    this.updateSidebar()
    this.videoPlayer?.pause();
    this.videoPlayer.currentTime = i.start;
  };

  /** 根据数据删除片段 */
  public removeTimeSlice = (item: IVideoTimeSlice) => {
    const { result } = this.state;
    const selectedID = this.state.selectedID === item.id ? '' : this.state.selectedID;
    const resIndex = result.findIndex((i) => i.id === item.id);
    if (resIndex > -1) {
      result.splice(resIndex, 1);
      this.setState({
        result: [...result],
        selectedID,
      });
      this.updateSidebar()
    }
  };

  public setResult = (loading = true, props: any = this.props) => {
    try {
      const { imgIndex, imgList } = props;
      if (!imgList[imgIndex]) {
        return;
      }

      const resultRecord = jsonParser(imgList[imgIndex].result);
      const stepResult = resultRecord[`step_${this.stepInfo().step}`];
      const result = stepResult?.result || [];
      const valid = isImageValue(imgList[imgIndex].result || '[]')
      this.setState(
        {
          result,
          loading,
          selectedID: '',
          textValue: '',
          selectedAttribute: '',
          clipStatus: EClipStatus.Stop,
          valid,
        },
        () => {
          this.updateSidebar()
          if (!valid) {
            message.info('无效视频，请跳过');
          }
        },
      );
    } catch (e) {
      console.error('数据解析失败');
      this.setState({
        result: [],
        loading: false,
        selectedID: '',
        textValue: '',
        selectedAttribute: '',
        valid: true,
      }, () => {
        this.updateSidebar()
      });
    }
  };

  /**
   * 当前选中的属性改变
   * @param attribute
   */
  public setDefaultAttribute = (attribute: string) => {
    const { result, selectedID } = this.state;
    const res = result.find((i) => i.id === selectedID);
    if (res && selectedID) {
      res.attribute = attribute;
    }
    this.setState({
      selectedAttribute: attribute,
      result: [...result],
    });
    this.updateSidebar()
  };

  /**
   * 设置当前选中片段的文本
   * @param textValue
   */
  public setTextAttribute = (textValue: string) => {
    const { result, selectedID } = this.state;
    this.setState({
      textValue,
    });

    if (selectedID) {
      const res = result.find((i) => i.id === selectedID);
      if (res) {
        res.textAttribute = textValue;
        this.setState({
          result: [...result],
        });
        this.updateSidebar()
      }
    }
  };

  public render() {
    const { selectedID, result, clipStatus, selectedAttribute } = this.state;

    return (
      <VideoClipToolContextProvider
        value={{
          videoPlayer: this.videoPlayer,
          result,
          selectedID,
          attributeList: this.props.config.attributeList,
          clipStatus,
          selectedAttribute,
          contextToCancel: this.contextToCancel,
        }}
      >
        {this.renderMediaContent()}
      </VideoClipToolContextProvider>
    );
  }
}

export default VideoClipTool
