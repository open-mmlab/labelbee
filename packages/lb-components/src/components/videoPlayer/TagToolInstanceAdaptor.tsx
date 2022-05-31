/**
 * @file 视频标签工具实现标签工具的方法
 * @author lijingchi <lijingchi1@sensetime.com>
 * @date 2022-05-31
 */

import React from 'react';
import { CommonToolUtils, uuid } from '@labelbee/lb-annotation';
import StepUtils from '@/utils/StepUtils';
import { jsonParser } from '@/utils';
import { VideoPlayer } from './index';
import { VideoTagLayer } from './VideoTagLayer';
import { IStepInfo } from '@/types/step';

export interface IZProp {
  imgIndex: number;
  imgList: any[];
  pageForward: () => void;
  pageJump: (page: number) => void;
  pageBackward: () => void;
  onMounted: (instance: TagToolInstanceAdaptor) => void;
  onUnmounted: () => void;
  step: number;
  stepList: IStepInfo[];
}
export interface IZState {
  tagResult: any[];
  labelSelectedList: any;
}

export class TagToolInstanceAdaptor extends React.Component<IZProp, IZState> {
  constructor(props: IZProp) {
    super(props);
    this.state = {
      tagResult: [],
      labelSelectedList: [],
    };
  }

  get config() {
    const stepInfo = StepUtils.getCurrentStepInfo(this.props.step, this.props.stepList);
    return jsonParser(stepInfo?.config);
  }

  // TODO 标签记录
  get labelSelectedList() {
    return [];
  }

  get history() {
    return { initRecord: () => {} };
  }

  get currentTagResult() {
    return this.state.tagResult;
  }

  set labelSelectedList(labelSelectedList: any) {
    this.setState({
      labelSelectedList,
    });
  }

  public clearResult = (sendMsg: boolean, value?: string) => {
    const newTag = value
      ? this.state.tagResult.map((v) => {
          if (v?.result[value]) {
            delete v.result[value];
          }
          return v;
        })
      : [];

    this.setState({
      tagResult: newTag,
    });
  };

  public exportData = () => {
    return [this.state.tagResult, { valid: true }];
  };

  public singleOn() {}

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
    const currentRes = this.state.tagResult.length > 0 ? this.state.tagResult[0].result : {};

    if (newTagConfig) {
      const inputValue = { [newTagConfig.value.key]: newTagConfig.value.value };
      // todo: 合并输入逻辑
      const tagRes = newTagConfig.isMulti ? Object.assign(currentRes, inputValue) : inputValue;

      const tagResult = [
        {
          sourceID: CommonToolUtils.getSourceID(),
          id: uuid(8, 62),
          result: tagRes,
        },
      ];

      this.setState({
        tagResult,
      });
    }
  }

  public setResult = (tagResult: any[]) => {
    this.setState({
      tagResult,
    });
  };

  public setLabel = (num1: number, num2: number) => {
    this.setLabelBySelectedList(num1, num2);
  };

  public componentDidMount() {
    // document.addEventListener('keydown', this.keydown);
    this.props.onMounted(this);
  }

  public componentWillMount() {
    // document.addEventListener('keydown', this.keydown);
    this.props.onUnmounted();
  }

  public shouldComponentUpdate({ imgIndex, imgList, step }: IZProp) {
    if (imgIndex !== this.props.imgIndex) {
      this.setState({
        tagResult: jsonParser(imgList[imgIndex].result)[`step_${step}`]?.result ?? [],
      });
    }
    return true;
  }

  public render() {
    const { imgIndex, imgList, pageForward, pageJump, pageBackward } = this.props;
    const { tagResult } = this.state;

    return (
      <div style={{ height: '100%', width: '100%', position: 'relative' }}>
        <VideoPlayer
          imgIndex={imgIndex}
          imgList={imgList}
          pageBackward={pageBackward}
          pageForward={pageForward}
          pageJump={pageJump}
        />
        <VideoTagLayer result={tagResult} inputList={this.config?.inputList} />
      </div>
    );
  }
}
