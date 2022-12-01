import React, { useCallback, useState } from 'react';
import { AppState } from '@/store';
import { connect, ConnectedComponent } from 'react-redux';
import { ToolInstance } from '@/store/annotation/types';
import StepUtils from '@/utils/StepUtils';
import { IStepInfo } from '@/types/step';
import { jsonParser } from '@/utils';
import { AnnotationFileList } from '@/types/data';
import ActionsConfirm, { IOperationConfig } from './ActionsConfirm';
import useOperationList from './useOperationList';
import { LabelBeeContext, useDispatch } from '@/store/ctx';
import UnifyParamsSvg from '@/assets/annotation/pointCloudTool/unitAttribute.svg';
import UnifyParamsForbidSvg from '@/assets/annotation/pointCloudTool/unitAttributeForbid.svg';
import UnifyParamsHoverSvg from '@/assets/annotation/pointCloudTool/unitAttributeHover.svg';
import { useTranslation } from 'react-i18next';
import UnifyParamsModal from '../../../../components/pointCloudView/components/UnifyParamsModal';
import { useSingleBox } from '@/components/pointCloudView/hooks/useSingleBox';
import { ToSubmitFileData } from '@/store/annotation/actionCreators';
import { ESubmitType } from '@/constant';

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
> = connect(mapStateToProps, null, null, { context: LabelBeeContext })(
  ({ toolInstance, stepInfo }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { selectedBox } = useSingleBox();
    const operationList = useOperationList(toolInstance);
    const [isShowModal, setShowModal] = useState(false);

    const config = jsonParser(stepInfo.config);

    let allOperation: IOperationConfig[] = [
      operationList.copyPrevious,
      operationList.empty,
      operationList.setValidity,
    ];

    if (config.trackConfigurable === true) {
      const forbidOperation = !selectedBox;
      const UnifyParams: IOperationConfig = {
        name: t('UnifyParams'),
        key: 'UnifyParams',
        imgSvg: forbidOperation ? UnifyParamsForbidSvg : UnifyParamsSvg,
        hoverSvg: UnifyParamsHoverSvg,
        onClick: () => {
          dispatch(ToSubmitFileData(ESubmitType.SyncCurrentPageData));
          setShowModal(true);
        },
        forbidConfirm: true,
        forbidOperation: forbidOperation,
      };
      allOperation.unshift(UnifyParams);
    }

    const onCancel = useCallback(() => {
      setShowModal(false);
    }, []);

    const selectedBoxInfo = selectedBox?.info;

    return (
      <>
        <ActionsConfirm allOperation={allOperation} />
        <UnifyParamsModal
          id={selectedBoxInfo?.trackID}
          visible={isShowModal}
          onCancel={onCancel}
          config={config}
        />
      </>
    );
  },
);

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(GeneralOperation);
