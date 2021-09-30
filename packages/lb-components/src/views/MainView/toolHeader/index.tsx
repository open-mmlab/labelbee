import React from 'react';
import { LeftOutlined } from '@ant-design/icons';
// import styles from './index.scss';
import { connect } from 'react-redux';
import { store } from 'src';
import { ANNOTATION_ACTIONS } from '@/store/Actions';
import { IFileItem } from '@/types/data';
import { AppState } from '@/store';
import classNames from 'classnames';
import { ESubmitType, prefix } from '@/constant';
import ExportData from './ExportData';
import HeaderOption from './headerOption';
import { AnnotationEngine } from '@sensetime/annotation';
import { Button } from 'antd';
import { ToNextStep } from '@/store/annotation/actionCreators';
import StepSwitch from './StepSwitch';
import { EToolName } from '@/data/enums/ToolType';
import { IStepInfo } from '@/types/step';

interface INextStep {
  stepProgress: number;
}

const NextStep: React.FC<INextStep> = ({ stepProgress }) => {
  return (
    <Button
      type='primary'
      style={{
        marginLeft: 10,
      }}
      onClick={() => {
        store.dispatch(ToNextStep() as any);
      }}
      disabled={stepProgress < 1}
    >
      下一步
    </Button>
  );
};

interface IToolHeaderProps {
  goBack?: (imgList?: IFileItem[]) => void;
  exportData?: (data: any[]) => void;
  headerName?: string;
  imgList: IFileItem[];
  annotationEngine: AnnotationEngine;
  stepProgress: number;
  toolName: EToolName;
  stepList: IStepInfo[];
}

const ToolHeader: React.FC<IToolHeaderProps> = ({
  goBack,
  exportData,
  headerName,
  imgList,
  stepProgress,
  toolName,
  stepList,
}) => {
  // render 数据展示
  const currentOption = <ExportData exportData={exportData} />;

  const closeAnnotation = () => {
    store.dispatch({
      type: ANNOTATION_ACTIONS.SUBMIT_FILE_DATA,
      payload: {
        submitType: ESubmitType.Quit,
      },
    });
    if (goBack) {
      goBack(imgList);
    }
  };

  return (
    <div className={classNames(`${prefix}-header`)}>
      <div className={`${prefix}-header__title`}>
        <LeftOutlined className={`${prefix}-header__icon`} onClick={closeAnnotation} />
        {headerName ? <span className={`${prefix}-header__name`}>{headerName}</span> : ''}
        {stepList.length > 1 && (
          <>
            <StepSwitch stepProgress={stepProgress} />
            <NextStep stepProgress={stepProgress} />
          </>
        )}

        {currentOption}
        <div
          id='operationNode'
          className={`${prefix}-header__operationNode`}
          style={{ left: window.innerWidth / 2 - 174 / 2 }}
        >
          <HeaderOption toolName={toolName} />
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
});

export default connect(mapStateToProps)(ToolHeader);
