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

interface IProps {
  annotation?: any;
}

interface ILLMMultiWheelSourceViewProps {
  questionIsImg: boolean;
  answerIsImg: boolean;
  LLMConfig?: ILLMMultiWheelToolConfig;
  dialogList: any[];
}

export const LLMMultiWheelSourceView: React.FC<ILLMMultiWheelSourceViewProps> = (props) => {
  const { questionIsImg, answerIsImg, LLMConfig, dialogList } = props;
  const { dataFormatType, setDataFormatType } = useLLMMultiWheelStore();
  return (
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
  );
};

const LLMMultiWheelView: React.FC<IProps> = (props) => {
  const { annotation } = props;
  const { imgIndex, imgList, stepList, step } = annotation;
  const [LLMConfig, setLLMConfig] = useState<ILLMMultiWheelToolConfig>();
  const { setSelectedID } = useLLMMultiWheelStore();
  const [dialogList, setDialogList] = useState([]);
  const questionIsImg = LLMConfig?.dataType?.prompt === ELLMDataType.Picture;
  const answerIsImg = LLMConfig?.dataType?.response === ELLMDataType.Picture;
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
    if (stepList && step) {
      const LLMStepConfig = getStepConfig(stepList, step)?.config;
      setLLMConfig(jsonParser(LLMStepConfig));
    }
  }, [stepList, step]);

  return (
    <LLMMultiWheelSourceView
      questionIsImg={questionIsImg}
      answerIsImg={answerIsImg}
      LLMConfig={LLMConfig}
      dialogList={dialogList}
    />
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
