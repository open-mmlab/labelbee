/**
 * @file extra mask
 * @author lixinghua <lixinghua_vendor@sensetime.com>
 * @date 2024.01.30
 */

import _ from 'lodash';
import React from 'react';
import { IExtraData, IExtraInterval } from '../types';

export default ({
  splitIntervals,
  extraData,
}: {
  splitIntervals: IExtraInterval[];
  extraData?: IExtraData;
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
      {splitIntervals.map((interval: IExtraInterval, index: number) => {
        const remarkAnnotation = _.last(interval.extraAnnotations);
        const highlight = interval?.extraAnnotations?.find(
          (i) => i?.auditID === extraData?.hoverAuditID,
        );
        const color = highlight ? '#ff8609' : '#fcdf7e';
        let borderStyle = `2px solid ${color}`;
        if (!extraData?.isShowRemark) {
          borderStyle = '';
        }
        if (remarkAnnotation) {
          return (
            <span
              style={{
                borderBottom: borderStyle,
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
