/**
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @file connect store & TagToolInstanceAdaptor
 * @date 2022-06-02
 */

import React from 'react';
import { connect } from 'react-redux';
import { useDispatch, LabelBeeContext } from '@/store/ctx';
import { ANNOTATION_ACTIONS } from '@/store/Actions';
import { PageBackward, PageForward, PageJump } from '@/store/annotation/actionCreators';
import { TagToolInstanceAdaptor } from '@/components/videoAnnotate/videoTagTool/TagToolInstanceAdaptor';
import { cTool } from '@labelbee/lb-annotation';
import VideoClipTool from '@/components/videoAnnotate/videoClipTool';
import { DrawLayerSlot } from '@/types/main';
import { AppState } from '@/store';
import StepUtils from '@/utils/StepUtils';
import { jsonParser } from '@/utils';
import { IStepInfo } from '@/types/step';
import { IFileItem } from '@/types/data';
import { VideoTextTool } from '@/components/videoAnnotate/videoTextTool';
const { EVideoToolName } = cTool;

export interface IVideoAnnotateProps {
  path: string;
  loading: boolean;
  videoContext?: any;
  stepInfo: IStepInfo;
  step: number;
  stepList: IStepInfo[];
  config: any;
  imgIndex: number;
  imgList: IFileItem[];
  drawLayerSlot?: DrawLayerSlot;
  footer?: any;
  skipBeforePageTurning?: (pageTurning: Function) => void;
}

const VideoAnnotate: React.FC<IVideoAnnotateProps> = (props) => {
  const { stepInfo, skipBeforePageTurning } = props;
  const currentToolName = stepInfo?.tool;

  const dispatch = useDispatch();
  const onMounted = (instance: any) => {
    dispatch({
      type: ANNOTATION_ACTIONS.SET_TOOL,
      payload: {
        instance,
      },
    });
  };

  const onUnmounted = () => {
    dispatch({
      type: ANNOTATION_ACTIONS.SET_TOOL,
      payload: {
        instance: undefined,
      },
    });
  };

  const onVideoLoaded = () => {
    dispatch({
      type: ANNOTATION_ACTIONS.SET_LOADING,
      payload: {
        loading: false,
      },
    });
  }

  const pageBackward = () => {
    if (skipBeforePageTurning) {
      skipBeforePageTurning(() => dispatch(PageBackward()));
      return;
    }
    dispatch(PageBackward());
  };

  const pageForward = () => {
    if (skipBeforePageTurning) {
      skipBeforePageTurning(() => dispatch(PageForward()));
      return;
    }
    dispatch(PageForward());
  };

  if (currentToolName === EVideoToolName.VideoClipTool) {
    return <VideoClipTool
      {...props}
      pageBackward={pageBackward}
      pageForward={pageForward}
      pageJump={(page) => dispatch(PageJump(~~page - 1))}
      onMounted={onMounted}
      onUnmounted={onUnmounted}
      onVideoLoaded={onVideoLoaded}
    />
  }

  if (currentToolName === EVideoToolName.VideoTextTool) {
    return <VideoTextTool
      {...props}
      pageBackward={pageBackward}
      pageForward={pageForward}
      pageJump={(page) => dispatch(PageJump(~~page - 1))}
      onMounted={onMounted}
      onUnmounted={onUnmounted}
      onVideoLoaded={onVideoLoaded}
    />
  }

  if (currentToolName === EVideoToolName.VideoTagTool) {
    return (
      <TagToolInstanceAdaptor
        {...props}
        pageBackward={pageBackward}
        pageForward={pageForward}
        pageJump={(page) => dispatch(PageJump(~~page - 1))}
        onMounted={onMounted}
        onUnmounted={onUnmounted}
        onVideoLoaded={onVideoLoaded}
      />
    );
  }
  return null
};

const mapStateToProps = (state : AppState) => {
  const {
    annotation: { imgList, imgIndex, step, stepList, loading, skipBeforePageTurning },
  } = state;
  const stepInfo = StepUtils.getCurrentStepInfo(state.annotation?.step, state.annotation?.stepList);
  const imgInfo = imgList[imgIndex] ?? {};

  return {
    imgIndex,
    imgList,
    stepInfo,
    config: jsonParser(stepInfo?.config),
    step,
    stepList,
    path: imgInfo?.path ?? imgInfo?.url ?? '', // 将当前路径的数据注入
    loading,
    skipBeforePageTurning,
  };
};
export default connect(mapStateToProps, null, null, {
  context: LabelBeeContext,
})(VideoAnnotate);
