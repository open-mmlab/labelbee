import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { AppState } from 'src/store';
import StepUtils from '@/utils/StepUtils';
import { IStepInfo } from '@/types/step';
import { useTranslation } from 'react-i18next';
import { LabelBeeContext } from '@/store/ctx';
import { ICustomToolInstance } from '@/hooks/annotation';
import { jsonParser } from '@/utils';
import { IndicatorDetermine } from '@/components/NLPToolView/types';
import DetermineGroup from '@/components/LLMToolView/sidebar/components/determineGroup';

interface IProps {
  toolInstance: ICustomToolInstance;
  stepInfo: IStepInfo;
  imgIndex: number;
  checkMode?: boolean;
}

const IndicatorDetermineList = (props: IProps) => {
  const { toolInstance, stepInfo, checkMode, imgIndex } = props;
  const [result] = toolInstance.exportData();
  const [currentResult, setCurrentResult] = useState(result?.[0]);
  const { t } = useTranslation();

  useEffect(() => {
    const [result] = toolInstance.exportData();
    setCurrentResult(result?.[0]);
  }, [imgIndex]);
  const config = jsonParser(stepInfo.config);
  const { indicatorDetermine } = config;

  const updateIndicatorDetermine = (params: { key: string; value: boolean }) => {
    const { value, key } = params;
    if (key) {
      const selected = { [key]: value };
      const originData = currentResult?.indicatorDetermine ?? {};
      const newResult = { ...currentResult, indicatorDetermine: { ...originData, ...selected } };
      setCurrentResult(newResult);
      toolInstance.setResult(newResult);
    }
  };
  if (indicatorDetermine?.length > 0) {
    return (
      <div style={{ padding: '12px', marginBottom: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 500, lineHeight: '46px' }}>
          {t('IndicatorJudgment')}
        </div>
        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
          {indicatorDetermine.map((item: IndicatorDetermine, index: number) => {
            const { label, value } = item;
            return label ? (
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
            ) : null;
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
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(
  IndicatorDetermineList,
);
