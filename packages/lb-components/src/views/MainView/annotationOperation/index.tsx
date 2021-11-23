import React, { useEffect, useRef, useState } from 'react';
import { Spin, message } from 'antd/es';
import { AppState } from 'src/store';
import { connect } from 'react-redux';
import { ImgAttributeState } from 'src/store/imgAttribute/types';
import _ from 'lodash';
import { store } from '@/index';

import useSize from '@/hooks/useSize';
import { IFileItem } from '@/types/data';
import { IStepInfo } from '@/types/step';
import { InitToolStyleConfig } from '@/store/toolStyle/actionCreators';
import { AnnotationEngine, ImgUtils } from '@sensetime/annotation';
import ImageError from '@/components/ImageError';
import { i18n } from '@sensetime/lb-utils';

interface IProps extends AppState {
  imgAttribute: ImgAttributeState;
  imgList: IFileItem[];
  exportData: any[];
  config: string;
  stepList: IStepInfo[];
  step: number;
  imgIndex: number;
  annotationEngine: AnnotationEngine;
  loading: boolean;
}

const AnnotationOperation: React.FC<IProps> = (props: IProps) => {
  const [, forceRender] = useState<number>(0);

  const { imgAttribute, toolStyle, toolInstance, annotationEngine, loading, imgList, imgIndex } =
    props;
  const annotationRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // const windowSize = useContext(viewportContext);
  // const canvasSize = getFormatSize(windowSize);
  const size = useSize(annotationRef);

  useEffect(() => {
    store.dispatch(InitToolStyleConfig());
  }, []);

  useEffect(() => {
    if (!annotationEngine) {
      return;
    }

    // 更改 toolInstance 内部国际化语言
    switch (i18n.language) {
      case 'cn':
      case 'en':
        annotationEngine.setLang(i18n.language);
        break;
      default: {
        //
        break;
      }
    }
  }, [annotationEngine]);

  useEffect(() => {
    if (toolInstance) {
      toolInstance.singleOn('messageError', (error: string) => {
        message.error(error);
      });

      toolInstance.singleOn('messageInfo', (info: string) => {
        message.info(info);
      });

      toolInstance.singleOn('changeAnnotationShow', () => {
        forceRender((s) => s + 1);
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
    if (annotationEngine) {
      annotationEngine.setStyle(toolStyle);
    }
  }, [toolStyle]);

  /** 窗口大小监听 */
  useEffect(() => {
    if (toolInstance?.setSize) {
      toolInstance.setSize(size);
    }

    if (annotationEngine) {
      annotationEngine.setSize(size);
    }
  }, [size]);

  /**
   * 重新加载图片，避免网络问题导致的图片无法加载
   * @returns
   */
  const reloadImg = () => {
    const imgInfo = imgList[imgIndex];
    if (!imgInfo.url) {
      return;
    }

    ImgUtils.load(imgInfo.url).then((imgNode) => {
      annotationEngine.setImgNode(imgNode as HTMLImageElement);
    });
  };

  return (
    <div ref={annotationRef} className='annotationOperation'>
      <Spin spinning={loading} delay={500}>
        <div className='canvas' ref={containerRef} style={size} id='toolContainer' />
      </Spin>
      {toolInstance?.isImgError === true && (
        <ImageError
          {...size}
          reloadImage={reloadImg}
          backgroundColor='#e2e2e2'
          ignoreOffsetY={true}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: AppState) => {
  const annotationState = _.pickBy(state.annotation, (v, k) =>
    [
      'imgList',
      'imgIndex',
      'stepList',
      'step',
      'toolInstance',
      'annotationEngine',
      'loading',
    ].includes(k),
  );
  return {
    imgAttribute: state.imgAttribute,
    toolStyle: state.toolStyle,
    ...annotationState,
  };
};

export default connect(mapStateToProps)(AnnotationOperation);
