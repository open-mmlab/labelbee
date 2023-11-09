/*
 * @file Question view
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2023-04-10
 */

import React, { useEffect, useState } from 'react';
import { Tag, Radio } from 'antd';
import LongText from '@/components/longText';
import { EDataFormatType, prefix } from '@/constant';
import classNames from 'classnames';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { IAnswerList, IModelAPIAnswer, ILLMToolConfig, ITextList  } from '@/components/LLMToolView/types';
import { i18n } from '@labelbee/lb-utils';
import MarkdownView from '@/components/markdownView';
import { FileTextOutlined } from '@ant-design/icons';
import ModelAPIView from '../modelAPIView';
import DiffMatchPatchComponent from '@/components/diffMatchPatchComponent';
interface IProps {
  hoverKey?: number;
  question: string;
  answerList: IAnswerList[];
  modelAPIResponse: IModelAPIAnswer[];
  setModelAPIResponse?: (data: IModelAPIAnswer[]) => void;
  lang?: string;
  checkMode?: boolean;
  annotation?: any;
  LLMConfig?: ILLMToolConfig;
}

export const LLMViewCls = `${prefix}-LLMView`;

const Header = ({
  setDataFormatType,
  dataFormatType,
}: {
  setDataFormatType: (type: EDataFormatType) => void;
  dataFormatType: EDataFormatType;
}) => {
  const { t } = useTranslation();
  return (
    <div
      className={`${LLMViewCls}__title`}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      {t('Title')}
      <span style={{ display: 'flex' }}>
        <Radio.Group
          value={dataFormatType}
          onChange={(e) => {
            setDataFormatType(e.target.value);
          }}
        >
          <Radio.Button
            value={EDataFormatType.Default}
            style={{ textAlign: 'center', width: '52px' }}
          >{`</>`}</Radio.Button>
          <Radio.Button
            value={EDataFormatType.Markdown}
            style={{ textAlign: 'center', width: '52px' }}
          >
            <FileTextOutlined />
          </Radio.Button>
        </Radio.Group>
        <span style={{ marginLeft: '8px', width: '4px', background: '#1890ff' }} />
      </span>
    </div>
  );
};

const RenderAnswer = ({
  i,
  dataFormatType,
  isTextControl
}: {
  i: IAnswerList;
  dataFormatType: EDataFormatType;
  isTextControl: boolean;
}) => {
  if (dataFormatType === EDataFormatType.Markdown) {
    return <MarkdownView value={i?.newAnswer ?? i?.answer} />;
  }
  if (isTextControl) {
    return <DiffMatchPatchComponent originString={i?.answer} currentString={i?.newAnswer} />;
  }
  return <div>{i?.answer}</div>;
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
    LLMConfig
  } = props;
  const [dataFormatType, setDataFormatType] = useState(EDataFormatType.Default);
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
    return false
  }

  return (
    <div className={LLMViewCls}>
      <div className={`${LLMViewCls}__textBox`} style={{ borderBottom: '1px solid #EBEBEB' }}>
        <Header setDataFormatType={setDataFormatType} dataFormatType={dataFormatType} />
        <div className={`${LLMViewCls}__content`}>
          {dataFormatType === EDataFormatType.Markdown ? (
            <MarkdownView value={question} />
          ) : (
            <LongText wordCount={200} text={question} />
          )}
        </div>
      </div>
      <div className={`${LLMViewCls}__textBox`}>
        <div className={`${LLMViewCls}__title`}>{t('Answer')}</div>
        {answerList.map((i: IAnswerList, index: number) => {
          const isTextControl = getTextControlByConfig(i)
          return (
            <div
              className={classNames({
                [`${LLMViewCls}__content`]: true,
                [`${LLMViewCls}__contentActive`]: hoverKey === i?.order,
              })}
              key={index}
            >
              <Tag
                style={{
                  color: '#666FFF',
                  background: '#eeefff',
                  height: '20px',
                  padding: '0px 8px',
                  border: 'none',
                }}
              >
                {i?.order}
              </Tag>
              <RenderAnswer i={i} isTextControl={isTextControl} dataFormatType={dataFormatType} />
            </div>
          );
        })}
         <ModelAPIView
          dataFormatType={dataFormatType}
          modelAPIResponse={modelAPIResponse}
          question={question}
          setModelAPIResponse={setModelAPIResponse}
          checkMode={checkMode}
          annotation={props.annotation}
        />
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
