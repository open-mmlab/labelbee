import React, { useRef } from 'react';
import progressDotSvg from '@/assets/annotation/audio/progressDot.svg';
import progressDotASvg from '@/assets/annotation/audio/progressDotA.svg';

import styles from './index.module.scss';
import { useHover } from 'ahooks';

interface IProps {
  playPercentage: string;
}

const ProgressDot = (props: IProps) => {
  const ref = useRef(null);
  const isHovering = useHover(ref);
  const { playPercentage } = props;
  return (
    <div className={styles.progressDot} style={{ left: playPercentage }} ref={ref}>
      <img src={isHovering ? progressDotASvg : progressDotSvg} draggable={false} />
    </div>
  );
};

export default ProgressDot;
