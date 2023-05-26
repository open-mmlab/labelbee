/*
 * @file Question view
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2023-04-10
 */

import React from 'react';
import { Tag } from 'antd';
import LongText from '@/components/longText';
import { prefix } from '@/constant';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { IAnswerList } from '@/components/LLMToolView/types';

interface IProps {
  hoverKey?: number;
  question: any;
  answerList: IAnswerList[];
}
const LLMViewCls = `${prefix}-LLMView`;
const QuestionView: React.FC<IProps> = (props) => {
  const { hoverKey, question, answerList } = props;
  const { t } = useTranslation();
  return (
    <div className={LLMViewCls}>
      <div className={`${LLMViewCls}__textBox`} style={{ borderBottom: '1px solid #EBEBEB' }}>
        <div className={`${LLMViewCls}__title`}>{t('Title')}</div>
        <div className={`${LLMViewCls}__content`}>
          <LongText wordCount={200} text={question} />
        </div>
      </div>
      <div className={`${LLMViewCls}__textBox`}>
        <div className={`${LLMViewCls}__title`}>{t('Answer')}</div>
        {answerList.map((i: IAnswerList, index: number) => (
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
            <LongText wordCount={1000} text={i?.answer} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionView;
