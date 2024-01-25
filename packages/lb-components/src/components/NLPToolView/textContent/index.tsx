/*
 * @file text view
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2024-01-24
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Tag } from 'antd';
import classNames from 'classnames';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { i18n, toolStyleConverter } from '@labelbee/lb-utils';
import { INLPToolConfig, ITextData, INLPTextAnnotation } from '../types';
import { prefix } from '@/constant';
import { useTextSelection } from 'ahooks';
import _ from 'lodash'

interface IProps {
  highlightKey?: string;
  textData: ITextData[];
  textAnnotation: INLPTextAnnotation[];
  lang?: string;
  checkMode?: boolean;
  annotation?: any;
  NLPConfig?: INLPToolConfig;
  answerHeaderSlot?: React.ReactDOM | string;
  onSelectionChange?: (text: string) => void;
}

interface INLPInterval {
  start: number;
  end: number;
  annotations: INLPTextAnnotation[];
  text: string;
}

const NLPViewCls = `${prefix}-NLPView`;

const TextContent: React.FC<IProps> = (props) => {
  const { highlightKey, textData, lang, checkMode = true, NLPConfig, answerHeaderSlot, onSelectionChange, textAnnotation } = props;

  const content = useMemo(() => {
    return textData?.[0]?.content
  }, [textData])

  const splitIntervals: INLPInterval[] = useMemo(() => {
    const splitPoints =  _.uniq(_.concat(0, ...textAnnotation.map((range: INLPTextAnnotation) => [range.start, range.end]), content.length)).sort((a, b) => a - b)
    let intervals = []
    for (let i = 0; i < splitPoints.length - 1; i++){
      let start = splitPoints[i]
      let end = splitPoints[i + 1]
      let annotations = textAnnotation.filter((range: INLPTextAnnotation) => (range.start >= start && range.end <= end) || (start >= range.start && end <= range.end))
      intervals.push({
        start,
        end,
        annotations,
        text: content.slice(start, end)
      })
    }
    return intervals
  }, [textAnnotation])

  const { t } = useTranslation();
  const contentRef = useRef(null)
  const selection = useTextSelection(contentRef)

  const getColor = (attribute = '') => {
    return toolStyleConverter.getColorByConfig({ attribute, config: NLPConfig });
  }

  useEffect(() => {
    if (lang) {
      i18n?.changeLanguage(lang);
    }
  }, []);

  useEffect(() => {
    onSelectionChange?.(selection.text)
  }, [selection.text])

  const renderContent = () => {
    return <div style={{ position: 'relative' }}>
      {
        splitIntervals.map((interval: INLPInterval) => {
          const annotation = _.last(interval.annotations)
          if (annotation) {
            const color = getColor(annotation.attribute)
            const highlight = annotation.id === highlightKey
            return <span style={{ backgroundColor: color.valid.stroke, color: highlight ? 'white' : undefined }}>{interval.text}</span>
          } else {
            return <span>{interval.text}</span>
          }
        })
      }
      {
        renderMask()
      }
    </div>
  }

  const renderMask = () => {
    return <div className={`${NLPViewCls}-question-content-mask`} ref={contentRef}>{content}</div>
  }

  return (
    <div>
      <div className={`${NLPViewCls}-question-title`}>{t('textTool')}</div>
      <div className={`${NLPViewCls}-question-content`}>
        {renderContent()}
      </div>
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
