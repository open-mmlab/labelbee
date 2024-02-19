/*
 * @file text view
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2024-01-24
 */

import React, { useEffect, useState, useRef, useMemo, RefObject } from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { i18n, toolStyleConverter } from '@labelbee/lb-utils';
import {
  INLPToolConfig,
  ITextData,
  INLPTextAnnotation,
  INLPInterval,
  ISelectText,
  IExtraLayer,
  IExtraInterval,
  IExtraInAnnotation,
  IExtraData,
} from '../types';
import { prefix } from '@/constant';
import { useTextSelection } from 'ahooks';
import _ from 'lodash';
import { CommonToolUtils } from '@labelbee/lb-annotation';
import styleString from '@/constant/styleString';
import { getIntervals } from '../utils';
import { classnames } from '@/utils';
import ExtraMask from './extraMask';

interface IProps {
  highlightKey?: string;
  textData: ITextData[];
  textAnnotation: INLPTextAnnotation[];
  lang?: string;
  NLPConfig?: INLPToolConfig;
  answerHeaderSlot?: React.ReactDOM | string;
  onSelectionChange?: (contentRef: RefObject<HTMLDivElement>, text: string) => void;
  extraLayer?: (values: IExtraLayer) => void;
  extraData?: IExtraData;
  customAnnotationData?: ISelectText;
}

const NLPViewCls = `${prefix}-NLPView`;

const renderExtraModal = ({
  extraLayer,
  extraStyle,
  setExtraStyle,
  setExtraResut,
  extraResut,
}: {
  setExtraStyle?: (value?: React.CSSProperties) => void;
  extraLayer?: (values: IExtraLayer) => void;
  extraStyle?: React.CSSProperties | undefined;
  setExtraResut?: (value: ISelectText | undefined) => void;
  extraResut?: ISelectText;
}) => {
  if (typeof extraLayer === 'function' && setExtraStyle && setExtraResut) {
    return extraLayer({
      style: extraStyle,
      onClose: () => {
        setExtraStyle(undefined);
        setExtraResut(undefined);
        window.getSelection()?.empty();
      },
      submitData: extraResut,
    });
  }
};
const TextContent: React.FC<IProps> = (props) => {
  const {
    highlightKey,
    textData,
    lang,
    NLPConfig,
    onSelectionChange,
    textAnnotation,
    extraData,
    customAnnotationData,
  } = props;
  const { displayRemarkList = [] } = extraData || {};
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);
  const selection = useTextSelection(contentRef);
  const [extraResut, setExtraResut] = useState<ISelectText>();
  const [extraStyle, setExtraStyle] = useState<React.CSSProperties | undefined>(undefined);

  const content = useMemo(() => {
    return textData?.[0]?.content;
  }, [textData]);

  // extraData split intervals
  const extraSplitIntervals: IExtraInterval[] = useMemo(() => {
    const extraAnnotation = _.clone(displayRemarkList);
    if (extraResut?.start) {
      extraAnnotation.push(extraResut);
    }
    return getIntervals(content, extraAnnotation ?? [], 'extraAnnotations');
  }, [displayRemarkList, extraResut, content]);

  // annotation split intervals
  const splitIntervals: INLPInterval[] = useMemo(
    () => getIntervals(content, textAnnotation ?? [], 'annotations'),
    [textAnnotation, content],
  );

  useEffect(() => {
    if (customAnnotationData) {
      const { id, start, end, text, endPosition } = customAnnotationData;
      setExtraResut({ id, start, end, text });
      setExtraStyle(endPosition);
    }
  }, [customAnnotationData]);

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
    onSelectionChange?.(contentRef, selection.text);
  }, [selection.text]);

  // When replying to comments, the pop-up window expands to the corresponding position.
  useEffect(() => {
    if (!extraData?.editAuditID) {
      return;
    }
    const extraItem = displayRemarkList.filter(
      (item: IExtraInAnnotation) => item?.auditID === extraData.editAuditID,
    )[0];
    const id = extraItem?.id ?? '';
    const element = document.getElementById(id);
    if (element && contentRef.current) {
      const elementRect = element.getBoundingClientRect();
      const parentRect = contentRef.current.getBoundingClientRect();
      const relativeLeft = elementRect.right - parentRect.left;
      const relativeTop = elementRect.bottom - parentRect.top - element.offsetHeight;
      if (relativeLeft && relativeTop && setExtraStyle) {
        setExtraStyle({ left: relativeLeft, top: relativeTop });
      }
    }
  }, [extraData?.editAuditID]);

  return (
    <div>
      <div className={`${NLPViewCls}-question-title`}>{t('textTool')}</div>
      <div
        className={classnames({
          [`${NLPViewCls}-question-content`]: true,
        })}
        style={{ position: 'relative' }}
        onDoubleClick={(e) => {
          e.preventDefault();
        }}
      >
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
                    padding: '2px 0px',
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
          {displayRemarkList?.length > 0 && (
            <ExtraMask splitIntervals={extraSplitIntervals} extraData={extraData} />
          )}
          {renderExtraModal({
            extraLayer: props?.extraLayer,
            setExtraStyle,
            extraStyle,
            extraResut,
            setExtraResut,
          })}

          <div className={`${NLPViewCls}-question-content-mask`} ref={contentRef}>
            {content}
          </div>
        </div>
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
