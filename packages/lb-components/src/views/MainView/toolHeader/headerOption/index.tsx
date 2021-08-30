import React, { useState, useCallback } from 'react';
// import styles from './index.scss';
import { connect } from 'react-redux';
import { AppState } from '@/store';
import rotateSvg from '@/assets/annotation/common/icon_r.svg';
import restoreSvg from '@/assets/annotation/common/icon_next.svg';
import revocationSvg from '@/assets/annotation/common/icon_back.svg';
import rotateHighlightSvg from '@/assets/annotation/common/icon_rA.svg';
import restoreHighlightSvg from '@/assets/annotation/common/icon_nextA.svg';
import revocationHighlightSvg from '@/assets/annotation/common/icon_backA.svg';
import { ToolInstance } from 'src/store/annotation/types';
import { prefix } from '@/constant';

interface IProps {
  // toolName: EToolName;
  isBegin?: boolean;
  bindKeydownEvents?: boolean;
  toolInstance: ToolInstance
}

enum EColor {
  Hover = '#666fff',
  Normal = '#cccccc',
}

const HeaderOption: React.FC<IProps> = (props) => {
  const [toolHover, setToolHover] = useState('');
  const {
    isBegin,
    toolInstance,
  } = props;

  const updateRotate = () => {
    // 需要判断

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
      toolName: 'revocation',
      title: '撤销',
      commonSvg: revocationSvg,
      selectedSvg: revocationHighlightSvg,
      click: () => {
        revocation();
      },
      style: {
        opacity: isBegin === true ? 0.4 : 1,
        fontSize: '12px',
        color:
          !isBegin && toolHover === 'revocation' ? EColor.Hover : EColor.Normal,
      },
    },
    {
      toolName: 'restore',
      title: '重做',
      commonSvg: restoreSvg,
      selectedSvg: restoreHighlightSvg,
      click: () => {
        restore();
      },
      style: {
        opacity: isBegin === true ? 0.4 : 1,
        fontSize: '12px',
        color:
          !isBegin && toolHover === 'restore' ? EColor.Hover : EColor.Normal,
      },
    },
    {
      toolName: 'rotate',
      title: '旋转',
      selectedSvg: rotateHighlightSvg,
      commonSvg: rotateSvg,
      click: () => {
        updateRotate();
      },
      style: {
        fontSize: '12px',
        color:
          !isBegin && toolHover === 'rotate' ? EColor.Hover : EColor.Normal,
      },
    },
  ];

  return (
    <div className={`${prefix}-header__hotKey`}>
      {commonOptionList.map((info: any) => (
        <div
          key={info.toolName}
          className="item"
          onMouseEnter={() => setToolHover(info.toolName)}
          onMouseLeave={() => setToolHover('')}
        >
          <a className="item" onClick={info.click}>
            <img
              className="singleTool"
              src={
                toolHover === info.toolName ? info.selectedSvg : info.commonSvg
              }
              style={info.style}
            />
            <div style={info.style}>{info.title}</div>
          </a>
        </div>
      ))}
    </div>
  );
};

const mapStateToProps = (state: AppState) => ({
  toolInstance: state.annotation.toolInstance,
});

export default connect(mapStateToProps)(HeaderOption);
