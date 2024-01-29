/*
 * @file text view
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2024-01-24
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { i18n, toolStyleConverter } from '@labelbee/lb-utils';
import {
  INLPToolConfig,
  ITextData,
  INLPTextAnnotation,
  INLPInterval,
  ISelectText,
  IRemarkLayer,
  IRemarkInterval,
  IRemarkAnnotation,
} from '../types';
import { prefix } from '@/constant';
import { useTextSelection } from 'ahooks';
import _ from 'lodash';
import { CommonToolUtils, uuid } from '@labelbee/lb-annotation';
import styleString from '@/constant/styleString';
import { getIntervals } from '../utils';

interface IProps {
  highlightKey?: string;
  textData: ITextData[];
  textAnnotation: INLPTextAnnotation[];
  lang?: string;
  checkMode?: boolean;
  NLPConfig?: INLPToolConfig;
  answerHeaderSlot?: React.ReactDOM | string;
  onSelectionChange?: (text: string) => void;
  remarkLayer?: (values: IRemarkLayer) => void;
  remark?: any;
  isSourceView?: boolean;
}

const NLPViewCls = `${prefix}-NLPView`;

const TextContent: React.FC<IProps> = (props) => {
  const {
    highlightKey,
    textData,
    lang,
    checkMode = true,
    NLPConfig,
    onSelectionChange,
    textAnnotation,
    remark,
    isSourceView,
  } = props;
  const { enableRemark, displayRemarkList } = remark || {};

  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);
  const selection = useTextSelection(contentRef);
  const [remarkResut, setRemarkResut] = useState<ISelectText>({});
  const [remarkStyle, setRemarkStyle] = useState<React.CSSProperties | undefined>(undefined);

  const content = useMemo(() => {
    return textData?.[0]?.content;
  }, [textData]);

  // remark split intervals
  const remarkSplitIntervals: IRemarkInterval[] = useMemo(() => {
    const remarkAnnotation = _.clone(displayRemarkList);
    if (remarkResut?.start) {
      remarkAnnotation.push(remarkResut);
    }

    return getIntervals(content, remarkAnnotation, 'remarkAnnotations');
  }, [displayRemarkList, remarkResut, content]);

  // annotation split intervals
  const splitIntervals: INLPInterval[] = useMemo(
    () => getIntervals(content, textAnnotation, 'annotations'),
    [textAnnotation],
  );

  const getColor = (attribute = '') => {
    const style = CommonToolUtils.jsonParser(styleString);
    return toolStyleConverter.getColorByConfig({ attribute, config: NLPConfig, style });
  };

  useEffect(() => {
    if (lang) {
      i18n?.changeLanguage(lang);
    }
  }, []);

  useEffect(() => {
    if (enableRemark) {
      onSelectiRemark(selection.text);
    } else {
      onSelectionChange?.(selection.text);
    }
  }, [selection.text]);

  // When replying to comments, the pop-up window expands to the corresponding position.
  useEffect(() => {
    if (!remark?.editAuditID) {
      return;
    }
    const remarkItem = displayRemarkList.filter(
      (item: IRemarkAnnotation) => item.auditID === remark.editAuditID,
    )[0];
    const id = remarkItem?.id;
    const element = document.getElementById(id);
    if (element && contentRef.current) {
      const elementRect = element.getBoundingClientRect();
      const parentRect = contentRef.current.getBoundingClientRect();
      const relativeLeft = elementRect.right - parentRect.left;
      const relativeTop = elementRect.bottom - parentRect.top - element.offsetHeight;
      if (relativeLeft && relativeTop) {
        setRemarkStyle({ left: relativeLeft, top: relativeTop });
      }
    }
  }, [remark?.editAuditID]);

  const onSelectiRemark = (text: string) => {
    if (text === '') return;
    let curSelection = window.getSelection();

    const { anchorOffset = 0, focusOffset = 0, anchorNode, focusNode } = curSelection || {};

    if (anchorNode === focusNode) {
      // ignore the order of selection
      let start = Math.min(anchorOffset, focusOffset);
      let end = Math.max(anchorOffset, focusOffset);

      if (selection && contentRef?.current && curSelection) {
        const contentRect = contentRef.current?.getBoundingClientRect();
        const range = curSelection.getRangeAt(0);
        const rangeRect = range.getBoundingClientRect();
        const endPosition = {
          left: rangeRect.right - contentRect.left,
          top: rangeRect.top - contentRect.top,
        };
        if (endPosition.left && endPosition.left) {
          setRemarkStyle(endPosition);
        }
      }
      const value = {
        id: uuid(8, 62),
        start,
        end,
        text,
      };
      setRemarkResut(value);
    }
  };

  const randerRemark = () => {
    if (props?.remarkLayer) {
      return props.remarkLayer({
        style: remarkStyle,
        onClose: () => {
          setRemarkStyle(undefined);
          setRemarkResut({});
          window.getSelection()?.empty();
        },
        submitData: remarkResut,
      });
    }
    return null;
  };

  const renderRemarkMask = () => {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: 'transparent',
          color: 'transparent',
        }}
      >
        {remarkSplitIntervals.map((interval: IRemarkInterval, index: number) => {
          const remarkAnnotation = _.last(interval.remarkAnnotations);
          const highlight = interval?.remarkAnnotations?.find(
            (i) => i?.auditID === remark.hoverAuditID,
          );
          const color = highlight ? '#ffc60a' : '#fcdf7e';
          if (remarkAnnotation) {
            return (
              <span
                style={{
                  borderBottom: `2px solid ${color}`,
                }}
                id={remarkAnnotation?.id}
                key={index}
              >
                {interval.text}
              </span>
            );
          }
          return <span key={index}>{interval.text}</span>;
        })}
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div style={{ position: 'relative' }}>
        {splitIntervals.map((interval: INLPInterval, index: number) => {
          const annotation = _.last(interval.annotations);
          if (annotation) {
            const color = getColor(annotation.attribute);
            const highlight = interval?.annotations?.find(
              (v: INLPTextAnnotation) => v.id === highlightKey,
            );
            return (
              <span
                style={{
                  backgroundColor: color.valid.stroke,
                  color: highlight ? 'white' : undefined,
                }}
                key={index}
              >
                {interval.text}
              </span>
            );
          } else {
            return <span key={index}>{interval.text}</span>;
          }
        })}
        {displayRemarkList?.length > 0 && renderRemarkMask()}
        {renderMask()}
        {randerRemark()}
      </div>
    );
  };

  const renderMask = () => {
    return (
      <div className={`${NLPViewCls}-question-content-mask`} ref={contentRef}>
        {content}
      </div>
    );
  };

  // Unlabeled data
  if (isSourceView) {
    return (
      <div
        style={{
          display: 'flex',
          flexFlow: 'column',
          height: '100%',
          padding: '26px 32px',
          background: '#fff',
        }}
      >
        <div className={`${NLPViewCls}-question-title`}>{t('textTool')}</div>
        <div style={{ flex: 1, background: '#f5f5f5', padding: 8 }}>{content}</div>
      </div>
    );
  }

  return (
    <div>
      <div className={`${NLPViewCls}-question-title`}>{t('textTool')}</div>
      <div className={`${NLPViewCls}-question-content`} style={{ position: 'relative' }}>
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
