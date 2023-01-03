import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from '@/store/ctx';
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
import { useTranslation } from 'react-i18next';
import { cTool } from '@labelbee/lb-annotation';
const { EVideoToolName, EPointCloudName } = cTool;

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
  const { t } = useTranslation();

  const isTagTool = [EToolName.Tag, EVideoToolName.VideoTagTool].includes(stepInfo?.tool as any);
  const isVideo = [EVideoToolName.VideoTagTool].includes(stepInfo?.tool as any);
  const isPointCloud = [EPointCloudName.PointCloud].includes(stepInfo?.tool as any);

  const isBegin = props.isBegin || isTagTool;

  const updateRotate = () => {
    /**
     * 1. 非第一步无法旋转
     * 2. 单步骤不存在 dataSourceStep
     */
    if (stepInfo.dataSourceStep !== 0 && stepInfo.dataSourceStep !== undefined) {
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

  let commonOptionList: any = [
    {
      toolName: 'save',
      title: 'Save',
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
      title: 'Undo',
      show: true,
      commonSvg: revocationSvg,
      selectedSvg: revocationHighlightSvg,
      click: () => {
        if (isTagTool) {
          return;
        }

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
      title: 'Redo',
      show: true,
      commonSvg: restoreSvg,
      selectedSvg: restoreHighlightSvg,
      click: () => {
        if (isTagTool) {
          return;
        }

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
      title: 'Rotate',
      show: true,
      selectedSvg: rotateHighlightSvg,
      commonSvg: rotateSvg,
      click: () => {
        if (isVideo) {
          // VideoTool don't need to rotate
          return;
        }

        updateRotate();
      },
      style: {
        opacity: isVideo === true ? 0.4 : 1,
        fontSize: '12px',
        color: !isBegin && toolHover === 'rotate' ? EColor.Hover : EColor.Normal,
      },
    },
  ];

  // PointCloudTool temporarily removes "restore" & "redo"
  if (isPointCloud) {
    commonOptionList = commonOptionList.slice(0, 3);
  }

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
                <div style={info.style}>{t(info.title)}</div>
              </a>
            </div>
          )
        );
      })}
    </div>
  );
};

export default HeaderOption;
