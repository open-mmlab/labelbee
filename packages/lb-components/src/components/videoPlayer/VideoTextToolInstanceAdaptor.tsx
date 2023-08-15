/**
 * @file description.....
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @createdate 2023-07-14
 */

import React from 'react';
import { CommonToolUtils, uuid } from '@labelbee/lb-annotation';
import { jsonParser } from '@/utils';
import { VideoPlayer } from './index';
import { IStepInfo } from '@/types/step';
import _ from 'lodash';
import { getKeyCodeNumber } from './utils';
import { IFileItem } from '@/types/data';
import { message } from 'antd';
import StepUtils from '@/utils/StepUtils';

import Sidebar from '../../views/MainView/sidebar';

import { ToolInstanceForComponent } from '../videoAnnotate/ToolInstanceForComponent';

export interface IVideoTextInstanceAdaptorProps {
  imgIndex: number;
  imgList: IFileItem[];
  pageForward: () => void;
  pageJump: (page: string) => void;
  pageBackward: () => void;
  onMounted: (instance: VideoTextInstanceAdaptor) => void;
  onUnmounted: () => void;
  step: number;
  stepList: IStepInfo[];
}

interface IVideoTextInstanceAdaptorState {
  textList: any[];
  valid: boolean;
}

export class VideoTextInstanceAdaptor
  extends React.Component<IVideoTextInstanceAdaptorProps, IVideoTextInstanceAdaptorState>
  implements ToolInstanceForComponent
{
  public fns: { [key: string]: () => void } = {};
  public videoRef?: HTMLVideoElement;
  public labelSelectedList: number[] = [];

  public constructor(props: IVideoTextInstanceAdaptorProps) {
    super(props);
    this.state = {
      textList: [],
      valid: true,
    };
  }

  public componentDidMount() {
    this.props.onMounted(this);
  }

  public componentWillUnmount() {
    this.props.onUnmounted();
  }

  public keydown() {}

  /** 结果对象 */
  private get result() {
    const { imgList, imgIndex } = this.props;
    return jsonParser(imgList[imgIndex].result);
  }

  public get config() {
    const stepInfo = StepUtils.getCurrentStepInfo(this.props.step, this.props.stepList);
    return jsonParser(stepInfo?.config);
  }

  public updateText = (text: string, key: string) => {
    const { textList } = this.state;

    const newResult = textList[0];

    newResult.value = Object.assign(newResult.value ?? {}, { [key]: text });

    /** 步骤编辑or创建是实时提交以预览结果数据 */
    this.setState(
      {
        textList,
      },
      () => {
        // if (this.props.isEdit) {
        //   this.submitData();
        // }
        // this.setAnnotationResult();
      },
    );
  };

  public setResult = async (textList: any[]) => {
    this.setState({
      textList,
    });
  };

  public exportData() {
    return [];
  }
  public setValid(valid: boolean) {}

  public render() {
    const { imgIndex, imgList, pageForward, pageJump, pageBackward } = this.props;
    const { textList, valid } = this.state;

    return (
      <div style={{ height: '100%', width: '100%', position: 'relative' }}>
        <VideoPlayer
          imgIndex={imgIndex}
          imgList={imgList}
          pageBackward={pageBackward}
          pageForward={pageForward}
          pageJump={pageJump}
          valid={valid}
          setVideoRef={(video) => {
            this.videoRef = video;
          }}
        />
        {/* <Sider
          className={`${layoutCls}__side`}
          width={siderWidth ?? 240}
          style={props.style?.sider}
        >
          <Sidebar sider={props?.sider} />
        </Sider> */}
      </div>
    );
  }
}
