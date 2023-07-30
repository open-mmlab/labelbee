/**
 * @file 按下合并按钮后出现的提示
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @date 2022年11月1日
 */

import React from 'react';
import { useAudioClipStore } from '@/components/audioAnnotate/audioContext';
import { useHover, useMouse } from 'ahooks';

interface IProps {
  /**  展示的容器 */
  container: Element | null;
}

const CombineTip = (props: IProps) => {
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
      style={{
        left: mouse.clientX + 20,
        top: mouse.clientY - 20,
      }}
    >
      请点击希望合并的区间
    </div>
  );
};
export default CombineTip;
