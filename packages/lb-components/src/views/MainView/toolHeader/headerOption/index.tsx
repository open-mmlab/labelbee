import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '@/store';
import rotateSvg from '@/assets/annotation/common/icon_r.svg';
import restoreSvg from '@/assets/annotation/common/icon_next.svg';
import revocationSvg from '@/assets/annotation/common/icon_back.svg';
import rotateHighlightSvg from '@/assets/annotation/common/icon_rA.svg';
import restoreHighlightSvg from '@/assets/annotation/common/icon_nextA.svg';
import revocationHighlightSvg from '@/assets/annotation/common/icon_backA.svg';
import saveSvg from '@/assets/annotation/common/icon_save.svg';
import saveLightSvg from '@/assets/annotation/common/icon_saveA.svg';
import { prefix } from '@/constant';
import { EToolName } from '@/data/enums/ToolType';
import { ChangeSave } from '@/store/annotation/actionCreators';
import { IStepInfo } from '@/types/step';
import { ToolInstance } from '@/store/annotation/types';

interface IProps {
  isBegin?: boolean;
  stepInfo: IStepInfo;
}

enum EColor {
  Hover = '#666fff',
  Normal = '#cccccc',
}

const HeaderOption: React.FC<IProps> = (props) => {
  const [toolHover, setToolHover] = useState('');
  const { stepInfo } = props;
  const dispatch = useDispatch();
  const {
    annotation: { toolInstance, onSave },
  } = useSelector((state: AppState) => ({
    annotation: state.annotation,
    imgAttribute: state.imgAttribute,
  }));

  const isBegin = props.isBegin || stepInfo?.tool === EToolName.Tag;

  const updateRotate = () => {
    if (stepInfo.dataSourceStep !== 0) {
      return;
    }

    toolInstance?.updateRotate();
  };

  const revocation = useCallback(() => {
    toolInstance?.undo();
  }, [toolInstance]);

  const restore = useCallback(() => {
    toolInstance?.redo();
  }, [toolInstance]);

  const commonOptionList: any = [
    {
      toolName: 'save',
      title: '保存',
      show: !!onSave,
      commonSvg: saveSvg,
      selectedSvg: saveLightSvg,
      click: () => {
        dispatch(ChangeSave);
      },
      style: {
        fontSize: '12px',
        color: !isBegin && toolHover === 'save' ? EColor.Hover : EColor.Normal,
      },
    },
    {
      toolName: 'revocation',
      title: '撤销',
      show: true,
      commonSvg: revocationSvg,
      selectedSvg: revocationHighlightSvg,
      click: () => {
        revocation();
      },
      style: {
        opacity: isBegin === true ? 0.4 : 1,
        fontSize: '12px',
        color: !isBegin && toolHover === 'revocation' ? EColor.Hover : EColor.Normal,
      },
    },
    {
      toolName: 'restore',
      title: '重做',
      show: true,
      commonSvg: restoreSvg,
      selectedSvg: restoreHighlightSvg,
      click: () => {
        restore();
      },
      style: {
        opacity: isBegin === true ? 0.4 : 1,
        fontSize: '12px',
        color: !isBegin && toolHover === 'restore' ? EColor.Hover : EColor.Normal,
      },
    },
    {
      toolName: 'rotate',
      title: '旋转',
      show: true,
      selectedSvg: rotateHighlightSvg,
      commonSvg: rotateSvg,
      click: () => {
        updateRotate();
      },
      style: {
        fontSize: '12px',
        color: !isBegin && toolHover === 'rotate' ? EColor.Hover : EColor.Normal,
      },
    },
  ];

  return (
    <div className={`${prefix}-header__hotKey`}>
      {commonOptionList.map((info: any) => {
        return (
          info.show && (
            <div
              key={info.toolName}
              className='item'
              onMouseEnter={() => setToolHover(info.toolName)}
              onMouseLeave={() => setToolHover('')}
            >
              <a className='item' onClick={info.click}>
                <img
                  className='singleTool'
                  src={toolHover === info.toolName ? info.selectedSvg : info.commonSvg}
                  style={info.style}
                />
                <div style={info.style}>{info.title}</div>
              </a>
            </div>
          )
        );
      })}
    </div>
  );
};

export default HeaderOption;
