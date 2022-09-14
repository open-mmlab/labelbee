/**
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @file Display selected box's infos
 * @createdate 2022-07-13
 */

import { EPerspectiveView, PointCloudUtils } from '@labelbee/lb-utils';
import React, { useEffect, useState } from 'react';
import { PointCloudContext } from './PointCloudContext';
import { UnitUtils } from '@labelbee/lb-annotation';
import { useSingleBox } from './hooks/useSingleBox';

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
    const { length, width, height } = PointCloudUtils.transferBox2Kitti(box);
    const infos =
      perspectiveView === EPerspectiveView.Back
        ? [
            {
              label: '宽',
              value: width,
            },
            {
              label: '高',
              value: height,
            },
          ]
        : [
            {
              label: '长',
              value: length,
            },
            {
              label: '宽',
              value: width,
            },
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
  const { selectedBox } = useSingleBox();
  const [infos, setInfos] = useState<Array<{ label: string; value: string }>>([]);

  useEffect(() => {
    if (!selectedBox) {
      return;
    }

    const { length, width, height, rotation_y } = PointCloudUtils.transferBox2Kitti(
      selectedBox.info,
    );

    let infos = [
      {
        label: '长',
        value: length.toFixed(DECIMAL_PLACES),
      },
      {
        label: '宽',
        value: width.toFixed(DECIMAL_PLACES),
      },
      {
        label: '高',
        value: height.toFixed(DECIMAL_PLACES),
      },
      {
        label: '朝向角',
        value: UnitUtils.rad2deg(rotation_y).toFixed(DECIMAL_PLACES),
      },
    ];

    // Get Point Count.
    ptCtx.mainViewInstance?.filterPointsByBox(selectedBox.info).then((data) => {
      if (!data) {
        setInfos(infos);
        return;
      }

      infos.push({
        label: '点数',
        value: `${data.num}`,
      });
      setInfos(infos);
    });
  }, [selectedBox]);

  if (selectedBox) {
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
          backgroundColor: 'rgb(242, 101, 73)',
          color: 'white',
          left: 0,
          top: 0,
          fontSize: 20,
          padding: '8px 16px',
          zIndex: 20,
        }}
      >
        无效
      </div>
    );
  }
  return null;
};
