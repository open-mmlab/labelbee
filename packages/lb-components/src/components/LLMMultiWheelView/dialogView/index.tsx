import { getTextControlByConfig, RenderAnswer } from '@/components/LLMToolView/questionView';
import { RenderQuestion } from '@/components/LLMToolView/questionView/components/header';
import ImgView from '@/components/LLMToolView/questionView/components/imgView';
import { ILLMMultiWheelToolConfig } from '@/components/LLMToolView/types';
import useLLMMultiWheelStore from '@/store/LLMMultiWheel';
import { classnames } from '@/utils';
import { Button } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface IDialogViewProps {
  id: number | string;
  answerList: any;
  question: any;
  name?: string;
  index: number;
  isSelected: boolean;
  answerIsImg: boolean;
  questionIsImg: boolean;
  LLMConfig?: ILLMMultiWheelToolConfig;
}

const DialogView = (props: IDialogViewProps) => {
  const {
    id,
    answerList,
    question,
    index,
    name = '',
    answerIsImg,
    questionIsImg,
    LLMConfig,
  } = props;
  const { t } = useTranslation();
  const { dataFormatType, selectedID, setSelectedID } = useLLMMultiWheelStore();

  const order = index + 1;
  const showName = name || `${t('Dialog')}${order}`;

  return (
    <div
      key={id}
      onClick={() => setSelectedID(id)}
      className={classnames({
        dialog: true,
        selected: id === selectedID,
      })}
    >
      <div className={`header`}>
        <span className={`order`}>{order}</span>
        <div className={`name`}>
          <div className={`show-name`}>{showName}</div>
          <div className={`tips`}>（{t('SelectionOfAnnotation')}）</div>
        </div>
      </div>
      <div className={`dialog-question`}>
        <Button type='primary'>
          {t('Title')}
          {order}
        </Button>
        <div>
          <RenderQuestion
            question={question}
            dataFormatType={dataFormatType}
            isImg={questionIsImg}
          />
        </div>
      </div>
      <div className={`dialog-answer`}>
        {answerIsImg ? (
          <>
            <Button type='primary'>{t('Answer')}</Button>
            <ImgView answerList={answerList} />
          </>
        ) : (
          answerList?.map((item: any, index: number) => {
            const order = index + 1;
            const answer = { ...item, order };
            const isTextControl = getTextControlByConfig(answer, LLMConfig);
            return (
              <div key={index}>
                <Button type='primary'>
                  {t('Answer')}
                  {order}
                </Button>
                <RenderAnswer
                  i={answer}
                  isTextControl={isTextControl}
                  dataFormatType={dataFormatType}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DialogView;
