import React, { useEffect, useRef } from 'react';
import { Spin, message } from 'antd';
import { AppState } from 'src/store';
import { connect } from 'react-redux';
import { ImgAttributeState } from 'src/store/imgAttribute/types';
import _ from 'lodash';
import { store } from '@/index';

import useSize from '@/hooks/useSize';
import { IFileItem } from '@/types/data';
import { IStepInfo } from '@/types/step';
import { InitToolStyleConfig } from '@/store/toolStyle/actionCreators';

interface IProps extends AppState {
  imgAttribute: ImgAttributeState;
  imgList: IFileItem[];
  exportData: any[];
  config: string;
  stepList: IStepInfo[];
  step: number;
  imgIndex: number;
}

const AnnotationOperation: React.FC<IProps> = (props: IProps) => {
  const { imgAttribute, toolStyle, toolInstance } = props;
  const annotationRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // const windowSize = useContext(viewportContext);
  // const canvasSize = getFormatSize(windowSize);
  const size = useSize(annotationRef);

  useEffect(() => {
    store.dispatch(InitToolStyleConfig());
  }, [])

  useEffect(() => {
    if (toolInstance) {
      toolInstance.on('messageError', (error: string) => {
        message.error(error);
      });

      toolInstance.on('messageInfo', (info: string) => {
        message.info(info);
      });
    }
  }, [toolInstance]);

  useEffect(() => {
    if (toolInstance) {
      toolInstance.setImgAttribute(imgAttribute);
    }
  }, [imgAttribute]);

  /** 样式同步 */
  useEffect(() => {
    if (toolInstance) {
      toolInstance.setStyle(toolStyle);
    }
  }, [toolStyle]);

  /** 窗口大小监听 */
  useEffect(() => {
    if (toolInstance?.setSize) {
      toolInstance.setSize(size);
    }
  }, [size]);

  return (
    <div ref={annotationRef} className='annotationOperation'>
      <Spin spinning={false}>
        <div className='canvas' ref={containerRef} style={size} id='toolContainer' />
      </Spin>
    </div>
  );
};

const mapStateToProps = (state: AppState) => {
  const annotationState = _.pickBy(state.annotation, (v, k) =>
    ['imgList', 'imgIndex', 'stepList', 'step', 'toolInstance'].includes(k),
  );
  return {
    imgAttribute: state.imgAttribute,
    toolStyle: state.toolStyle,
    ...annotationState,
  };
};

export default connect(mapStateToProps)(AnnotationOperation);
