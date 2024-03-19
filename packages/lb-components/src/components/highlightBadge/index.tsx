/**
 * @file 拉框工具-标注模式-只看高亮框标识和本页高亮框个数
 * 切换标识需要将 attributeLockList 设置为空数组
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @date 2023年12月25日
 */

import { ReactComponent as FlagActive } from '@/assets/annotation/rectTool/flag_active.svg';
import { ReactComponent as FlagDefault } from '@/assets/annotation/rectTool/flag_default.svg';
import { classnames } from '@/utils';
import { Badge, Tooltip } from 'antd';
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { connect } from 'react-redux';
import styles from './index.module.scss';
import { LabelBeeContext, useDispatch } from '@/store/ctx';
import { IRect } from '@labelbee/lb-utils';
import { useTranslation } from 'react-i18next';

const HighlightBadge = (props: any) => {
  const { t } = useTranslation();

  const [rectsVisible, setRectsVisible] = useState<boolean>(false)
  const toolInstance = props?.annotation?.toolInstance;

  const handleClick = useCallback(() => {
    if (toolInstance) {
      const nextRectsVisible = !rectsVisible;
      setRectsVisible(nextRectsVisible)
      toolInstance?.setAttributeLockList([]);
      toolInstance?.setHighlightVisible(nextRectsVisible);
    }
  }, [rectsVisible, toolInstance]);

  const count = useMemo(() => {
    if (!toolInstance?.rectList) return 0
    return toolInstance?.rectList?.filter((rect: IRect) => rect?.isHighlight)?.length
  }, [toolInstance?.rectList])

  useEffect(() => {
    if (toolInstance) {
      toolInstance.on('attributeLockChanged', onAttributeLockChanged)
    }
    return () => {
      toolInstance?.unbind('attributeLockChanged', onAttributeLockChanged);
    };
  }, [toolInstance])

  const onAttributeLockChanged = (list: string[]) => {
    if (list.length > 0) {
      setRectsVisible(false)
    }
  }
  if (count === 0) {
    return null;
  }

  return (
    <Badge count={count} offset={[-10, 5]}>
      <Tooltip placement='bottom' title={t("ShowHighlightRectTip")}>
        <div
          className={classnames({
            [styles.highlightBadge]: true,
            [styles.active]: rectsVisible,
          })}
          onClick={handleClick}
        >
          <div className={styles.flag}>{rectsVisible ? <FlagActive /> : <FlagDefault />}</div>

          <div className={styles.text}>{t("ShowHighlightRect")}</div>
        </div>
      </Tooltip>
    </Badge>
  );
};

const mapStateToProps = ({ annotation }: any) => {
  return { annotation };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(HighlightBadge);

