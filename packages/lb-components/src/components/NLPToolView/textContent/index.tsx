/*
 * @file text view
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2024-01-24
 */

import React, { useEffect, useState } from 'react';
import { Tag } from 'antd';
import classNames from 'classnames';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { i18n } from '@labelbee/lb-utils';
import { INLPToolConfig, ITextData } from '../types';

interface IProps {
  highlightKey?: string;
  textData: ITextData[];
  lang?: string;
  checkMode?: boolean;
  annotation?: any;
  NLPConfig?: INLPToolConfig;
  answerHeaderSlot?: React.ReactDOM | string;
}

const TextContent: React.FC<IProps> = (props) => {
  const { highlightKey, textData, lang, checkMode = true, NLPConfig, answerHeaderSlot } = props;

  const { t } = useTranslation();

  useEffect(() => {
    if (lang) {
      i18n?.changeLanguage(lang);
    }
  }, []);

  return (
    <div>
      {t('textTool')}
      <div>{textData?.[0]?.content}</div>
    </div>
  );
};

const WrapQuestionView = (props: IProps) => {
  return (
    <I18nextProvider i18n={i18n}>
      <TextContent {...props} />
    </I18nextProvider>
  );
};

export default WrapQuestionView;
