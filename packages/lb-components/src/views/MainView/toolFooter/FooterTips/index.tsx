import React from 'react';
import { EToolName } from '@/data/enums/ToolType';
import ToolHotKey from './ToolHotKey';

const FooterTips: React.FC = () => (
  <div className="tipsBar">
    <ToolHotKey />
  </div>
);

export default FooterTips;
