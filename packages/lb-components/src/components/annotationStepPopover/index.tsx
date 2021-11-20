// 标注步骤中的 popover 的内容

import { componentCls } from '@/constant';
import { classnames } from '@/utils';
import React from 'react';
import { IStepInfo } from '@/types/step';
import { useTranslation } from 'react-i18next';
interface IProps {
  stepList: IStepInfo[];
  currentStep: number;
  updateStep: (step: number) => void;
}

const AnnotationStepPopover = (props: IProps) => {
  const { t } = useTranslation();
  const { stepList, updateStep, currentStep } = props;

  return (
    <div className={`${componentCls}__annotationStepPopover`}>
      {stepList.map((info) => {
        const isSelected = info.step === currentStep;

        return (
          <div
            key={`stepList${info.step}`}
            className={classnames({
              step: true,
            })}
            onClick={() => {
              if (currentStep && !isSelected) {
                updateStep(info.step);
              }
            }}
          >
            <div
              className={classnames({
                name: true,
                highlight: isSelected,
              })}
            >
              {`${info.step} - ${info.name || t(info.tool)}`}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnnotationStepPopover;
