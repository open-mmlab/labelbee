import React from 'react';
import { AppState } from '@/store';
import { connect, ConnectedComponent } from 'react-redux';
import { ToolInstance } from '@/store/annotation/types';
import StepUtils from '@/utils/StepUtils';
import { IStepInfo } from '@/types/step';
import { jsonParser } from '@/utils';
import { AnnotationFileList } from '@/types/data';
import ActionsConfirm, { IOperationConfig } from './ActionsConfirm';
import useOperationList from './useOperationList';

const mapStateToProps = (state: AppState) => {
  const stepInfo = StepUtils.getCurrentStepInfo(state.annotation?.step, state.annotation?.stepList);

  return {
    toolInstance: state.annotation.toolInstance,
    stepInfo,
    imgList: state.annotation.imgList,
    imgIndex: state.annotation.imgIndex,
  };
};
interface IProps {
  toolInstance: ToolInstance;
  stepInfo: IStepInfo;
  imgList: AnnotationFileList;
  imgIndex: number;
}

const GeneralOperation: React.FC<IProps> = ({ toolInstance, stepInfo }) => {
  const operationList = useOperationList(toolInstance);
  const config = jsonParser(stepInfo?.config);
  const allOperation: IOperationConfig[] = [operationList.empty];

  if (stepInfo?.dataSourceStep === 0) {
    allOperation.push(operationList.setValidity);
  }

  if (config?.copyBackwardResult) {
    allOperation.push(operationList.copyPrevious);
  }

  return <ActionsConfirm allOperation={allOperation} />;
};

export const PointCloudOperation: ConnectedComponent<
  React.FC<IProps>,
  Omit<
    IProps & {
      children?: React.ReactNode;
    },
    'toolInstance' | 'stepInfo' | 'imgList' | 'imgIndex'
  >
> = connect(mapStateToProps)(({ toolInstance, stepInfo }) => {
  const operationList = useOperationList(toolInstance);
  const allOperation: IOperationConfig[] = [
    operationList.copyPrevious,
    operationList.empty,
    operationList.setValidity,
  ];
  return <ActionsConfirm allOperation={allOperation} />;
});

export default connect(mapStateToProps)(GeneralOperation);
