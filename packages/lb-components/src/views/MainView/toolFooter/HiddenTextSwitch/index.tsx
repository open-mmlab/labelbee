import { cKeyCode, EToolName } from '@labelbee/lb-annotation';
import { Switch } from 'antd';
import React, { useEffect, useRef } from 'react';
import styles from './index.module.scss';
import { AppState } from '@/store';
import { connect } from 'react-redux';
import { LabelBeeContext } from '@/store/ctx';
import { UpdateToolStyleConfig } from '@/store/toolStyle/actionCreators';
import { store } from '@/index';
import { useTranslation } from 'react-i18next';

const EKeyCode = cKeyCode.default;

interface IProps {
  toolName: string;
  toolStyle: any;
}

// 不看图形信息
const HiddenTextSwitch = (props: IProps) => {
  const {
    toolName,
    toolStyle: { hiddenText },
  } = props;

  const {t} = useTranslation();

  const prevHiddenText = useRef(hiddenText);
  const showHiddenText = [
    EToolName.Rect,
    EToolName.Point,
    EToolName.Polygon,
    EToolName.Line,
  ].includes(toolName as EToolName);

  const changeHiddenText = (hiddenText: boolean) => {
    prevHiddenText.current = hiddenText;
    store.dispatch(UpdateToolStyleConfig({ hiddenText }))
  };

  const onKeydown = (e: KeyboardEvent) => {
    switch (e.keyCode) {
      case EKeyCode.V:
        if (showHiddenText && !e.ctrlKey) {
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
      store.dispatch(UpdateToolStyleConfig({ hiddenText: false }))
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
    <div className={styles.hiddenTextSwitch}>
      {t("HideTextInfo")}(V)
      <Switch size='small' checked={hiddenText} onChange={changeHiddenText} />
    </div>
  );
};

const mapStateToProps = ({ toolStyle }: AppState) => ({
  toolStyle,
});

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(HiddenTextSwitch);
