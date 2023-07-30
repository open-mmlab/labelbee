/**
 * @file 音频分割时的时间点显示
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @date 2022年11月1日
 */

import React, { useRef } from 'react';
import { timeFormat } from '@/utils/audio';
import { useMouse } from 'ahooks';

interface IProps {
  /** 分割点时间提示 */
  segmentTimeTip: any;
}

const SegmentTip = (props: IProps) => {
  const ref = useRef<Element | null>(null);
  const { segmentTimeTip } = props;

  const mouse = useMouse(ref.current);

  if (!segmentTimeTip) {
    return null;
  }

  return (
    <div
      style={{
        left: mouse.clientX,
        top: 75,
        marginLeft: -130,
      }}
    >
      请选择希望截取的时间点（{timeFormat(segmentTimeTip, 'ss.SSS')}）
    </div>
  );
};
export default SegmentTip;
