import React, { useState, useEffect, useRef, useMemo } from 'react';
import { connect } from 'react-redux';
import { AppState } from 'src/store';
import StepUtils from '@/utils/StepUtils';
import { IStepInfo } from '@/types/step';
import { useTranslation } from 'react-i18next';
import { LabelBeeContext } from '@/store/ctx';
import { ICustomToolInstance } from '@/hooks/annotation';
import { jsonParser } from '@/utils';
import { IndicatorDetermine, INLPResult } from '@/components/NLPToolView/types';
import DetermineGroup from '@/components/LLMToolView/sidebar/components/determineGroup';
import { getCurrentResultFromResultList } from '@/components/LLMToolView/utils/data';
import { IFileItem } from '@/types/data';

interface IProps {
  toolInstance: ICustomToolInstance;
  stepInfo: IStepInfo;
  imgIndex: number;
  checkMode?: boolean;
  imgList: IFileItem[];
}

const IndicatorDetermineList = (props: IProps) => {
  const { toolInstance, stepInfo, checkMode, imgIndex, imgList } = props;

  const [result] = toolInstance.exportData();
  const [currentResult, setCurrentResult] = useState(result?.[0]);

  const { t } = useTranslation();

  const [_, forceRender] = useState(0);

  useEffect(() => {
    if (!imgList[imgIndex]) {
      return;
    }
    const currentData = imgList[imgIndex] ?? {};
    const result = getCurrentResultFromResultList(currentData?.result || '');
    setCurrentResult(result);
  }, [imgIndex, imgList]);

  useEffect(() => {
    if (toolInstance) {
      toolInstance.on('changeIndicatorDetermine', (index: number) => {
        const [result] = toolInstance.exportData();
        setCurrentResult(result?.[0])
        forceRender((s) => s + 1);
      });
    }
    return () => {
      toolInstance?.unbindAll('changeIndicatorDetermine');
    };
  }, [toolInstance]);

  const config = jsonParser(stepInfo.config);
  const { indicatorDetermine } = config;

  const updateIndicatorDetermine = (params: { key: string; value: boolean }) => {
    const { value, key } = params;
    if (key) {
      const selected = { [key]: value };
      const originData = currentResult?.indicatorDetermine ?? {};
      const newResult = { ...currentResult, indicatorDetermine: { ...originData, ...selected } };
      toolInstance.updateResult(newResult);
    }
  };

  if (indicatorDetermine?.length > 0) {
    const displayList = indicatorDetermine.filter((i: IndicatorDetermine) => i?.label);
    return (
      <div style={{ padding: '12px', marginBottom: '12px' }}>
        <div style={{ fontSize: '16px', fontWeight: 500, lineHeight: '46px' }}>
          {t('IndicatorJudgment')}
        </div>
        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
          {displayList.map((item: IndicatorDetermine, index: number) => {
            const { label, value } = item;
            return (
              <DetermineGroup
                selectValue={currentResult?.indicatorDetermine?.[value]}
                title={label}
                updateValue={(changeValue) => {
                  const values = {
                    key: value,
                    value: changeValue,
                  };
                  updateIndicatorDetermine(values);
                }}
                key={index}
                isDisableAll={checkMode}
              />
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};
const mapStateToProps = (state: AppState) => {
  const stepInfo = StepUtils.getCurrentStepInfo(state.annotation?.step, state.annotation?.stepList);
  return {
    toolInstance: state.annotation.toolInstance,
    stepInfo,
    imgIndex: state.annotation.imgIndex,
    imgList: state.annotation.imgList,
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(
  IndicatorDetermineList,
);
