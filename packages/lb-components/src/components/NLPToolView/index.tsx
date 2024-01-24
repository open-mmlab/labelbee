/*
 * @file NLP tool view
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2024-01-24
 */

import React, { useContext, useEffect, useState } from 'react';
import { AppState } from '@/store';
import { connect } from 'react-redux';
import { LabelBeeContext, NLPContext } from '@/store/ctx';
import { message } from 'antd';
import { ELLMDataType, prefix } from '@/constant';
import { Layout } from 'antd/es';
import TextContent from './textContent';
import { useTranslation } from 'react-i18next';
import { ITextList, INLPToolConfig, ITextData } from './types';
import AnnotationTips from '@/views/MainView/annotationTips';
import { getStepConfig } from '@/store/annotation/reducer';
import { jsonParser } from '@/utils';
import { getCurrentResultFromResultList } from '../LLMToolView/utils/data';

interface IProps {
  checkMode?: boolean;
  annotation?: any;
  showTips?: boolean;
  tips?: string;
}
const LLMViewCls = `${prefix}-LLMView`;
const NLPToolView: React.FC<IProps> = (props) => {
  const { annotation, checkMode = true, tips, showTips } = props;
  const { imgIndex, imgList, stepList, step } = annotation;
  const { highlightKey } = useContext(NLPContext);

  const [NLPConfig, setNLPConfig] = useState<INLPToolConfig>();
  const [textData, setTextData] = useState<ITextData[]>([
    {
      content: '',
    },
  ]);

  const { t } = useTranslation();

  useEffect(() => {
    let interval: undefined | ReturnType<typeof setInterval>;

    if (!checkMode) {
      interval = setInterval(() => {
        message.info(t('EfficientListening'));
      }, 1000 * 60);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (!imgList[imgIndex]) {
      return;
    }
    const textData = imgList[imgIndex]?.textData;
    setTextData(textData);
  }, [imgIndex, NLPConfig]);

  useEffect(() => {
    if (!imgList[imgIndex]) {
      return;
    }
    const currentData = imgList[imgIndex] ?? {};
    const result = getCurrentResultFromResultList(currentData?.result);
    const currentResult = result?.length > 0 ? result[0] : result;
  }, [imgIndex]);

  useEffect(() => {
    if (stepList && step) {
      const NLPStepConfig = getStepConfig(stepList, step)?.config;
      setNLPConfig(jsonParser(NLPStepConfig));
    }
  }, [stepList, step]);

  return (
    <Layout className={LLMViewCls}>
      <div className={`${LLMViewCls}-question`}>
        {showTips === true && <AnnotationTips tips={tips} />}
        <TextContent
          highlightKey={highlightKey}
          textData={textData}
          checkMode={checkMode}
          annotation={annotation}
          NLPConfig={NLPConfig}
        />
      </div>
    </Layout>
  );
};

const mapStateToProps = (state: AppState) => {
  return {
    annotation: state.annotation,
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(NLPToolView);
