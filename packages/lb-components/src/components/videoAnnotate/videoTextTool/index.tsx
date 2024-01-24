import React from 'react';
import { jsonParser } from '@/utils';
import { VideoPlayer } from '../../videoPlayer';
import _ from 'lodash';
import { IVideoAnnotateProps } from '@/components/videoAnnotate';
import { VideoTextLayer } from '../../videoPlayer/VideoTextLayer';
import { toolStyleConverter } from '@labelbee/lb-utils';

export interface IVideoTextInstanceAdaptorProps extends IVideoAnnotateProps{
  pageForward: () => void;
  pageJump: (page: string) => void;
  pageBackward: () => void;
  onMounted: (instance: any) => void;
  onUnmounted: () => void;
  onVideoLoaded: () => void;
}

interface IVideoTextInstanceAdaptorState {
  result: any;
  valid: boolean;
  showText: boolean;
}

export class VideoTextTool extends React.Component<
  IVideoTextInstanceAdaptorProps,
  IVideoTextInstanceAdaptorState
  > {
  public fns: { [key: string]: () => void } = {};
  public videoPlayer?: HTMLVideoElement;

  public constructor(props: IVideoTextInstanceAdaptorProps) {
    super(props);
    this.state = {
      result: {},
      valid: true,
      showText: true,
    };
  }

  public get config() {
    return jsonParser(this.props.stepInfo?.config);
  }

  /** Just implementation, no actual logic */
  public get history() {
    return { initRecord: () => {}, pushHistory: () => {} };
  }

  public get valid() {
    return this.state.valid;
  }

  public get needConfirm() {
    const { result } = this.state
    return this.config.configList?.some(
      (i: any) => i.required && !result?.value?.[i.key],
    );
  }

  public get textList() {
    return [this.state.result]
  }

  public getColor(config = this.config, attribute = '') {
    return toolStyleConverter.getColorByConfig({ attribute, config });
  }

  public clearResult = (sendMsg = true) => {
    this.setState(
      {
        result: {},
      },
      () => this.updateSidebar(),
    );
  };

  public exportData = () => {
    const duration = this.videoPlayer?.duration ?? 0;

    return [
      [this.state.result],
      { valid: this.state.valid, duration },
    ];
  };

  public toggleShowText = (v: boolean) => {
    this.setState({
      showText: v,
    })
  }

  public singleOn = (event: string, func: () => void) => {
    this.fns[event] = func;
  }

  public on = (event: string, func: () => void) => {
    this.singleOn(event, func);
  }

  public unbindAll = (eventName: string) => {
    delete this.fns[eventName];
  }

  public emitEvent = (event: string) => {
    if (this.fns[event]) {
      this.fns[event]();
    }
  };

  public updateSidebar = () => {
    this.emitEvent('valueUpdated');
  }

  public updateTextValue = (key: string, text: string, update: boolean, result?: { [key: string]: string }) => {
    const newResult = _.cloneDeep(result ?? {});

    newResult.value = Object.assign(newResult.value ?? {}, { [key]: text });

    /** 步骤编辑or创建是实时提交以预览结果数据 */
    this.setState(
      {
        result: newResult,
      }, () => update && this.updateSidebar()
    );
  };

  public setResult = (result: any) => {
    this.setState({
      result,
    });

    if (this.fns['render']) {
      this.fns['render']();
    }
  };

  public setValid = (valid: boolean) => {
    this.setState({ valid });
    if (valid === false) {
      this.setState({ result: {} });
    }

    this.emitEvent('render');
  };

  public componentDidMount() {
    this.props.onMounted(this);
    this.setResultFromImgList(this.props);
  }

  public componentWillUnmount() {
    this.props.onUnmounted();
  }

  public setResultFromImgList = (props: IVideoTextInstanceAdaptorProps) => {
    const { imgList, imgIndex, stepInfo } = props;

    if (!imgList[imgIndex]) {
      return;
    }
    const res = jsonParser(imgList[imgIndex].result);
    const stepRes = res[`step_${stepInfo.step}`];

    const defaultTextResult = {
      value: this.getInitTextValue()
    }
    this.setState({
      result: stepRes ? (stepRes?.result?.[0] ?? {}) : defaultTextResult,
      valid: res?.valid === undefined ? true : res.valid,
    }, () => this.updateSidebar());
  };

  /**
   * 获取初始值
   */
  public getInitTextValue = () => {
    let result = {} as any
    this.config.configList.forEach((i: { key: string, default: string }) => {
      result[i.key] = i.default ?? '';
    })
    return result
  };

  /** Observer imgIndex and set result */
  public shouldComponentUpdate(props: IVideoTextInstanceAdaptorProps) {
    if (props.imgIndex !== this.props.imgIndex) {
      this.setResultFromImgList(props);
    }
    return true;
  }

  public render() {
    const { imgIndex, imgList, pageForward, pageJump, pageBackward } = this.props;
    const { result, valid, showText } = this.state;

    return (
      <div style={{ height: '100%', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {showText && result.value && (
          <VideoTextLayer
            value={result.value}
            toolColor={this.getColor(this.config)?.valid?.fill}
            configList={this.config.configList}
            hasPromptLayer={!!this.props.drawLayerSlot}
          />
        )}
        <VideoPlayer
          imgIndex={imgIndex}
          imgList={imgList}
          pageBackward={pageBackward}
          pageForward={pageForward}
          pageJump={pageJump}
          valid={valid}
          setVideoRef={(video) => {
            this.videoPlayer = video;
          }}
          drawLayerSlot={this.props.drawLayerSlot}
          footer={this.props.footer}
          dataLoaded={this.props.onVideoLoaded}
        />
      </div>
    );
  }
}
