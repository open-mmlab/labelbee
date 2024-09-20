import useLLMMultiWheelStore from '@/store/LLMMultiWheel';
import { classnames } from '@/utils';
import { LLMMultiWheelViewCls } from '@/views/MainView/LLMMultiWheelLayout';
import { Button } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
// import { LLMMultiWheelViewCls } from '..';

interface IDialogViewProps {
  id: number | string;
  answerList: any;
  question: any;
  name?: string;
  index: number;
  isSelected: boolean;
}

const DialogView = (props: IDialogViewProps) => {
  const { id, answerList, question, index, name = '' } = props;
  const { dataFormatType, setDataFormatType, selectedID, setSelectedID } = useLLMMultiWheelStore();
  const order = index + 1;
  const showName = name || `对话${order}`;

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
          <div className={`tips`}>（选中标注）</div>
        </div>
      </div>
      <div className={`dialog-question`}>
        <Button type='primary'>题目{order}</Button>
        <div>{question}</div>
      </div>
      <div className={`dialog-answer`}>
        {answerList.map((item: any, index: number) => (
          <div key={index}>
            <Button type='primary'>答案{index + 1}</Button>
            <div>{item.answer}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DialogView;
