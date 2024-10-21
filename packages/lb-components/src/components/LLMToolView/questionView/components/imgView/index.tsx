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
import styles from './index.module.scss';

interface IProps {
  hoverKey?: number;
  answerList: IAnswerList[];
}

const LLMViewCls = `${prefix}-LLMView`;
const ImgView = (props: IProps) => {
  const { answerList, hoverKey } = props;
  const ImgFail = i18n.language === 'en' ? ImgFailEn : ImgFailCn;
  return (
    <div className={styles.imgView}>
      {answerList?.map((i: IAnswerList, index: number) => {
        return (
          <div
            key={index}
            className={classNames({
              [`${styles.item}`]: true,
              [`${LLMViewCls}__contentActive`]: hoverKey === i?.order,
            })}
          >
            <Tag className={`${LLMViewCls}-tag`}>{i?.order}</Tag>
            <div className={styles.image}>
              <Image src={i?.url} fallback={ImgFail} style={{ objectFit: 'contain' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ImgView;
