/*
 * @file NLP tool view
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2024-01-24
 */

import React, { useContext, useEffect, useState, useMemo, RefObject } from 'react';
import { AppState } from '@/store';
import { connect } from 'react-redux';
import { LabelBeeContext, NLPContext } from '@/store/ctx';
import { prefix } from '@/constant';
import TextContent from './textContent';
import {
  ITextData,
  INLPTextAnnotation,
  INLPResult,
  IExtraLayer,
  ISelectText,
  IExtraData,
} from './types';
import AnnotationTips from '@/views/MainView/annotationTips';
import { getStepConfig } from '@/store/annotation/reducer';
import { jsonParser } from '@/utils';
import { getCurrentResultFromResultList } from '../LLMToolView/utils/data';
import { useCustomToolInstance } from '@/hooks/annotation';
import { uuid } from '@labelbee/lb-annotation';

interface IProps {
  checkMode?: boolean;
  annotation?: any;
  showTips?: boolean;
  tips?: string;
  extraLayer?: (value: IExtraLayer) => void;
  extraData?: IExtraData;
  onChangeAnnotation?: (v: ISelectText) => void;
  customAnnotationData?: ISelectText;
}
const NLPViewCls = `${prefix}-NLPView`;
const NLPToolView: React.FC<IProps> = (props) => {
  const {
    annotation,
    checkMode,
    tips,
    showTips,
    extraLayer,
    extraData,
    onChangeAnnotation,
    customAnnotationData,
  } = props;

  const { imgIndex, imgList, stepList, step } = annotation;
  const { highlightKey, setHighlightKey } = useContext(NLPContext);
  const { toolInstanceRef } = useCustomToolInstance();
  const [selectedAttribute, setSelectedAttribute] = useState<string>('');
  const [lockList, setLockList] = useState<string[]>([]);
  // When undefined, the value of visibleAnnotation is not set
  const [visibleAnnotation, setVisibleAnnotation] = useState<INLPTextAnnotation[] | undefined>(
    undefined,
  );

  const [textData, setTextData] = useState<ITextData[]>([
    {
      content: '',
    },
  ]);

  const [result, setResult] = useState<INLPResult>({
    id: 1,
    newText: '',
    indicatorDetermine: {},
    textAnnotation: [],
  });

  const displayAnnotation = useMemo(() => {
    if (!result?.textAnnotation) {
      return [];
    }
    if (visibleAnnotation) {
      result.textAnnotation = visibleAnnotation;
    }
    return result.textAnnotation.filter((item: INLPTextAnnotation) => {
      return lockList.length === 0 || lockList.includes(item.attribute);
    });
  }, [result, lockList, visibleAnnotation]);

  const NLPConfig = useMemo(() => {
    if (stepList && step) {
      const NLPStepConfig = getStepConfig(stepList, step)?.config;
      return jsonParser(NLPStepConfig);
    }
    return undefined;
  }, [stepList, step]);

  useEffect(() => {
    if (!imgList[imgIndex]) {
      return;
    }
    const textData = imgList[imgIndex]?.textData;
    setTextData(textData);
    if (!NLPConfig?.attributeConfigurable) {
      setVisibleResult([]);
    }
  }, [imgIndex, NLPConfig]);

  useEffect(() => {
    if (!imgList[imgIndex]) {
      return;
    }
    const currentData = imgList[imgIndex] ?? {};
    const result = getCurrentResultFromResultList(currentData?.result);
    setResult(result);
  }, [imgIndex]);

  useEffect(() => {
    toolInstanceRef.current.exportData = () => {
      return [[result], {}];
    };

    toolInstanceRef.current.setResult = () => {};
    toolInstanceRef.current.updateResult = (value: INLPResult) => {
      setResult(value);
    };
    toolInstanceRef.current.clearResult = clearResult;
    toolInstanceRef.current.setDefaultAttribute = setDefaultAttribute;
    toolInstanceRef.current.setHighlightKey = setHighlightKey;
    toolInstanceRef.current.deleteTextAnnotation = deleteTextAnnotation;
    toolInstanceRef.current.setAttributeLockList = setAttributeLockList;
    toolInstanceRef.current.setVisibleResult = setVisibleResult;
    updateSidebar();
  }, [result]);

  const updateSidebar = () => {
    toolInstanceRef.current.emit('changeAttributeSidebar');
    toolInstanceRef.current.emit('changeIndicatorDetermine');
  };
  const setDefaultAttribute = (attribute: string) => {
    toolInstanceRef.current.defaultAttribute = attribute;
    setSelectedAttribute(attribute);
    updateSidebar();
  };

  const setAttributeLockList = (list: string[]) => {
    setLockList(list);
  };

  const setVisibleResult = (list: INLPTextAnnotation[]) => {
    setVisibleAnnotation(list);
  };

  const clearResult = () => {
    setResult({
      id: 1,
      newText: '',
      indicatorDetermine: {},
      textAnnotation: [],
    });
    updateSidebar();
  };

  const deleteTextAnnotation = (key: string) => {
    setResult((origin: INLPResult) => ({
      ...origin,
      textAnnotation: origin.textAnnotation.filter((item: INLPTextAnnotation) => item.id !== key),
    }));
  };

  const onSelectionChange = (contentRef: RefObject<HTMLDivElement>, text: string) => {
    if (text === '' || !contentRef) return;
    const curSelection = window.getSelection();

    const { anchorOffset = 0, focusOffset = 0, anchorNode, focusNode } = curSelection || {};

    if (anchorNode === focusNode) {
      // ignore the order of selection
      const start = Math.min(anchorOffset, focusOffset);
      const end = Math.max(anchorOffset, focusOffset);

      let endPosition;
      if (contentRef?.current && curSelection) {
        const contentRect = contentRef.current?.getBoundingClientRect();
        const range = curSelection.getRangeAt(0);
        const rangeRect = range.getBoundingClientRect();
        const left = rangeRect.right - contentRect.left;
        const top = rangeRect.top - contentRect.top;

        if (left && top) {
          endPosition = {
            left,
            top,
          };
        }
      }
      const value = {
        id: uuid(8, 62),
        start,
        end,
        text,
      };

      if (typeof onChangeAnnotation === 'function') {
        onChangeAnnotation({
          ...value,
          endPosition,
        });
        return;
      }

      if (
        checkSameByOneAttribute(start, end, selectedAttribute, result?.textAnnotation) ||
        checkMode
      ) {
        return;
      }

      setResult({
        ...result,
        textAnnotation: [
          ...(result?.textAnnotation || []),
          {
            ...value,
            attribute: selectedAttribute,
          },
        ],
      });

      window.getSelection()?.empty();
    }
  };

  const checkSameByOneAttribute = (
    start: number,
    end: number,
    selectedAttribute: string,
    textAnnotation: INLPTextAnnotation[],
  ) => {
    return textAnnotation?.some(
      (i) => i?.start === start && i?.end === end && i?.attribute === selectedAttribute,
    );
  };

  return (
    <div className={NLPViewCls} id='NLPView'>
      <div className={`${NLPViewCls}-question`}>
        {showTips === true && <AnnotationTips tips={tips} />}
        <TextContent
          highlightKey={highlightKey}
          textData={textData}
          NLPConfig={NLPConfig}
          textAnnotation={displayAnnotation}
          onSelectionChange={onSelectionChange}
          extraLayer={extraLayer}
          extraData={extraData}
          customAnnotationData={customAnnotationData}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: AppState) => {
  return {
    annotation: state.annotation,
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(NLPToolView);
