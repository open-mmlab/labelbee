/*
 * @file Question view
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2023-04-10
 */

import React, { useEffect, useState } from 'react';
import { Tag } from 'antd';
import { EDataFormatType, ELLMDataType, prefix } from '@/constant';
import classNames from 'classnames';
import { useTranslation, I18nextProvider } from 'react-i18next';
import {
  IAnswerList,
  IModelAPIAnswer,
  ILLMToolConfig,
  ITextList,
} from '@/components/LLMToolView/types';
import { i18n } from '@labelbee/lb-utils';
import MarkdownView from '@/components/markdownView';
import ModelAPIView from '../modelAPIView';
import DiffMatchPatchComponent from '@/components/diffMatchPatchComponent';
import Header from './components/header';
import ImgView from './components/imgView';
import { isString } from 'lodash';

interface IProps {
  hoverKey?: number;
  question:
  | string
  | {
    id: number;
    path: string;
    url: string;
    processedUrl: string;
    thumbnail: string;
  };
  answerList: IAnswerList[];
  modelAPIResponse: IModelAPIAnswer[];
  setModelAPIResponse?: React.Dispatch<React.SetStateAction<IModelAPIAnswer[]>>;
  lang?: string;
  checkMode?: boolean;
  annotation?: any;
  LLMConfig?: ILLMToolConfig;
  answerHeaderSlot?: React.ReactDOM | string;
}

export const LLMViewCls = `${prefix}-LLMView`;

const RenderAnswer = ({
  i,
  dataFormatType,
  isTextControl,
}: {
  i: IAnswerList;
  dataFormatType: EDataFormatType;
  isTextControl: boolean;
}) => {
  if (dataFormatType === EDataFormatType.Markdown) {
    return <MarkdownView value={i?.newAnswer ?? i?.answer} />;
  }
  if (isTextControl) {
    return (
      <div style={{ width: '100%', overflowWrap: 'break-word' }}>
        <DiffMatchPatchComponent originString={i?.answer} currentString={i?.newAnswer} />
      </div>
    );
  }
  return <div style={{ whiteSpace: 'pre-wrap' }}>{i?.answer}</div>;
};

const QuestionView: React.FC<IProps> = (props) => {
  const {
    hoverKey,
    answerList,
    question,
    lang,
    modelAPIResponse,
    setModelAPIResponse,
    checkMode = true,
    LLMConfig,
    answerHeaderSlot
  } = props;
  const [dataFormatType, setDataFormatType] = useState(EDataFormatType.Default);
  const questionIsImg = LLMConfig?.dataType?.prompt === ELLMDataType.Picture;
  const answerIsImg = LLMConfig?.dataType?.response === ELLMDataType.Picture;
  const { t } = useTranslation();

  useEffect(() => {
    if (lang) {
      i18n?.changeLanguage(lang);
    }
  }, []);

  const getTextControlByConfig = (result: IAnswerList) => {
    if (LLMConfig?.isTextEdit) {
      const textEdit = LLMConfig?.textEdit || [];
      return !!textEdit.filter((v: ITextList) => v?.title === result.order)[0]?.textControl;
    }
    return false;
  };

  const textAnswer = (
    <div>
      {answerList.map((i: IAnswerList, index: number) => {
        const isTextControl = getTextControlByConfig(i);
        return (
          <div
            className={classNames({
              [`${LLMViewCls}__content`]: true,
              [`${LLMViewCls}__contentActive`]: hoverKey === i?.order,
            })}
            key={index}
          >
            <Tag className={`${LLMViewCls}__tag`}>{i?.order}</Tag>
            <RenderAnswer i={i} isTextControl={isTextControl} dataFormatType={dataFormatType}/>
          </div>
        );
      })}
      {isString(question) && (
        <ModelAPIView
          dataFormatType={dataFormatType}
          modelAPIResponse={modelAPIResponse}
          question={question}
          setModelAPIResponse={setModelAPIResponse}
          checkMode={checkMode}
          annotation={props.annotation}
        />
      )}
    </div>
  );
  return (
    <div className={LLMViewCls}>
      <Header
        question={question}
        dataFormatType={dataFormatType}
        setDataFormatType={setDataFormatType}
        isImg={questionIsImg}
      />
      <div className={`${LLMViewCls}__textBox`}>
        <div className={`${LLMViewCls}__title`}>{t('Answer')} {answerHeaderSlot}</div>
        {answerIsImg ? <ImgView hoverKey={hoverKey} answerList={answerList} /> : textAnswer}
      </div>
    </div>
  );
};

const WrapQuestionView = (props: IProps) => {
  return (
    <I18nextProvider i18n={i18n}>
      <QuestionView {...props} />
    </I18nextProvider>
  );
};

export default WrapQuestionView;
