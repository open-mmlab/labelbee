/*
 * @file LLM tool view
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2023-04-10
 */

import React, { useContext, useEffect, useState } from 'react';
import { AppState } from '@/store';
import { connect } from 'react-redux';
import { LabelBeeContext, LLMContext } from '@/store/ctx';
import { message } from 'antd';
import { ELLMDataType, prefix } from '@/constant';
import { Layout } from 'antd/es';
import QuestionView from './questionView';
import { useTranslation } from 'react-i18next';
import { IAnswerList, ILLMToolConfig } from './types';
import AnnotationTips from '@/views/MainView/annotationTips';
import { getCurrentResultFromResultList } from './utils/data';
import { getStepConfig } from '@/store/annotation/reducer';
import { jsonParser } from '@/utils';

interface IProps {
  checkMode?: boolean;
  annotation?: any;
  showTips?: boolean;
  tips?: string;
}
const LLMViewCls = `${prefix}-LLMView`;
const LLMToolView: React.FC<IProps> = (props) => {
  const { annotation, checkMode = true, tips, showTips } = props;
  const { imgIndex, imgList, stepList, step } = annotation;
  const { hoverKey, modelAPIResponse, setModelAPIResponse, newAnswerList } = useContext(LLMContext);
  const [answerList, setAnswerList] = useState<IAnswerList[]>([]);
  const [question, setQuestion] = useState<string>('');
  const [LLMConfig, setLLMConfig] = useState<ILLMToolConfig>();

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
    const questionIsImg = LLMConfig?.dataType?.prompt === ELLMDataType.Picture;
    const answerIsImg = LLMConfig?.dataType?.response === ELLMDataType.Picture;

    const qaData = imgList[imgIndex]?.questionList;

    const llmFile = imgList[imgIndex]?.llmFile;
    const titleQuestion = questionIsImg ? llmFile?.question : qaData?.question;
    setQuestion(titleQuestion);
    let list = qaData?.answerList || [];
    if (answerIsImg) {
      list = llmFile?.answerList || [];
    }
    if (LLMConfig?.dataType?.response === ELLMDataType.None) {
      list = [];
    }
    if (LLMConfig?.dataType?.response === ELLMDataType.Text) {
      if (newAnswerList?.length > 0) {
        list = newAnswerList;
      }
    }
    setAnswerList(list);
  }, [imgIndex, newAnswerList, LLMConfig]);

  useEffect(() => {
    if (!imgList[imgIndex]) {
      return;
    }
    const currentData = imgList[imgIndex] ?? {};
    const result = getCurrentResultFromResultList(currentData?.result);
    const currentResult = result?.length > 0 ? result[0] : result;
    setModelAPIResponse(currentResult?.modelAPIResponse || []);
  }, [imgIndex]);

  useEffect(() => {
    if (stepList && step) {
      const LLMStepConfig = getStepConfig(stepList, step)?.config;
      setLLMConfig(jsonParser(LLMStepConfig));
    }
  }, [stepList, step]);

  return (
    <Layout className={LLMViewCls}>
      <div className={`${LLMViewCls}-question`}>
        {showTips === true && <AnnotationTips tips={tips} />}
        <QuestionView
          hoverKey={hoverKey}
          question={question}
          answerList={answerList}
          modelAPIResponse={modelAPIResponse}
          setModelAPIResponse={setModelAPIResponse}
          checkMode={checkMode}
          annotation={annotation}
          LLMConfig={LLMConfig}
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

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(LLMToolView);
