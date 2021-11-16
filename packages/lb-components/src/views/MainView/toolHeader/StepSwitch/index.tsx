/**
 * 用于多步骤中的切换
 */

import { Dropdown } from 'antd/es';
import { CaretDownOutlined, OrderedListOutlined } from '@ant-design/icons';
import React from 'react';
import { connect, useDispatch } from 'react-redux';
import { AppState } from '@/store';
import IconWithText from '@/components/customAntd/IconWithText';
import { prefix } from '@/constant';
import AnnotationStepPopover from '@/components/annotationStepPopover';
import { IStepInfo } from '@/types/step';
import { UpdateProcessingStep } from '@/store/annotation/actionCreators';
import { useTranslation } from 'react-i18next';

interface IProps {
  stepProgress: number;
  stepList: IStepInfo[];
  step: number;
}

const StepSwitch: React.FC<IProps> = ({ stepProgress, step, stepList }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const updateStep = (toStep: number) => {
    dispatch(UpdateProcessingStep(toStep));
  };

  return (
    <span className={`${prefix}`}>
      <Dropdown
        overlay={
          <AnnotationStepPopover stepList={stepList} updateStep={updateStep} currentStep={step} />
        }
      >
        <IconWithText
          text={t('Steps')}
          Icon={OrderedListOutlined}
          iconChildren={<CaretDownOutlined style={{ fontSize: 8 }} />}
        />
      </Dropdown>
    </span>
  );
};

const mapStateToProps = (state: AppState) => ({
  stepList: state.annotation.stepList,
  step: state.annotation.step,
});

export default connect(mapStateToProps)(StepSwitch);
