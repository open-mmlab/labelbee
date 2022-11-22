import React from 'react';
import ToolHotKey from './ToolHotKey';
import StepUtils from '@/utils/StepUtils';
import { useSelector } from '@/store/ctx';

const FooterTips: React.FC = () => {
  // @ts-ignore
  const stepInfo = useSelector((state) =>
    // @ts-ignore
    StepUtils.getCurrentStepInfo(state?.annotation?.step, state.annotation?.stepList),
  );

  return <ToolHotKey toolName={stepInfo?.tool} />;
};

export default FooterTips;
