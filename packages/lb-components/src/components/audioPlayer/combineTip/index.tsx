/**
 * @file 按下合并按钮后出现的提示
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @date 2022年11月1日
 */

import React from 'react';
import { useAudioClipStore } from '@/components/audioAnnotate/audioContext';
import { useHover, useMouse } from 'ahooks';
import styles from '../index.module.scss';
import { useTranslation } from 'react-i18next';

interface IProps {
  /**  展示的容器 */
  container: Element | null;
}

const CombineTip = (props: IProps) => {
  const { t } = useTranslation();

  const { container } = props;
  const { audioClipState } = useAudioClipStore();
  const { combined } = audioClipState;
  const mouse = useMouse(container);
  const isHovering = useHover(container);

  if (!container || !combined || !isHovering) {
    return null;
  }

  return (
    <div
      className={styles.tips}
      style={{
        left: mouse.clientX + 20,
        top: mouse.clientY - 20,
      }}
    >
      {t('AudioCombineTip')}
    </div>
  );
};
export default CombineTip;
