// 标注步骤中的 popover 的内容

import { componentCls } from '@/constant';
import { classnames } from '@/utils';
import React from 'react';
import { IStepInfo } from '@/types/step';
import { cTool } from '@sensetime/annotation';

const { TOOL_NAME } = cTool;

interface IProps {
  stepList: IStepInfo[];
  currentStep: number;
  updateStep: (step: number) => void;
}

const AnnotationStepPopover = (props: IProps) => {
  const { stepList, updateStep, currentStep } = props;

  return (
    <div className={`${componentCls}__annotationStepPopover`}>
      {stepList.map((info) => {
        const isSelected = info.step === currentStep;
        const isClick = true;

        return (
          <div
            key={`stepList${info.step}`}
            className={classnames({
              step: true,
            })}
            onClick={() => {
              isClick && updateStep(info.step);
            }}
          >
            <div
              className={classnames({
                name: true,
                highlight: isSelected,
              })}
            >
              {`${info.step} - ${info.name || TOOL_NAME[info.tool]}`}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnnotationStepPopover;
