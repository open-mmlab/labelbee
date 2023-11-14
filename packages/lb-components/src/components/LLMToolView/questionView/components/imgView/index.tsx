/*
 * @file LLM tool image view
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2023-11-13
 */
import React from 'react';
import { Tag, Image } from 'antd';
import { prefix } from '@/constant';
import classNames from 'classnames';
import { IAnswerList } from '@/components/LLMToolView/types';
import ImgFailCn from '@/assets/annotation/LLMTool/imgFail_cn.svg';
import ImgFailEn from '@/assets/annotation/LLMTool/imgFail_en.svg';
import { i18n } from '@labelbee/lb-utils';

interface IProps {
  hoverKey?: number;
  answerList: IAnswerList[];
}

const LLMViewCls = `${prefix}-LLMView`;
const ImgView = (props: IProps) => {
  const { answerList, hoverKey } = props;
  const ImgFail = i18n.language === 'en' ? ImgFailEn : ImgFailCn;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {answerList.map((i: IAnswerList, index: number) => {
        return (
          <div
            key={index}
            style={{
              margin: '0px 40px 40px 0px',
              minWidth: 400,
              maxWidth: 500,
              display: 'flex',
              height: 300,
            }}
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
            <div
              className={classNames({
                [`${LLMViewCls}-image`]: true,
                [`${LLMViewCls}__contentActive`]: hoverKey === i?.order,
              })}
              style={{
                height: 260,
                minWidth: 300,
                flex: 1,
                background: '#E9EBF1',
                display: 'flex',
                justifyContent: 'center',
                alignContent: 'center',
              }}
            >
              <Image src={i?.url} fallback={ImgFail} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ImgView;
