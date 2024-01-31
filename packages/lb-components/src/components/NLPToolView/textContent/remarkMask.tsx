/**
 * @file remark mask
 * @author lixinghua <lixinghua_vendor@sensetime.com>
 * @date 2024.01.30
 */

import _ from 'lodash';
import React from 'react';
import { IRemarkInterval } from '../types';

export default ({
  remarkSplitIntervals,
  remark,
}: {
  remarkSplitIntervals: IRemarkInterval[];
  remark?: any;
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'transparent',
        color: 'transparent',
      }}
    >
      {remarkSplitIntervals.map((interval: IRemarkInterval, index: number) => {
        const remarkAnnotation = _.last(interval.remarkAnnotations);
        const highlight = interval?.remarkAnnotations?.find(
          (i) => i?.auditID === remark.hoverAuditID,
        );
        const color = highlight ? '#ffc60a' : '#fcdf7e';
        if (remarkAnnotation) {
          return (
            <span
              style={{
                borderBottom: `2px solid ${color}`,
                padding: '2px 0px',
              }}
              id={remarkAnnotation?.id}
              key={index}
            >
              {interval.text}
            </span>
          );
        }
        return <span key={index}>{interval.text}</span>;
      })}
    </div>
  );
};
