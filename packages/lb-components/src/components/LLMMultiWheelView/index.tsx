import React, { useContext, useEffect, useState } from 'react';

import { connect } from 'react-redux';
import { AppState } from '@/store';
import { getStepConfig } from '@/store/annotation/reducer';
import { getCurrentResultFromResultList } from '../LLMToolView/utils/data';
import { jsonParser } from '@/utils';
import { ILLMMultiWheelToolConfig } from '../LLMToolView/types';
import { ELLMDataType, prefix } from '@/constant';
import { Layout } from 'antd/es';
import { LabelBeeContext } from '@/store/ctx';
import QuestionView from '../LLMToolView/questionView';
import DialogView from './dialogView';
import { LLMMultiWheelViewCls } from '@/views/MainView/LLMMultiWheelLayout';
import useLLMMultiWheelStore from '@/store/LLMMultiWheel';

interface IProps {
  annotation?: any;
}

const LLMMultiWheelView: React.FC<IProps> = (props) => {
  const { annotation } = props;
  const { imgIndex, imgList, stepList, step, toolInstance } = annotation;
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
    <div className={`${LLMMultiWheelViewCls}-container`}>
      {dialogList?.map((item: any, index) => (
        <DialogView
          {...item}
          key={index}
          index={index}
          isSelected={true}
          questionIsImg={questionIsImg}
          answerIsImg={answerIsImg}
          LLMConfig={LLMConfig}
        />
      ))}
    </div>
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
