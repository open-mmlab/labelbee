import { Tag } from 'antd';
import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import loadingSvg from '@/assets/annotation/LLMTool/loading.svg';
import MarkdownView from '@/components/markdownView';
import { EDataFormatType } from '@/constant';
import { getStepConfig } from '@/store/annotation/reducer';
import { jsonParser } from '@/utils';
import { InfoCircleFilled, SyncOutlined } from '@ant-design/icons';

import { LLMViewCls } from '../questionView';
import { ILLMToolConfig, IModelAPIAnswer } from '../types';
import { i18n } from '@labelbee/lb-utils';

interface IProps {
  dataFormatType: EDataFormatType;
  checkMode: boolean;
  annotation?: any;
  modelAPIResponse: IModelAPIAnswer[];
  question: string;
  setModelAPIResponse?: React.Dispatch<React.SetStateAction<IModelAPIAnswer[]>>;
}

const RenderContent = ({
  dataFormatType,
  answer,
}: {
  dataFormatType: EDataFormatType;
  answer: string;
}) => {
  if (dataFormatType === EDataFormatType.Markdown) {
    return <MarkdownView value={answer} />;
  }

  return <span>{answer}</span>;
};

const getAnswer = (id: string, modelAPIResponse: IModelAPIAnswer[]) => {
  return modelAPIResponse.find((i) => i.id === id)?.answer;
};
// @ts-ignore
const ModelAPIView: React.FC<IProps> = (props) => {
  const {
    annotation = {},
    checkMode,
    dataFormatType,
    modelAPIResponse,
    question,
    setModelAPIResponse,
  } = props;
  const { stepList, step, toolInstance } = annotation;
  const [LLMConfig, setLLMConfig] = useState<ILLMToolConfig>();
  const [loadingModelIDs, setLoadingModelIDs] = useState<string[]>([]);
  const { enableModelAPI = false, modelAPIConfigList = [] } = LLMConfig || {};

  useEffect(() => {
    if (toolInstance) {
      toolInstance.loading = loadingModelIDs?.length > 0;
    }
  }, [loadingModelIDs]);

  const updateModelAPIResponse = useCallback(
    (res: IModelAPIAnswer) => {
      setModelAPIResponse?.((prev) => {
        let found = false;
        const newModelAPIResponse = prev.map((i: IModelAPIAnswer) => {
          if (i.id === res.id) {
            found = true;
            return res;
          }
          return i;
        });

        if (!found) {
          newModelAPIResponse.push(res);
        }

        return newModelAPIResponse;
      });
    },
    [modelAPIResponse],
  );

  useEffect(() => {
    if (stepList && step) {
      const LLMStepConfig = getStepConfig(stepList, step)?.config;
      setLLMConfig(jsonParser(LLMStepConfig));
    }
  }, [stepList, step]);

  if (!enableModelAPI) {
    return null;
  }

  return modelAPIConfigList?.map?.((i: any) => (
    <ModelAPIContent
      dataFormatType={dataFormatType}
      config={i}
      modelAPIResponse={modelAPIResponse}
      key={i?.id}
      toolInstance={toolInstance}
      setLoadingModelIDs={setLoadingModelIDs}
      question={question}
      updateModelAPIResponse={updateModelAPIResponse}
      checkMode={checkMode}
    />
  ));
};

const LoadingMessage = () => {
  return (
    <div
      className={classNames({
        [`${LLMViewCls}__loading`]: true,
      })}
    >
      {i18n.t('AnswersAreBeingGenerated')}
      <img src={loadingSvg} />
    </div>
  );
};

const FailedMessage = () => {
  return (
    <span
      className={classNames({
        [`${LLMViewCls}__failed`]: true,
      })}
    >
      {i18n.t('AnswerGenerationFailedPleaseTryAgainLater')} <InfoCircleFilled />
    </span>
  );
};

const ModelAPIContent = ({
  dataFormatType,
  config,
  modelAPIResponse,
  toolInstance,
  setLoadingModelIDs,
  question,
  updateModelAPIResponse,
  checkMode,
}: {
  dataFormatType: EDataFormatType;
  config: any;
  modelAPIResponse: any;
  toolInstance: any;
  setLoadingModelIDs: any;
  question: string;
  updateModelAPIResponse: (res: IModelAPIAnswer) => void;
  checkMode: boolean;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  const answer = getAnswer(config?.id, modelAPIResponse);

  const syncLoading = (loading: boolean) => {
    setLoading(loading);
    setLoadingModelIDs((prev: string[]) => {
      if (loading) {
        return [...prev, config?.id];
      }
      return prev.filter((i) => i !== config?.id);
    });
  };

  const refreshAnswer = async () => {
    syncLoading(true);
    setFailed(false);

    try {
      const result = await toolInstance?.getAPIAnswer(config, question);
      updateModelAPIResponse({
        id: config?.id,
        answer: result,
        name: config?.name,
      });
    } catch (error) {
      setFailed(true);
    } finally {
      syncLoading(false);
    }
  };

  useEffect(() => {
    setFailed(false);
  }, [question]);

  return (
    <div
      className={classNames({
        [`${LLMViewCls}__content`]: true,
      })}
      key={config?.id}
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
        {config?.name}
      </Tag>
      <div
        className={classNames({
          [`${LLMViewCls}__answer`]: true,
        })}
      >
        {!loading && answer && <RenderContent dataFormatType={dataFormatType} answer={answer} />}

        <div
          className={classNames({
            [`${LLMViewCls}__message`]: true,
          })}
        >
          {loading ? <LoadingMessage /> : failed && <FailedMessage />}
        </div>

        {!loading && !checkMode && (
          <div
            className={classNames({
              [`${LLMViewCls}__footer`]: true,
            })}
          >
            <span onClick={refreshAnswer}>
              {i18n.t('ReGenerate')}
              <SyncOutlined />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelAPIView;
