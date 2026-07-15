import React, { useCallback, useMemo, useState } from 'react';
import { Checkbox } from 'antd';
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
import { useStatus } from '@/components/pointCloudView/hooks/useStatus';
import { ICustomToolInstance } from '@/hooks/annotation';
import { POINT_CLOUD_DEFAULT_STEP } from '@labelbee/lb-utils';

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
export interface IBatchSetValid {
  isHover?: boolean;
  valid?: boolean;
  isModal?: boolean;
  visibleModal?: boolean;
  onClose?: () => void;
  singleSetQuestionImg?: () => void;
}

interface IProps {
  toolInstance: ToolInstance;
  stepInfo: IStepInfo;
  imgList: AnnotationFileList;
  imgIndex: number;
  stepList: IStepInfo[];
  hideValidity?: boolean;
  setBatchSetValid?: (values: IBatchSetValid) => void;
}

const GeneralOperation: React.FC<IProps> = ({ toolInstance, stepInfo, hideValidity }) => {
  const operationList = useOperationList(toolInstance);
  const config = jsonParser(stepInfo?.config);
  const allOperation: IOperationConfig[] = [operationList.empty];

  if (stepInfo?.dataSourceStep === 0 && !hideValidity) {
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
  ({ toolInstance, stepInfo, imgList, stepList, imgIndex, setBatchSetValid }) => {
    const { t } = useTranslation();
    const { selectedBox } = useSingleBox();
    const operationList = useOperationList(toolInstance);
    const [isShowModal, setShowModal] = useState(false);
    const [composeImgList, setComposeImgList] = useState<IFileItem[]>([]);
    const [keepPreResult, setKeepPreResult] = useState(false);
    const { isPointCloudDetectionPattern, isPointCloudSegmentationPattern } = useStatus();

    const config = jsonParser(stepInfo.config);
    const currentData = imgList?.[imgIndex];
    const hasPreResult = useMemo(() => {
      const preStep = jsonParser(currentData?.preResult)?.[POINT_CLOUD_DEFAULT_STEP];
      return Boolean(preStep);
    }, [currentData?.preResult]);

    // Detection-only: keep-pre-annotation restore is not wired for segmentation clearResult.
    const showKeepPreResultOption = hasPreResult && isPointCloudDetectionPattern;

    const emptyOperation: IOperationConfig = {
      ...operationList.empty,
      confirmExtra: showKeepPreResultOption ? (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ marginTop: 8, textAlign: 'left', width: '100%' }}
        >
          <Checkbox
            checked={keepPreResult}
            onChange={(e) => setKeepPreResult(e.target.checked)}
            style={{ marginLeft: 0 }}
          >
            {t('KeepPreAnnotation')}
          </Checkbox>
        </div>
      ) : undefined,
      onConfirmVisibleChange: (visible) => {
        if (visible) {
          setKeepPreResult(false);
        }
      },
      onClick: () => {
        const pointCloudToolInstance = toolInstance as unknown as ICustomToolInstance;
        pointCloudToolInstance.clearResult({
          keepPreResult: showKeepPreResultOption && keepPreResult,
        });
        setKeepPreResult(false);
      },
    };

    let allOperation: IOperationConfig[] = [
      operationList.copyPrevious,
      emptyOperation,
      operationList.setValidity,
    ];

    if (isPointCloudDetectionPattern && config.trackConfigurable === true) {
      const forbidOperation = !selectedBox;
      const UnifyParams: IOperationConfig = {
        name: t('UnifyParams'),
        key: 'UnifyParams',
        imgSvg: forbidOperation ? UnifyParamsForbidSvg : UnifyParamsSvg,
        hoverSvg: UnifyParamsHoverSvg,
        onClick: () => {
          // TODO, The inner modal needs to use the newest ImgList
          setComposeImgList(
            composeResultByToolInstance({ toolInstance, imgList, imgIndex, stepList }),
          );

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

    if (isPointCloudSegmentationPattern) {
      /**
       * Segmentation Pattern need to remove copyPrevious (setValidity temporarily)
       */
      allOperation = allOperation.filter((v) => !['setValidity', 'copyPrevious'].includes(v.key));
    }

    return (
      <>
        <ActionsConfirm
          allOperation={allOperation}
          setBatchSetValid={setBatchSetValid}
          valid={toolInstance?.valid}
        />

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
