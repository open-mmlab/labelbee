/*
 * @file NLP tool view
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2024-01-24
 */

import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AppState } from '@/store';
import { connect } from 'react-redux';
import { LabelBeeContext, NLPContext } from '@/store/ctx';
import { message } from 'antd';
import { prefix } from '@/constant';
import { Layout } from 'antd/es';
import TextContent from './textContent';
import { useTranslation } from 'react-i18next';
import { ITextList, INLPToolConfig, ITextData, INLPTextAnnotation, INLPResult } from './types';
import AnnotationTips from '@/views/MainView/annotationTips';
import { getStepConfig } from '@/store/annotation/reducer';
import { jsonParser } from '@/utils';
import { getCurrentResultFromResultList } from '../LLMToolView/utils/data';
import { useCustomToolInstance } from '@/hooks/annotation';
import { toolStyleConverter } from '@labelbee/lb-utils';
import { uuid } from '@labelbee/lb-annotation';

interface IProps {
  checkMode?: boolean;
  annotation?: any;
  showTips?: boolean;
  tips?: string;
}
const NLPViewCls = `${prefix}-NLPView`;
const NLPToolView: React.FC<IProps> = (props) => {
  const { annotation, checkMode = true, tips, showTips } = props;
  const { imgIndex, imgList, stepList, step } = annotation;
  const { highlightKey, setHighlightKey } = useContext(NLPContext);
  const { toolInstanceRef } = useCustomToolInstance();

  const [NLPConfig, setNLPConfig] = useState<INLPToolConfig>();
  const [selectedAttribute, setSelectedAttribute] = useState<string>('')
  const [lockList, setLockList] = useState<string[]>([])

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
  })

  const displayAnnotation = useMemo(() => {
    if (!result?.textAnnotation) {
      return []
    }
    return result.textAnnotation.filter((item: INLPTextAnnotation) => {
      return lockList.length === 0 || lockList.includes(item.attribute)
    })
  }, [result, lockList])

  const { t } = useTranslation();

  useEffect(() => {
    let interval: undefined | ReturnType<typeof setInterval>;

    if (!checkMode) {
      interval = setInterval(() => {
        message.info(t('EfficientListening'));
      }, 1000 * 60);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (!imgList[imgIndex]) {
      return;
    }
    const textData = imgList[imgIndex]?.textData;
    setTextData(textData);
  }, [imgIndex, NLPConfig]);

  useEffect(() => {
    if (!imgList[imgIndex]) {
      return;
    }
    const currentData = imgList[imgIndex] ?? {};
    const result = getCurrentResultFromResultList(currentData?.result);
    setResult(result)
  }, [imgIndex]);

  useEffect(() => {
    if (stepList && step) {
      const NLPStepConfig = getStepConfig(stepList, step)?.config;
      setNLPConfig(jsonParser(NLPStepConfig));
    }
  }, [stepList, step]);

  useEffect(() => {
    toolInstanceRef.current.exportData = () => {
      return [[result], { }];
    };

    toolInstanceRef.current.setResult = () => {}
    toolInstanceRef.current.clearResult = clearResult
    toolInstanceRef.current.setDefaultAttribute = setDefaultAttribute
    toolInstanceRef.current.setHighlightKey = setHighlightKey
    toolInstanceRef.current.deleteTextAnnotation = deleteTextAnnotation
    toolInstanceRef.current.setAttributeLockList = setAttributeLockList
    updateSidebar()
  }, [result]);

  const updateSidebar = () => {
    toolInstanceRef.current.emit('changeAttributeSidebar');
  }
  const setDefaultAttribute = (attribute: string) => {
    toolInstanceRef.current.defaultAttribute = attribute
    setSelectedAttribute(attribute)
    updateSidebar()
  }

  const setAttributeLockList = (list: string[]) => {
    setLockList(list)
  }

  const clearResult = () => {
    setResult({
      id: 1,
      newText: '',
      indicatorDetermine: {},
      textAnnotation: [],
    })
    updateSidebar()
  }

  const deleteTextAnnotation = (key: string) => {
    setResult((origin: INLPResult) => ({
      ...origin,
      textAnnotation: origin.textAnnotation.filter((item: INLPTextAnnotation) => item.id !== key),
    }))
  }

  const onSelectionChange = (text: string) => {
    if (text === '') return
    let selection = window.getSelection()
    const { anchorOffset = 0, focusOffset = 0, anchorNode, focusNode } = selection || {}
    if (anchorNode === focusNode) {
      // ignore the order of selection
      let start = Math.min(anchorOffset, focusOffset)
      let end = Math.max(anchorOffset, focusOffset)
      setResult({
        ...result,
        textAnnotation: [...(result?.textAnnotation || []), {
          id: uuid(8, 62),
          start,
          end,
          attribute: selectedAttribute,
          text,
        }]
      })
      window.getSelection()?.empty()
    }
  }

  return (
    <div className={NLPViewCls}>
      <div className={`${NLPViewCls}-question`}>
        {showTips === true && <AnnotationTips tips={tips} />}
        <TextContent
          highlightKey={highlightKey}
          textData={textData}
          checkMode={checkMode}
          annotation={annotation}
          NLPConfig={NLPConfig}
          textAnnotation={displayAnnotation}
          onSelectionChange={onSelectionChange}
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
