/**
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @file Display selected box's infos
 * @createdate 2022-07-13
 */

import { EPerspectiveView } from '@labelbee/lb-utils';
import React from 'react';
import { PointCloudContext } from './PointCloudContext';
import { UnitUtils } from '@labelbee/lb-annotation';

const DECIMAL_PLACES = 2;

/**
 * Display size info for views
 * @param param0
 * @returns
 */
export const SizeInfoForView = ({ perspectiveView }: { perspectiveView: EPerspectiveView }) => {
  const { pointCloudBoxList, selectedID } = React.useContext(PointCloudContext);
  const box = pointCloudBoxList.find((i) => i.id === selectedID);

  if (selectedID && box) {
    const infos =
      perspectiveView === EPerspectiveView.Back
        ? [
            { label: '宽', value: box.width },
            { label: '高', value: box.depth },
          ]
        : [
            { label: '长', value: box.height },
            { label: '宽', value: box.width },
          ];

    return (
      <>
        {infos.map((info, index) => (
          <span key={index} style={{ marginRight: index === 0 ? 16 : 0, fontSize: 12 }}>{`${
            info.label
          }: ${info.value.toFixed(DECIMAL_PLACES)}`}</span>
        ))}
      </>
    );
  }
  return null;
};

/**
 * Display selected box's infos
 */
export const BoxInfos = () => {
  const ptCtx = React.useContext(PointCloudContext);
  const { selectedID, pointCloudBoxList } = ptCtx;
  const box = pointCloudBoxList.find((i) => i.id === selectedID);

  if (selectedID && box) {
    const { width, depth, height, rotation } = box;
    const infos = [
      {
        label: '长',
        value: height.toFixed(DECIMAL_PLACES),
      },
      {
        label: '宽',
        value: width.toFixed(DECIMAL_PLACES),
      },
      {
        label: '高',
        value: depth.toFixed(DECIMAL_PLACES),
      },
      {
        label: '朝向角',
        value: UnitUtils.rad2deg(rotation).toFixed(DECIMAL_PLACES),
      },
      // TODO: 需要将结果存入到标注信息
      {
        label: '点数',
        value: 1000,
      },
    ];

    return (
      <div
        style={{
          position: 'absolute',
          color: 'white',
          backgroundColor: 'rgba(153, 153, 153, 0.3)',
          right: 8,
          top: 8,
          fontSize: 12,
          padding: 8,
          zIndex: 20,
        }}
      >
        {infos.map((i) => (
          <div key={i.label}>{`${i.label}: ${i.value}`}</div>
        ))}
      </div>
    );
  }

  return null;
};

export const PointCloudValidity = () => {
  const ptCtx = React.useContext(PointCloudContext);

  if (ptCtx.valid === false) {
    return (
      <div
        style={{
          position: 'absolute',
          backgroundColor: 'red',
          left: 0,
          top: 0,
          fontSize: 24,
          padding: 8,
          zIndex: 20,
        }}
      >
        无效
      </div>
    );
  }
  return null;
};
