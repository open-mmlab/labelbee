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
import { classnames } from '@/utils';
import RemarkMask from './remarkMask';

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

const renderRemarkModal = ({
  remarkLayer,
  remarkStyle,
  setRemarkStyle,
  setRemarkResut,
  remarkResut,
}: {
  setRemarkStyle: (value?: React.CSSProperties) => void;
  remarkLayer?: (values: IRemarkLayer) => void;
  remarkStyle: React.CSSProperties | undefined;
  setRemarkResut: (value: ISelectText) => void;
  remarkResut: ISelectText;
}) => {
  if (remarkLayer) {
    remarkLayer({
      style: remarkStyle,
      onClose: () => {
        setRemarkStyle(undefined);
        setRemarkResut({});
        window.getSelection()?.empty();
      },
      submitData: remarkResut,
    });
  }
};
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

    return getIntervals(content, remarkAnnotation ?? [], 'remarkAnnotations');
  }, [displayRemarkList, remarkResut, content]);

  // annotation split intervals
  const splitIntervals: INLPInterval[] = useMemo(
    () => getIntervals(content, textAnnotation ?? [], 'annotations'),
    [textAnnotation, content],
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
      onSelectionRemark(selection.text);
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

  const onSelectionRemark = (text: string) => {
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
            <RemarkMask remarkSplitIntervals={remarkSplitIntervals} remark={remark} />
          )}
          {renderRemarkModal({
            setRemarkStyle,
            remarkLayer: props?.remarkLayer,
            remarkStyle,
            remarkResut,
            setRemarkResut,
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