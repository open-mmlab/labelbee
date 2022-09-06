import React, { useState } from 'react';

import { Slider } from 'antd';
import penActivate from '@/assets/attributeIcon/pen_a.svg';
import pen from '@/assets/attributeIcon/pen.svg';
import eraserActivate from '@/assets/attributeIcon/eraser_a.svg';
import eraser from '@/assets/attributeIcon/eraser.svg';
import { getClassName } from '@/utils/dom';

interface IProps {
  // toolInstance?: GraphToolInstance;
  // stepInfo?: IStepInfo;
  onChange: (tool: number, values: number) => void;
}

enum ESwitchTool {
  Pen = 1, // 笔
  Ereser = 2, // 橡皮刷
}

const ScribbleSidebar: React.FC<IProps> = (props) => {
  const { onChange } = props;
  // 查看时候默认值
  // const initValue = toolInstance?.weight || 20;
  // const initTool = toolInstance?.brushTool || ESwitchTool.Pen;
  const [silderValue, setSilderValue] = useState(20);
  const [selectTool, setSelectTool] = useState(ESwitchTool.Pen);

  const changeValue = () => {
    onChange(selectTool, silderValue);
  };

  return (
    <div className={getClassName('scribble')}>
      <div className={getClassName('scribble', 'select')}>
        <img
          src={selectTool === ESwitchTool.Pen ? penActivate : pen}
          onClick={() => {
            setSilderValue(20);
            setSelectTool(ESwitchTool.Pen);
            changeValue();
          }}
        />
        <img
          src={selectTool === ESwitchTool.Ereser ? eraserActivate : eraser}
          onClick={() => {
            setSilderValue(20);
            setSelectTool(ESwitchTool.Ereser);
            changeValue();
          }}
        />
      </div>
      <div className={getClassName('scribble', 'silder')}>
        <span className={getClassName('scribble', 'circle')} />
        <Slider
          onChange={(v) => {
            setSilderValue(v);
            changeValue();
          }}
          min={1}
          max={50}
          style={{ width: '60%' }}
          value={silderValue}
        />
        <span
          className={getClassName('scribble', 'circle')}
          style={{ width: '10px', height: '10px' }}
        />
      </div>
    </div>
  );
};

export default ScribbleSidebar;
