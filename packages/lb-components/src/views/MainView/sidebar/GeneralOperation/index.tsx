import React, { useCallback, useState } from 'react';
import { AppState } from '@/store';
import { connect, ConnectedComponent } from 'react-redux';
import { ToolInstance } from '@/store/annotation/types';
import StepUtils from '@/utils/StepUtils';
import { IStepInfo } from '@/types/step';
import { jsonParser } from '@/utils';
import { AnnotationFileList, IFileItem } from '@/types/data';
import ActionsConfirm, { IOperationConfig } from './ActionsConfirm';
import useOperationList from './useOperationList';
import { LabelBeeContext } from '@/store/ctx';
import UnifyParamsSvg from '@/assets/annotation/pointCloudTool/unitAttribute.svg';
import UnifyParamsForbidSvg from '@/assets/annotation/pointCloudTool/unitAttributeForbid.svg';
import UnifyParamsHoverSvg from '@/assets/annotation/pointCloudTool/unitAttributeHover.svg';
import { useTranslation } from 'react-i18next';
import UnifyParamsModal from '../../../../components/pointCloudView/components/UnifyParamsModal';
import { useSingleBox } from '@/components/pointCloudView/hooks/useSingleBox';
import { composeResultByToolInstance } from '@/store/annotation/reducer';

const mapStateToProps = (state: AppState) => {
  const stepInfo = StepUtils.getCurrentStepInfo(state.annotation?.step, state.annotation?.stepList);

  return {
    toolInstance: state.annotation.toolInstance,
    stepInfo,
    imgList: state.annotation.imgList,
    imgIndex: state.annotation.imgIndex,
    stepList: state.annotation.stepList,
  };
};
interface IProps {
  toolInstance: ToolInstance;
  stepInfo: IStepInfo;
  imgList: AnnotationFileList;
  imgIndex: number;
  stepList: IStepInfo[];
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
    'toolInstance' | 'stepInfo' | 'imgList' | 'imgIndex' | 'stepList'
  >
> = connect(mapStateToProps, null, null, { context: LabelBeeContext })(
  ({ toolInstance, stepInfo, imgList, stepList, imgIndex }) => {
    const { t } = useTranslation();
    const { selectedBox } = useSingleBox();
    const operationList = useOperationList(toolInstance);
    const [isShowModal, setShowModal] = useState(false);
    const [composeImgList, setComposeImgList] = useState<IFileItem[]>([]);

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
          // TODO, The inner modal needs to use the newest ImgList
          setComposeImgList(composeResultByToolInstance({ toolInstance, imgList, imgIndex, stepList }))

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
          imgList={composeImgList}
        />
      </>
    );
  },
);

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(GeneralOperation);
