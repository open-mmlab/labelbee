import React, { useState } from 'react';

import { Slider } from 'antd';
import penActivate from '@/assets/attributeIcon/pen_a.svg';
import pen from '@/assets/attributeIcon/pen.svg';
import eraserActivate from '@/assets/attributeIcon/eraser_a.svg';
import eraser from '@/assets/attributeIcon/eraser.svg';
import { getClassName } from '@/utils/dom';
import { AppState } from '@/store';
import { EScribblePattern } from '@/data/enums/ToolType';
import { useSelector } from '@/store/ctx';

interface IProps {
  // toolInstance?: GraphToolInstance;
  // stepInfo?: IStepInfo;
  onChange: (tool: number, values: number) => void;
}

const ScribbleSidebar: React.FC<IProps> = (props) => {
  const { onChange } = props;
  // 查看时候默认值
  const toolInstance = useSelector((state: AppState) => state.annotation.toolInstance);
  const [silderValue, setSilderValue] = useState(20);
  const [selectTool, setSelectTool] = useState(EScribblePattern.Scribble);

  const changeValue = () => {
    onChange(selectTool, silderValue);
  };

  return (
    <div className={getClassName('scribble')}>
      <div className={getClassName('scribble', 'select')}>
        <img
          src={selectTool === EScribblePattern.Scribble ? penActivate : pen}
          onClick={() => {
            setSelectTool(EScribblePattern.Scribble);
            toolInstance?.setPattern(EScribblePattern.Scribble);
            changeValue();
          }}
        />
        <img
          src={selectTool === EScribblePattern.Erase ? eraserActivate : eraser}
          onClick={() => {
            setSelectTool(EScribblePattern.Erase);
            toolInstance?.setPattern(EScribblePattern.Erase);

            changeValue();
          }}
        />
      </div>
      <div className={getClassName('scribble', 'silder')}>
        <span className={getClassName('scribble', 'circle')} />
        <Slider
          onChange={(v: number) => {
            setSilderValue(v);
            changeValue();
            toolInstance?.setPenSize(v);
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
