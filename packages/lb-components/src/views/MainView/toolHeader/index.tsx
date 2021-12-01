import React, { useReducer, useRef } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import { connect, useDispatch } from 'react-redux';
import { store } from 'src';
import { IFileItem } from '@/types/data';
import { AppState } from '@/store';
import classNames from 'classnames';
import { ESubmitType, prefix } from '@/constant';
import ExportData from './ExportData';
import HeaderOption from './headerOption';
import { AnnotationEngine } from '@sensetime/annotation';
import { Button, Tooltip } from 'antd/es';
import { ToNextStep, ToSubmitFileData } from '@/store/annotation/actionCreators';
import StepSwitch from './StepSwitch';
import { EToolName } from '@/data/enums/ToolType';
import { IStepInfo } from '@/types/step';
import { i18n } from '@sensetime/lb-utils';
import { useTranslation } from 'react-i18next';
import useSize from '@/hooks/useSize';

interface INextStep {
  stepProgress: number;
  stepList: IStepInfo[];
  step: number; // 当前步骤
}

const NextButton: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  const { t } = useTranslation();
  return (
    <Button
      type='primary'
      style={{
        marginLeft: 10,
      }}
      onClick={() => {
        store.dispatch(ToNextStep(0) as any);
      }}
      disabled={disabled}
    >
      {t('NextStep')}
    </Button>
  );
};

const NextStep: React.FC<INextStep> = ({ step, stepProgress, stepList }) => {
  const { t } = useTranslation();

  if (stepList.length < 2 || step === stepList.length) {
    return null;
  }

  const disabled = stepProgress < 1;

  if (disabled) {
    return (
      <Tooltip title={t('StepNotFinishedNotify')}>
        <span>
          <NextButton disabled={disabled} />
        </span>
      </Tooltip>
    );
  }

  return <NextButton disabled={disabled} />;
};

interface IToolHeaderProps {
  goBack?: (imgList?: IFileItem[]) => void;
  exportData?: (data: any[]) => void;
  headerName?: string;
  imgList: IFileItem[];
  annotationEngine: AnnotationEngine;
  stepProgress: number;
  toolName: EToolName;
  stepInfo: IStepInfo;
  stepList: IStepInfo[];
  step: number;
}

const ToolHeader: React.FC<IToolHeaderProps> = ({
  goBack,
  exportData,
  headerName,
  imgList,
  stepProgress,
  stepInfo,
  stepList,
  step,
  annotationEngine,
}) => {
  const dispatch = useDispatch();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const ref = useRef(null);

  const size = useSize(ref);

  // render 数据展示
  const currentOption = <ExportData exportData={exportData} />;

  const closeAnnotation = () => {
    dispatch(ToSubmitFileData(ESubmitType.Quit));

    if (goBack) {
      goBack(imgList);
    }
  };

  const changeLanguage = (lang: 'en' | 'cn') => {
    i18n.changeLanguage(lang);
    annotationEngine.setLang(lang);
    forceUpdate();
  };

  const curLang = i18n.language;

  const width = size?.width ?? window.innerWidth;

  return (
    <div className={classNames(`${prefix}-header`)} ref={ref}>
      <div className={`${prefix}-header__title`}>
        <LeftOutlined className={`${prefix}-header__icon`} onClick={closeAnnotation} />
        {headerName ? <span className={`${prefix}-header__name`}>{headerName}</span> : ''}
        {stepList.length > 1 && (
          <>
            <StepSwitch stepProgress={stepProgress} />
            <NextStep step={step} stepProgress={stepProgress} stepList={stepList} />
          </>
        )}

        {currentOption}
        <div
          id='operationNode'
          className={`${prefix}-header__operationNode`}
          style={{ left: width / 2 - 174 / 2 }}
        >
          <HeaderOption stepInfo={stepInfo} />
        </div>

        <div className={`${prefix}-header__titlePlacement`} />

        <div className={`${prefix}-header__lang`}>
          <span
            className={`${prefix}-langCN ${curLang === 'cn' ? 'active' : ''}`}
            onClick={() => changeLanguage('cn')}
          >
            中文
          </span>
          {` / `}
          <span
            className={`${prefix}-langEN ${curLang === 'en' ? 'active' : ''}`}
            onClick={() => changeLanguage('en')}
          >
            En
          </span>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: AppState) => ({
  imgList: state.annotation.imgList,
  annotationEngine: state.annotation.annotationEngine,
  stepProgress: state.annotation.stepProgress,
  toolName: state.annotation.stepList[state.annotation.step - 1]?.tool,
  stepList: state.annotation.stepList,
  stepInfo: state.annotation.stepList[state.annotation.step - 1],
  step: state.annotation.step,
});

export default connect(mapStateToProps)(ToolHeader);
