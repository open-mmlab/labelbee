import React, { useEffect, useState } from 'react';
import { ELLMDataType } from '@/constant';
import { AppState } from '@/store';
import { getStepConfig } from '@/store/annotation/reducer';
import { LabelBeeContext } from '@/store/ctx';
import { jsonParser } from '@/utils';
import { connect } from 'react-redux';
import { ILLMMultiWheelToolConfig } from '../LLMToolView/types';
import useLLMMultiWheelStore from '@/store/LLMMultiWheel';
import { LLMMultiWheelViewCls } from '@/views/MainView/LLMMultiWheelLayout';
import { ToggleDataFormatType } from '../LLMToolView/questionView/components/header';
import DialogView from './dialogView';
import { DrawLayerSlot } from '@/types/main';
import MessageMaskLayer from '../messageMaskLayer';
import AnnotationTips from '@/views/MainView/annotationTips';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { LLMViewCls } from '../LLMToolView/questionView';
import { Layout } from 'antd';
import { i18n } from '@labelbee/lb-utils';
interface IProps {
  annotation?: any;
  showTips?: boolean;
  tips?: string;
  drawLayerSlot?: DrawLayerSlot;
}

interface ILLMMultiWheelSourceViewProps {
  questionIsImg: boolean;
  answerIsImg: boolean;
  LLMConfig?: ILLMMultiWheelToolConfig;
  dialogList: any[];
  lang?: string;
}

export const LLMMultiWheelSourceView: React.FC<ILLMMultiWheelSourceViewProps> = (props) => {
  const { questionIsImg, answerIsImg, LLMConfig, dialogList, lang = 'cn' } = props;
  const { dataFormatType, setDataFormatType } = useLLMMultiWheelStore();

  useEffect(() => {
    if (lang) {
      i18n?.changeLanguage(lang);
    }
  }, [lang]);

  return (
    <I18nextProvider i18n={i18n}>
      <div className={`${LLMMultiWheelViewCls}`}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <ToggleDataFormatType
            dataFormatType={dataFormatType}
            setDataFormatType={setDataFormatType}
          />
        </div>

        <div className={`${LLMMultiWheelViewCls}-container`}>
          {dialogList?.map((item: any, index: number) => (
            <DialogView
              {...item}
              key={index}
              index={index}
              questionIsImg={questionIsImg}
              answerIsImg={answerIsImg}
              LLMConfig={LLMConfig}
            />
          ))}
        </div>
      </div>
    </I18nextProvider>
  );
};

const getInfoFromLLMFile = ({
  type,
  questionIndex,
  answerIndex,
  llmFile,
}: {
  type: string;
  questionIndex: number;
  answerIndex?: number;
  llmFile: any;
}) => {
  if (type === 'question') {
    return llmFile?.find((item: any, fileIndex: number) => questionIndex === fileIndex);
  }
  let info = null;

  llmFile?.forEach((item: any, fileIndex: number) => {
    item.answerList?.forEach((answer: any, currentAnswerIndex: number) => {
      if (fileIndex === questionIndex && answerIndex === currentAnswerIndex) {
        info = answer;
      }
    });
  });
  return info;
};

const LLMMultiWheelView: React.FC<IProps> = (props) => {
  const { annotation, tips, showTips, drawLayerSlot } = props;
  const { imgIndex, imgList, stepList, step, toolInstance } = annotation;
  const [LLMConfig, setLLMConfig] = useState<ILLMMultiWheelToolConfig>();
  const { setSelectedID, newAnswerListMap } = useLLMMultiWheelStore();
  const [dialogList, setDialogList] = useState<any[]>([]);
  const questionIsImg = LLMConfig?.dataType?.prompt === ELLMDataType.Picture;
  const answerIsImg = LLMConfig?.dataType?.response === ELLMDataType.Picture;
  const { t } = useTranslation();
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!imgList[imgIndex]) {
      return;
    }
    const currentData = imgList[imgIndex] ?? {};
    const dialogList = currentData?.questionList?.textList ?? [];

    setDialogList(dialogList);
    if (dialogList?.length) {
      setSelectedID(dialogList[0].id);
    }
  }, [imgIndex]);

  useEffect(() => {
    const currentData = imgList[imgIndex] ?? {};
    const qaData = currentData?.questionList;

    const llmFile = currentData?.llmFile?.textList;

    const textList = qaData?.textList;

    const newDialogList = textList?.map((item: any, questionIndex: number) => {
      return {
        ...item,
        question: questionIsImg
          ? getInfoFromLLMFile({
              type: 'question',
              questionIndex,
              llmFile,
            }) || item?.question
          : item?.question,
        answerList: item?.answerList?.map((i: any, answerIndex: number) => {
          const mapId = `${item?.id ?? ''}-${i?.id ?? ''}`;
          const info = answerIsImg
            ? getInfoFromLLMFile({
                type: 'answer',
                questionIndex,
                answerIndex,
                llmFile,
              }) || {}
            : {};
          return {
            ...i,
            answer: i.answer,
            newAnswer: newAnswerListMap[mapId] ?? i.answer,
            order: answerIndex + 1,
            ...info,
          };
        }),
      };
    });
    setDialogList(newDialogList);
  }, [newAnswerListMap, questionIsImg, answerIsImg]);

  useEffect(() => {
    if (stepList && step) {
      const LLMStepConfig = getStepConfig(stepList, step)?.config;
      setLLMConfig(jsonParser(LLMStepConfig));
    }
  }, [stepList, step]);

  useEffect(() => {
    if (toolInstance) {
      toolInstance.on('validUpdated', () => {
        forceRender((s) => s + 1);
      });
      return () => {
        toolInstance.unbindAll('validUpdated');
      };
    }
  }, [toolInstance]);

  return (
    <Layout className={LLMViewCls}>
      {!toolInstance?.valid && <MessageMaskLayer message={t('InvalidQuestionAndSkip')} />}
      {drawLayerSlot?.({})}
      {showTips === true && <AnnotationTips tips={tips} />}
      <LLMMultiWheelSourceView
        questionIsImg={questionIsImg}
        answerIsImg={answerIsImg}
        LLMConfig={LLMConfig}
        dialogList={dialogList}
      />
    </Layout>
  );
};

const mapStateToProps = (state: AppState) => {
  return {
    annotation: state.annotation,
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(
  LLMMultiWheelView,
);
