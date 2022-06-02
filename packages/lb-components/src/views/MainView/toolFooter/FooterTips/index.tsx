import React from 'react';
import ToolHotKey from './ToolHotKey';
import { useSelector } from 'react-redux';
import StepUtils from '@/utils/StepUtils';

const FooterTips: React.FC = () => {
  // @ts-ignore
  const stepInfo = useSelector((state) =>
    // @ts-ignore
    StepUtils.getCurrentStepInfo(state?.annotation?.step, state.annotation?.stepList),
  );

  return (
    <div className='tipsBar'>
      <ToolHotKey toolName={stepInfo?.tool} />
    </div>
  );
};

export default FooterTips;
