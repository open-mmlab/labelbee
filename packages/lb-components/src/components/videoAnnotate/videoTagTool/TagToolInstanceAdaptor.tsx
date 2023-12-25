/**
 * @file Implement TagTool interaction through class components.
 *       Refer to: packages/lb-annotation/src/core/toolOperation/tagOperation.ts
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @date 2022-05-31
 */

import React from 'react';
import { CommonToolUtils, uuid } from '@labelbee/lb-annotation';
import { jsonParser } from '@/utils';
import { VideoPlayer } from '../../videoPlayer';
import { VideoTagLayer } from '../../videoPlayer/VideoTagLayer';
import _ from 'lodash';
import type { ObjectString } from '../../videoPlayer/types';
import { getKeyCodeNumber } from '../../videoPlayer/utils';
import { IVideoAnnotateProps } from '@/components/videoAnnotate';

export interface IVideoTagInstanceAdaptorProps extends IVideoAnnotateProps{
  pageForward: () => void;
  pageJump: (page: string) => void;
  pageBackward: () => void;
  onMounted: (instance: any) => void;
  onUnmounted: () => void;
}

interface IVideoTagInstanceAdaptorState {
  // TODO: Use ITagResult from 'lb-annotation'
  tagResult: any[];
  labelSelectedList: number[];
  valid: boolean;
}

export class TagToolInstanceAdaptor extends React.Component<
  IVideoTagInstanceAdaptorProps,
  IVideoTagInstanceAdaptorState
> {
  public fns: { [key: string]: () => void } = {};
  public videoPlayer?: HTMLVideoElement;
  public labelSelectedList: number[] = [];

  public constructor(props: IVideoTagInstanceAdaptorProps) {
    super(props);
    this.state = {
      tagResult: [],
      labelSelectedList: [],
      valid: true,
    };
  }

  public get config() {
    return jsonParser(this.props.stepInfo?.config);
  }

  /** Just implementation, no actual logic */
  public get history() {
    return { initRecord: () => {}, pushHistory: () => {} };
  }

  public get currentTagResult() {
    return this.state.tagResult[0] ?? {};
  }

  public get valid() {
    return this.state.valid;
  }

  public clearResult = (sendMsg = true, value?: string) => {
    const newTag = value
      ? this.state.tagResult.map((v) => {
          if (v?.result[value]) {
            delete v.result[value];
          }
          return v;
        })
      : [];

    this.setState(
      {
        tagResult: newTag,
      },
      () => this.emitEvent('render'),
    );
  };

  public exportData = () => {
    const duration = this.videoPlayer?.duration ?? 0;
    const videoQulity = this.videoPlayer?.getVideoPlaybackQuality();
    const frames = videoQulity?.totalVideoFrames;
    const videoWidth = this.videoPlayer?.videoWidth ?? 0;
    const videoHeight = this.videoPlayer?.videoHeight ?? 0;

    return [
      this.state.tagResult,
      { valid: this.state.valid, duration, frames, videoWidth, videoHeight },
    ];
  };

  public singleOn(event: string, func: () => void) {
    this.fns[event] = func;
  }

  public on(event: string, func: () => void) {
    this.singleOn(event, func);
  }

  public unbindAll(eventName: string) {
    delete this.fns[eventName];
  }

  public getTagResultByCode(num1: number, num2?: number) {
    try {
      const inputList = this.config?.inputList ?? [];
      const mulitTags = inputList.length > 1;
      const keycode1 = num2 !== undefined ? num1 : 0;
      const keycode2 = num2 !== undefined ? num2 : num1;
      const primaryTagConfig = mulitTags ? inputList[keycode1] : inputList[0];
      const secondaryTagConfig = (primaryTagConfig.subSelected ?? [])[keycode2];

      if (primaryTagConfig && secondaryTagConfig) {
        return {
          value: {
            key: primaryTagConfig.value,
            value: secondaryTagConfig.value,
          },
          isMulti: primaryTagConfig.isMulti,
        };
      }
    } catch {
      return;
    }
  }

  public setLabelBySelectedList(num1: number, num2?: number) {
    const newTagConfig = this.getTagResultByCode(num1, num2);

    if (newTagConfig) {
      const tagRes = this.combineResult(newTagConfig, this.state.tagResult[0]?.result ?? {});

      const tagResult = [
        {
          sourceID: CommonToolUtils.getSourceID(),
          id: this.currentTagResult?.id ?? uuid(8, 62),
          result: tagRes,
        },
      ];

      this.setState(
        {
          tagResult,
        },
        () => this.emitEvent('render'),
      );
    }
  }

  public emitEvent = (event: string) => {
    if (this.fns[event]) {
      this.fns[event]();
    }
  };

  /**
   * Combine result with inputValue and existValue
   * @param inputValue
   * @param existValue
   * @returns newValue
   */
  public combineResult = (
    inputValue: { value: { key: string; value: string }; isMulti: boolean },
    existValue: ObjectString = {},
  ) => {
    const { isMulti } = inputValue;
    const { key, value } = inputValue.value;

    if (isMulti) {
      let valuesArray = existValue[key]?.split(';') ?? [];
      if (valuesArray.includes(value)) {
        valuesArray = valuesArray.filter((i) => i !== value);
      } else {
        valuesArray.push(value);
      }

      const valuesSet = new Set(valuesArray);
      existValue[key] = Array.from(valuesSet).join(';');
      return _.pickBy(existValue, (v) => v);
    }

    existValue[key] = existValue[key] === value ? undefined : value;

    return _.pickBy(existValue, (v) => v);
  };

  public setResult = (tagResult: any[]) => {
    this.setState({
      tagResult,
    });

    if (this.fns['render']) {
      this.fns['render']();
    }
  };

  public setLabel = (num1: number, num2: number) => {
    this.setLabelBySelectedList(num1, num2);
  };

  /**
   * Keydown event for recording keycode input(numeric only)
   * @param event
   */
  public keydown = (event: KeyboardEvent) => {
    const keyCode = getKeyCodeNumber(event.keyCode);

    if (keyCode) {
      const keyIndex = keyCode - 1;

      if (this.config.inputList.length === 1) {
        // 说明标签只有一层
        this.labelSelectedList = [0, keyIndex];
        this.setLabel(0, keyIndex);
        setTimeout(() => {
          this.labelSelectedList = [];
          this.emitEvent('render');
        }, 500);

        return;
      }

      if (this.labelSelectedList.length === 1) {
        this.labelSelectedList = [this.labelSelectedList[0], keyIndex];
        this.setLabel(this.labelSelectedList[0], keyIndex);
        setTimeout(() => {
          this.labelSelectedList = [];
          this.emitEvent('render');
        }, 500);
      } else {
        this.labelSelectedList = [keyIndex];
        this.emitEvent('expend');
      }
    }
  };

  public setValid = (valid: boolean) => {
    this.setState({ valid });
    if (valid === false) {
      this.setState({ tagResult: [] });
    }

    this.emitEvent('render');
  };

  public componentDidMount() {
    document.addEventListener('keydown', this.keydown);
    this.props.onMounted(this);
    this.setResultFromImgList(this.props);
  }

  public componentWillUnmount() {
    document.addEventListener('keydown', this.keydown);
    this.props.onUnmounted();
  }

  public setResultFromImgList = (props: IVideoTagInstanceAdaptorProps) => {
    const { imgList, imgIndex, step } = props;

    if (!imgList[imgIndex]) {
      return;
    }
    const res = jsonParser(imgList[imgIndex].result);
    const stepRes = res[`step_${step}`];

    this.setState({
      tagResult: stepRes?.result ?? [],
      valid: res?.valid === undefined ? true : res.valid,
    });
  };

  /** Observer imgIndex and set tagResult */
  public shouldComponentUpdate(props: IVideoTagInstanceAdaptorProps) {
    if (props.imgIndex !== this.props.imgIndex) {
      this.setResultFromImgList(props);
    }
    return true;
  }

  public render() {
    const { imgIndex, imgList, pageForward, pageJump, pageBackward } = this.props;
    const { tagResult, valid } = this.state;

    return (
      <div style={{ height: '100%', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
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
        />
        <VideoTagLayer result={tagResult} inputList={this.config?.inputList} hasPromptLayer={!!this.props.drawLayerSlot}/>
      </div>
    );
  }
}
