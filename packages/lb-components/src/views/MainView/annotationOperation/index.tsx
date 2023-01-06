import { store } from '@/index';
import { LabelBeeContext } from '@/store/ctx';
import { message } from 'antd/es';
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { AppState } from 'src/store';
import { ImgAttributeState } from 'src/store/imgAttribute/types';

import { AppProps } from '@/App';
import FileError from '@/components/fileException/FileError';
import useSize from '@/hooks/useSize';
import { InitToolStyleConfig } from '@/store/toolStyle/actionCreators';
import { AnnotationEngine, ImgUtils } from '@labelbee/lb-annotation';
import { i18n } from '@labelbee/lb-utils';
import { IStepInfo } from '@/types/step';
import StepUtils from '@/utils/StepUtils';

interface IProps extends AppState, AppProps {
  imgAttribute: ImgAttributeState;
  imgIndex: number;
  annotationEngine: AnnotationEngine;
  loading: boolean;
  stepList: IStepInfo[];
  step: number;
}

const AnnotationOperation: React.FC<IProps> = (props: IProps) => {
  const [, forceRender] = useState<number>(0);

  const {
    imgAttribute,
    toolStyle,
    toolInstance,
    annotationEngine,
    imgList,
    imgIndex,
    dataInjectionAtCreation,
    renderEnhance,
    customRenderStyle,
    stepList,
    step,
    drawLayerSlot,
  } = props;
  const [annotationPos, setAnnotationPos] = useState({ zoom: 1, currentPos: { x: 0, y: 0 } });
  const annotationRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
    annotationEngine?.setDataInjectionAtCreation(dataInjectionAtCreation);
    annotationEngine?.setRenderEnhance(renderEnhance);
    if (customRenderStyle) {
      annotationEngine?.setCustomRenderStyle(customRenderStyle);
    }
  }, [annotationEngine, dataInjectionAtCreation, renderEnhance, customRenderStyle]);

  useEffect(() => {
    const renderZoom = (zoom: number, currentPos: { x: number; y: number }) => {
      setAnnotationPos({ zoom, currentPos });
    };

    const dragMove = (props: { currentPos: { x: number; y: number }; zoom: number }) => {
      setAnnotationPos(props);
    };

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

      toolInstance.on('renderZoom', renderZoom);
      toolInstance.on('dragMove', dragMove);
    }

    return () => {
      if (toolInstance) {
        toolInstance.unbind('renderZoom', renderZoom);
        toolInstance.unbind('dragMove', dragMove);
      }
    };
  }, [toolInstance]);

  useEffect(() => {
    if (annotationEngine?.setImgAttribute) {
      annotationEngine.setImgAttribute(imgAttribute);
    } else {
      // Old version.
      toolInstance?.setImgAttribute?.(imgAttribute);
    }
  }, [imgAttribute, annotationEngine]);

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

  useEffect(() => {
    // Update StepList When it update by outside
    const currentStepInfo = StepUtils.getCurrentStepInfo(step, stepList);
    toolInstance?.setConfig(currentStepInfo.config);
  }, [stepList]);

  /**
   * 重新加载图片，避免网络问题导致的图片无法加载
   * @returns
   */
  const reloadImg = () => {
    const imgInfo = imgList?.[imgIndex];
    if (!imgInfo?.url) {
      return;
    }

    ImgUtils.load(imgInfo.url).then((imgNode) => {
      annotationEngine.setImgNode(imgNode as HTMLImageElement);
    });
  };

  return (
    <div ref={annotationRef} className='annotationOperation'>
      <div className='canvas' ref={containerRef} style={size} id='toolContainer'>
        {drawLayerSlot?.(annotationPos)}
      </div>
      {toolInstance?.isImgError === true && (
        <FileError
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

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(
  AnnotationOperation,
);
