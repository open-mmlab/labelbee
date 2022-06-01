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
import _ from 'lodash';

interface ITagInstanceAdaptorProps {
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

interface ITagInstanceAdaptorState {
  tagResult: any[];
  labelSelectedList: any;
}

interface ObjectString {
  [key: string]: string | undefined;
}

const getKeyCodeNumber = (keyCode: number) => {
  if (keyCode <= 57 && keyCode >= 49) {
    return keyCode - 48;
  }

  if (keyCode <= 105 && keyCode >= 97) {
    return keyCode - 96;
  }

  return 0;
};

export class TagToolInstanceAdaptor extends React.Component<
  ITagInstanceAdaptorProps,
  ITagInstanceAdaptorState
> {
  public fns: { [key: string]: () => void } = {};

  public labelSelectedList: number[] = [];

  constructor(props: ITagInstanceAdaptorProps) {
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

  get history() {
    return { initRecord: () => {} };
  }

  get currentTagResult() {
    return this.state.tagResult[0];
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

  public singleOn(event: string, func: () => void) {
    this.fns[event] = func;
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
          id: uuid(8, 62),
          result: tagRes,
        },
      ];

      this.setState({
        tagResult,
      });

      this.emitEvent('render');
    }
  }

  public emitEvent = (event: string) => {
    if (this.fns[event]) {
      this.fns[event]();
    }
  };

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

  /** 参考 packages/lb-annotation/src/core/toolOperation/tagOperation.ts onKeyDown */
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

  public componentDidMount() {
    document.addEventListener('keydown', this.keydown);
    this.props.onMounted(this);
  }

  public componentWillMount() {
    document.addEventListener('keydown', this.keydown);
    this.props.onUnmounted();
  }

  public shouldComponentUpdate({ imgIndex, imgList, step }: ITagInstanceAdaptorProps) {
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
