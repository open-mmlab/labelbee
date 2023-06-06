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
import DetermineGroup from '../DetermineGroup';
import { LLMContext } from '@/views/MainView';
import { classnames } from '@/utils';
import { CaretRightOutlined, InfoCircleOutlined } from '@ant-design/icons';

interface IProps {
  list?: any;
  checkMode?: boolean;
  LLMConfig?: any;
  setHoverKey: (value: number) => void;
  unpdateValue: ({
    order,
    value,
    key,
  }: {
    order: number;
    value: number | { key: string; value: number };
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
  const { list, LLMConfig, unpdateValue, checkMode } = props;
  const { hoverKey, setHoverKey } = useContext(LLMContext);
  const { t } = useTranslation();
  const isDisableAll = checkMode;

  const getFinishStatus = (i) => {
    const { indicatorScore, indicatorDetermine, score } = LLMConfig;

    let finishStatus = ETagType.Default;
    if (score) {
      if (!i.score) {
        finishStatus = ETagType.UnFinish;
        return finishStatus;
      }
      finishStatus = ETagType.Finish;
    }
    if (indicatorScore?.length > 0) {
      const scoreUnFinish = indicatorScore.some((item: any) => !i?.indicatorScore?.[item.value]);
      if (scoreUnFinish) {
        finishStatus = ETagType.UnFinish;
        return finishStatus;
      }
      finishStatus = ETagType.Finish;
    }
    if (indicatorDetermine?.length > 0) {
      const determineUnFinish = indicatorDetermine.some((item: any) => {
        const determineResult = i?.indicatorDetermine?.[item.value];
        return ![true, false].includes(determineResult);
      });
      if (determineUnFinish) {
        finishStatus = ETagType.UnFinish;
        return finishStatus;
      }
      finishStatus = ETagType.Finish;
    }

    return finishStatus;
  };

  const getTagStyle = (item: any) => {
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
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      expandIconPosition='end'
      defaultActiveKey={list.length > 0 && list.map((i: any, index: number) => index)}
      style={{ margin: '16px 0px' }}
    >
      {list.map((i: any, index: number) => {
        const { score, indicatorScore, indicatorDetermine } = LLMConfig;
        const { backgroundColor, fontColor, tagText, tagStatus } = getTagStyle(i);

        const noIndicatorScore =
          indicatorScore?.filter((i) => i.label && i.value && i.score)?.length > 0;

        const noIndicatorDetermine =
          indicatorDetermine?.filter((i) => i.label && i.value)?.length > 0;

        const noConfig = !(score || noIndicatorScore || noIndicatorDetermine);
        const header = (
          <div
            style={{ display: 'flex', width: '500px', alignItems: 'center', whiteSpace: 'nowrap' }}
            onMouseMove={(e) => {
              setHoverKey(i.order);
            }}
            onMouseLeave={(e) => {
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
                unpdateScore={(score) => unpdateValue({ order: i.order, value: score })}
                isDisableAll={isDisableAll}
              />
            )}
            {/* 指标评分 */}
            {indicatorScore?.length > 0 &&
              indicatorScore.map((item: any, index: number) => {
                const { label, text, value, score } = item;
                const renderTitle = (
                  <span>
                    {label}
                    {text && (
                      <Popover placement='bottom' content={text}>
                        <InfoCircleOutlined style={{ marginLeft: '8px', cursor: 'pointer' }} />
                      </Popover>
                    )}
                  </span>
                );
                return label && score ? (
                  <ScoreGroupButton
                    score={score}
                    title={renderTitle}
                    selectScore={i?.indicatorScore?.[value]}
                    unpdateScore={(score) => {
                      const values = {
                        key: value,
                        value: score,
                      };
                      unpdateValue({ order: i.order, value: values, key: 'indicatorScore' });
                    }}
                    key={index}
                    isDisableAll={isDisableAll}
                  />
                ) : null;
              })}
            {/* 指标判断 */}
            {indicatorDetermine?.length > 0 &&
              indicatorDetermine.map((item: any, index: number) => {
                const { label, value } = item;

                return label ? (
                  <DetermineGroup
                    selectValue={i?.indicatorDetermine?.[value]}
                    title={label}
                    unpdateValue={(changeValue) => {
                      const values = {
                        key: value,
                        value: changeValue,
                      };
                      unpdateValue({ order: i.order, value: values, key: 'indicatorDetermine' });
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
