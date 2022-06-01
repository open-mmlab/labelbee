import React from 'react';
import { connect, useDispatch } from 'react-redux';
import { AppState } from '@/store';
import { AnnotationState } from '@/store/annotation/types';
import { PageBackward, PageForward, PageJump } from '@/store/annotation/actionCreators';
import { ANNOTATION_ACTIONS } from '@/store/Actions';
import { TagToolInstanceAdaptor } from '@/components/videoPlayer/TagToolInstanceAdaptor';

const VideoAnnotate: React.FC<{ annotation: AnnotationState }> = (props) => {
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

  return (
    <>
      <TagToolInstanceAdaptor
        imgIndex={imgIndex}
        imgList={imgList}
        pageBackward={() => dispatch(PageBackward())}
        pageForward={() => dispatch(PageForward())}
        pageJump={(page) => dispatch(PageJump(page))}
        onMounted={onMounted}
        onUnmounted={onUnmounted}
        stepList={stepList}
        step={step}
      />
    </>
  );
};

export default connect(({ annotation }: AppState) => ({ annotation }))(VideoAnnotate);
