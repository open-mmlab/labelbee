import { cKeyCode } from '@labelbee/lb-annotation';
import { EToolName } from '@/data/enums/ToolType';
import { Switch } from 'antd';
import React, { useEffect, useRef } from 'react';
import { prefix } from '@/constant';
import { connect } from 'react-redux';
import { AppState } from '@/store';
import { LabelBeeContext } from '@/store/ctx';
import { ToolStyleState } from '@/store/toolStyle/types';
import { store } from '@/index';
import { UpdateToolStyleConfig } from '@/store/toolStyle/actionCreators';
import StepUtils from '@/utils/StepUtils';

interface IProps {
  toolStyle: ToolStyleState,
  toolName: string,
}

const EKeyCode = cKeyCode.default;

// 不看图形信息
const HiddenTextSwitch = (props: IProps) => {
  const {
    toolStyle,
    toolName,
  } = props;

  const { hiddenText } = toolStyle
  const prevHiddenText = useRef(hiddenText);
  const showHiddenText = [
    EToolName.Rect,
    EToolName.Point,
    EToolName.Polygon,
    EToolName.Line,
    EToolName.RectTrack,
  ].includes(toolName as EToolName);

  const changeHiddenText = (hiddenText: boolean) => {
    prevHiddenText.current = hiddenText;
    store.dispatch(UpdateToolStyleConfig({
      hiddenText,
    }));
  };

  const onKeydown = (e: KeyboardEvent) => {
    switch (e.keyCode) {
      case EKeyCode.V:
        if (showHiddenText) {
          changeHiddenText(!prevHiddenText.current);
        }
        break;
    }
  };

  useEffect(() => {
    // 查看模式切换标注工具时 对于不显示hiddenText的工具设为false
    if (showHiddenText) {
      changeHiddenText(prevHiddenText.current);
    } else {
      store.dispatch(UpdateToolStyleConfig({
        hiddenText: false,
      }));
    }
    window.addEventListener('keydown', onKeydown);
    return () => {
      window.removeEventListener('keydown', onKeydown);
    };
  }, [toolName]);

  useEffect(() => {
    return () => changeHiddenText(false);
  }, []);

  if (!showHiddenText) {
    return null;
  }

  return (
    <div className={`${prefix}-footer__hiddenTextSwitch`}>
      不看图形信息(V)
      <Switch size='small' checked={hiddenText} onChange={changeHiddenText} />
    </div>
  );
};

export default connect(
  (state: AppState) => ({
    toolStyle: state.toolStyle,
    toolName: StepUtils.getCurrentStepInfo(state?.annotation?.step, state.annotation?.stepList)?.tool,
  }),
  null,
  null,
  { context: LabelBeeContext },
)(HiddenTextSwitch);
