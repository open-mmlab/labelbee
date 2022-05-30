import React from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import { connect, useDispatch } from 'react-redux';
import { AppState } from '@/store';
import { AnnotationState } from '@/store/annotation/types';
import { PageBackward, PageForward, PageJump } from '@/store/annotation/actionCreators';

const VideoAnnotate: React.FC<{ annotation: AnnotationState }> = (props) => {
  const { imgList, imgIndex } = props.annotation;
  const dispatch = useDispatch();

  return (
    <VideoPlayer
      imgIndex={imgIndex}
      imgList={imgList}
      pageBackward={() => dispatch(PageBackward())}
      pageForward={() => dispatch(PageForward())}
      pageJump={(page) => dispatch(PageJump(page))}
    />
  );
};

export default connect(({ annotation }: AppState) => ({ annotation }))(VideoAnnotate);
