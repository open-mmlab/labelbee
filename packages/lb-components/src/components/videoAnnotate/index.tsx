/**
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @file connect store & TagToolInstanceAdaptor
 * @date 2022-06-02
 */

import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { useDispatch, LabelBeeContext } from '@/store/ctx';
import { AppState } from '@/store';
import { ANNOTATION_ACTIONS } from '@/store/Actions';
import { AnnotationState } from '@/store/annotation/types';
import { PageBackward, PageForward, PageJump } from '@/store/annotation/actionCreators';
import { TagToolInstanceAdaptor } from '@/components/videoPlayer/TagToolInstanceAdaptor';
import { CommonToolUtils } from '@labelbee/lb-annotation';
import { TDrawLayerSlot } from '@/types/main';

const VideoAnnotate: React.FC<{ annotation: AnnotationState, drawLayerSlot?: TDrawLayerSlot }> = (props) => {
  const { imgList, imgIndex, stepList, step } = props.annotation;
  const dispatch = useDispatch();
  const onMounted = (instance: TagToolInstanceAdaptor) => {
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

  const currentStepInfo = useMemo(() => {
    return CommonToolUtils.getCurrentStepInfo(step, stepList);
  }, [stepList, step])

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
      step={currentStepInfo?.step ?? 1}
      drawLayerSlot={props.drawLayerSlot}
    />
  );
};

export default connect(({ annotation }: AppState) => ({ annotation }), null, null, {
  context: LabelBeeContext,
})(VideoAnnotate);
