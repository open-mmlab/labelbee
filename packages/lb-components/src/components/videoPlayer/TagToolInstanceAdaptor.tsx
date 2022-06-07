/**
 * @file Implement TagTool interaction through class components.
 *       Refer to: packages/lb-annotation/src/core/toolOperation/tagOperation.ts
 * @author Glenfiddish <edwinlee0927@hotmail.com>
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
import type { ObjectString } from './types';
import { getKeyCodeNumber } from './utils';

export interface IVideoTagInstanceAdaptorProps {
  imgIndex: number;
  imgList: any[];
  pageForward: () => void;
  pageJump: (page: string) => void;
  pageBackward: () => void;
  onMounted: (instance: TagToolInstanceAdaptor) => void;
  onUnmounted: () => void;
  step: number;
  stepList: IStepInfo[];
}

interface ITagInstanceAdaptorState {
  tagResult: any[];
  labelSelectedList: any;
  valid: boolean;
}

export class TagToolInstanceAdaptor extends React.Component<
  IVideoTagInstanceAdaptorProps,
  ITagInstanceAdaptorState
> {
  public fns: { [key: string]: () => void } = {};

  public labelSelectedList: number[] = [];

  constructor(props: IVideoTagInstanceAdaptorProps) {
    super(props);
    this.state = {
      tagResult: [],
      labelSelectedList: [],
      valid: true,
    };
  }

  public get config() {
    const stepInfo = StepUtils.getCurrentStepInfo(this.props.step, this.props.stepList);
    return jsonParser(stepInfo?.config);
  }

  /** Just implementation, no actual logic */
  public get history() {
    return { initRecord: () => {} };
  }

  get currentTagResult() {
    return this.state.tagResult[0];
  }

  public get valid() {
    return this.state.valid;
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
    return [this.state.tagResult, { valid: this.state.valid }];
  };

  public singleOn(event: string, func: () => void) {
    this.fns[event] = func;
  }

  public on(event: string, func: () => void) {
    this.singleOn(event, func);
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
  };

  public componentDidMount() {
    document.addEventListener('keydown', this.keydown);
    this.props.onMounted(this);
  }

  public componentWillUnmount() {
    document.addEventListener('keydown', this.keydown);
    this.props.onUnmounted();
  }

  /** Observer imgIndex and set tagResult */
  public shouldComponentUpdate({ imgIndex, imgList, step }: IVideoTagInstanceAdaptorProps) {
    if (imgIndex !== this.props.imgIndex) {
      const res = jsonParser(imgList[imgIndex].result)[`step_${step}`];
      this.setState({
        tagResult: res?.result ?? [],
        valid: res.valid,
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
