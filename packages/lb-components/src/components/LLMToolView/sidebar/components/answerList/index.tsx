/*
 * @file LLM tool score
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2023-04-10
 */
import React, { useContext } from 'react';
import { prefix } from '@/constant';
import { Tag, Collapse, Popover } from 'antd';
import { useTranslation } from 'react-i18next';
import ScoreGroupButton from '../scoreGroupButton';
import DetermineGroup from '../determineGroup';
import { LLMContext } from '@/store/ctx';
import { classnames } from '@/utils';
import { InfoCircleOutlined } from '@ant-design/icons';
import { expandIconFuc } from '@/views/MainView/sidebar/TagSidebar';
import {
  IndicatorScore,
  IndicatorDetermine,
  ILLMToolConfig,
  IAnswerList,
  ITextList,
} from '@/components/LLMToolView/types';
import { isBoolean } from 'lodash';
import LongText from '@/components/longText';
import TextEditor from '../textEditor';

interface IProps {
  list?: IAnswerList[];
  checkMode?: boolean;
  LLMConfig?: ILLMToolConfig;
  updateValue: ({
    order,
    value,
    key,
  }: {
    order: number;
    value: number | string | { key: string; value: number | boolean };
    key?: string;
  }) => void;
}

enum ETagType {
  Finish,
  UnFinish,
  Default,
}

const { Panel } = Collapse;
const LLMSidebarCls = `${prefix}-LLMSidebar`;
const AnswerList = (props: IProps) => {
  const { list = [], LLMConfig, updateValue, checkMode } = props;

  const { hoverKey, setHoverKey } = useContext(LLMContext);
  const { t } = useTranslation();
  const isDisableAll = checkMode;

  const getFinishStatus = (i: IAnswerList) => {
    const {
      indicatorScore = [],
      indicatorDetermine = [],
      textEdit = [],
      isTextEdit = false,
    } = LLMConfig || {};

    let finishStatus = ETagType.Default;
    // Indicator score verification
    if (indicatorScore?.length > 0) {
      const scoreUnFinish = indicatorScore.some(
        (item: IndicatorScore) =>
          !i?.indicatorScore?.[item.value] || i?.indicatorScore?.[item.value] > Number(item?.score),
      );
      if (scoreUnFinish) {
        finishStatus = ETagType.UnFinish;
        return finishStatus;
      }
      finishStatus = ETagType.Finish;
    }
    // Indicator judgment verification
    if (indicatorDetermine?.length > 0) {
      const determineUnFinish = indicatorDetermine.some((item: IndicatorDetermine) => {
        const determineResult = i?.indicatorDetermine?.[item.value];
        return !isBoolean(determineResult);
      });
      if (determineUnFinish) {
        finishStatus = ETagType.UnFinish;
        return finishStatus;
      }
      finishStatus = ETagType.Finish;
    }
    // Answer text editing check
    if (isTextEdit && textEdit?.length > 0) {
      // Configuration that matches the current answer
      const textEditconfigObj = textEdit.filter((v: ITextList) => v?.title === i.order)[0];
      const { min } = textEditconfigObj || {};
      const newValue = i?.newAnswer || '';

      const textEditUnFinish = min && newValue?.length < Number(min);
      if (textEditUnFinish) {
        finishStatus = ETagType.UnFinish;
        return finishStatus;
      }
      finishStatus = ETagType.Finish;
    }

    return finishStatus;
  };

  const getTagStyle = (item: IAnswerList) => {
    const tagStatus = getFinishStatus(item);

    let tagText = item?.order || '';
    switch (tagStatus) {
      case ETagType.Finish:
        return {
          backgroundColor: '#D9FFDF',
          fontColor: '#36B34A',
          tagText: `${tagText} ${t('Finished')}`,
          tagStatus,
        };
      case ETagType.UnFinish:
        return {
          backgroundColor: '#FFD9D9',
          fontColor: '#F26549',
          tagText: `${tagText} ${t('Unfinished')}`,
          tagStatus,
        };

      default:
        return {
          backgroundColor: '#EBEBEB',
          fontColor: '#999999',
          tagText,
          tagStatus,
        };
    }
  };

  const getAnswerTextEditConfig = (answer: IAnswerList, textEdit: ITextList[]) =>
    textEdit.filter((i) => i?.title === answer.order)[0];

  return (
    <Collapse
      bordered={false}
      expandIcon={expandIconFuc}
      expandIconPosition='end'
      defaultActiveKey={
        list.length > 0 ? list.map((i: IAnswerList, index: number) => index) : undefined
      }
      style={{ margin: '16px 0px', background: '#fff' }}
    >
      {list.map((i: IAnswerList, index: number) => {
        const {
          indicatorScore = [],
          indicatorDetermine = [],
          textEdit = [],
          isTextEdit = false,
        } = LLMConfig || {};
        const { backgroundColor, fontColor, tagText, tagStatus } = getTagStyle(i);
        const textEditObject = getAnswerTextEditConfig(i, textEdit) || {};

        const header = (
          <div
            style={{ display: 'flex', width: '500px', alignItems: 'center', whiteSpace: 'nowrap' }}
            onMouseMove={() => {
              setHoverKey(i.order);
            }}
            onMouseLeave={() => {
              setHoverKey(-1);
            }}
          >
            <Tag color={backgroundColor} style={{ color: fontColor, padding: '0px 8px' }}>
              {tagText}
            </Tag>
            {i.answer && (
              <span
                style={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  lineHeight: '32px',
                  paddingRight: '24px',
                }}
              >
                {i.answer}
              </span>
            )}
          </div>
        );

        return (
          <Panel
            header={header}
            key={index}
            className={classnames({
              [`${LLMSidebarCls}-panel`]: true,
              [`${LLMSidebarCls}-panelHover`]: hoverKey === i.order,
              [`${LLMSidebarCls}-errorPanel`]: tagStatus === ETagType.UnFinish,
            })}
          >
            {/* Indicator score  */}
            {indicatorScore?.length > 0 &&
              indicatorScore.map((item: IndicatorScore, index: number) => {
                const { label, text, value, score } = item;
                const renderTitle = (
                  <div className={`${LLMSidebarCls}-indicatorScore`}>
                    <LongText text={label} openByText={true} />
                    {text && (
                      <Popover
                        placement='bottom'
                        content={text}
                        overlayClassName={`${LLMSidebarCls}-indicatorScore-title`}
                      >
                        <InfoCircleOutlined style={{ margin: '0px 4px', cursor: 'pointer' }} />
                      </Popover>
                    )}
                  </div>
                );
                return label && score ? (
                  <ScoreGroupButton
                    score={score}
                    title={renderTitle}
                    selectScore={i?.indicatorScore?.[value]}
                    updateScore={(score) => {
                      const values = {
                        key: value,
                        value: score,
                      };
                      updateValue({ order: i.order, value: values, key: 'indicatorScore' });
                    }}
                    key={index}
                    isDisableAll={isDisableAll}
                  />
                ) : null;
              })}
            {/* Indicator judgment */}
            {indicatorDetermine?.length > 0 &&
              indicatorDetermine.map((item: IndicatorDetermine, index: number) => {
                const { label, value } = item;

                return label ? (
                  <DetermineGroup
                    selectValue={i?.indicatorDetermine?.[value]}
                    title={label}
                    updateValue={(changeValue) => {
                      const values = {
                        key: value,
                        value: changeValue,
                      };
                      updateValue({ order: i.order, value: values, key: 'indicatorDetermine' });
                    }}
                    key={index}
                    isDisableAll={isDisableAll}
                  />
                ) : null;
              })}
            {/* Text Editor */}
            {isTextEdit && (
              <TextEditor
                checkMode={checkMode}
                newAnswer={i?.newAnswer}
                textEditObject={textEditObject}
                updateValue={(changeValue) => {
                  updateValue({ order: i.order, value: changeValue, key: 'textEdit' });
                }}
                answerIndex={index}
              />
            )}
          </Panel>
        );
      })}
    </Collapse>
  );
};

export default AnswerList;
