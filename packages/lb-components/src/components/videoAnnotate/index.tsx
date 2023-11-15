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
import { getStepConfig } from '@/store/annotation/reducer';
import { cTool } from '@labelbee/lb-annotation';
import VideoClipTool from '@/components/videoAnnotate/videoClipTool';
import { a2MapStateToProps, IA2MapStateProps } from '@/store/annotation/map';
import { AppProps } from '@/App';
const { EVideoToolName } = cTool;

export interface IVideoAnnotateProps extends IA2MapStateProps {
  path: string;
  loading: boolean;
  videoContext?: any;
}

const VideoAnnotate: React.FC<AppProps & IVideoAnnotateProps> = (props) => {
  const { imgList, imgIndex, stepList, step } = props;
  const currentToolName = getStepConfig(stepList, step)?.tool;

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

  if (currentToolName === EVideoToolName.VideoClipTool) {
    return <VideoClipTool
      {...props}
      pageBackward={() => dispatch(PageBackward())}
      pageForward={() => dispatch(PageForward())}
      pageJump={(page) => dispatch(PageJump(~~page))}
      onMounted={onMounted}
      onUnmounted={onUnmounted}
    />
  }
  return (
    <TagToolInstanceAdaptor
      imgIndex={imgIndex}
      imgList={imgList}
      pageBackward={() => dispatch(PageBackward())}
      pageForward={() => dispatch(PageForward())}
      pageJump={(page) => dispatch(PageJump(~~page))}
      onMounted={onMounted}
      onUnmounted={onUnmounted}
      stepList={stepList}
      step={step}
    />
  );
};

export default connect(a2MapStateToProps, null, null, {
  context: LabelBeeContext,
})(VideoAnnotate);
