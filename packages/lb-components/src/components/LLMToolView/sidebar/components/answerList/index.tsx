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
} from '@/components/LLMToolView/types';
import { isBoolean } from 'lodash';
import LongText from '@/components/longText';

interface IProps {
  list?: IAnswerList[];
  checkMode?: boolean;
  LLMConfig?: ILLMToolConfig;
  setHoverKey: (value: number) => void;
  updateValue: ({
    order,
    value,
    key,
  }: {
    order: number;
    value: number | { key: string; value: number | boolean };
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
  const { list = [], LLMConfig = {}, updateValue, checkMode } = props;

  const { hoverKey, setHoverKey } = useContext(LLMContext);
  const { t } = useTranslation();
  const isDisableAll = checkMode;

  const getFinishStatus = (i: IAnswerList) => {
    const { indicatorScore = [], indicatorDetermine = [], score } = LLMConfig;

    let finishStatus = ETagType.Default;
    if (score) {
      if (!i.score) {
        finishStatus = ETagType.UnFinish;
        return finishStatus;
      }
      finishStatus = ETagType.Finish;
    }
    if (indicatorScore?.length > 0) {
      const scoreUnFinish = indicatorScore.some(
        (item: IndicatorScore) => !i?.indicatorScore?.[item.value],
      );
      if (scoreUnFinish) {
        finishStatus = ETagType.UnFinish;
        return finishStatus;
      }
      finishStatus = ETagType.Finish;
    }
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

    return finishStatus;
  };

  const getTagStyle = (item: IAnswerList) => {
    const tagStatus = getFinishStatus(item);

    let tagText = item.order;
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

  return (
    <Collapse
      bordered={false}
      expandIcon={expandIconFuc}
      expandIconPosition='end'
      defaultActiveKey={
        list.length > 0 ? list.map((i: IAnswerList, index: number) => index) : undefined
      }
      style={{ margin: '16px 0px' }}
    >
      {list.map((i: IAnswerList, index: number) => {
        const { score, indicatorScore = [], indicatorDetermine = [] } = LLMConfig;
        const { backgroundColor, fontColor, tagText, tagStatus } = getTagStyle(i);

        const noIndicatorScore =
          indicatorScore?.filter((i: IndicatorScore) => i.label && i.value && i.score)?.length > 0;

        const noIndicatorDetermine =
          indicatorDetermine?.filter((i: IndicatorDetermine) => i.label && i.value)?.length > 0;

        const noConfig = !(score || noIndicatorScore || noIndicatorDetermine);
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
            {/* 整体评分 */}
            {score && (
              <ScoreGroupButton
                selectScore={i.score}
                score={score}
                title={t('OverallScore')}
                updateScore={(score) => updateValue({ order: i.order, value: score })}
                isDisableAll={isDisableAll}
              />
            )}
            {/* 指标评分 */}
            {indicatorScore?.length > 0 &&
              indicatorScore.map((item: IndicatorScore, index: number) => {
                const { label, text, value, score } = item;
                const renderTitle = (
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <LongText text={label} openByText={true} />
                    {text && (
                      <Popover placement='bottom' content={text}>
                        <InfoCircleOutlined style={{ margin: '0px 4px', cursor: 'pointer' }} />
                      </Popover>
                    )}
                  </span>
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
            {/* 指标判断 */}
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

            {noConfig && (
              <div style={{ padding: '8px 0px', color: '#CCCCCC' }}>{t('NoScoringScale')}</div>
            )}
          </Panel>
        );
      })}
    </Collapse>
  );
};

export default AnswerList;
