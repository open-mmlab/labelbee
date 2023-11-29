/**
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @file Display selected box's infos
 * @createdate 2022-07-13
 */

import { EPerspectiveView, IPointCloudConfig, PointCloudUtils } from '@labelbee/lb-utils';
import React, { useEffect, useState } from 'react';
import { PointCloudContext } from './PointCloudContext';
import { UnitUtils } from '@labelbee/lb-annotation';
import { useSingleBox } from './hooks/useSingleBox';
import { useTranslation } from 'react-i18next';

const DECIMAL_PLACES = 2;

const DEFAULT_BOX_INFO_STYLE = {
  color: 'white',
  backgroundColor: 'rgba(153, 153, 153, 0.3)',
  padding: '8px 10px',
  zIndex: 20,
  fontSize: 12,
};

/**
 * Display size info for views
 * @param param0
 * @returns
 */
export const SizeInfoForView = ({ perspectiveView }: { perspectiveView: EPerspectiveView }) => {
  const { pointCloudBoxList, selectedID } = React.useContext(PointCloudContext);
  const box = pointCloudBoxList.find((i) => i.id === selectedID);
  const trans = useTranslation();
  const { t } = trans;

  if (selectedID && box) {
    const { length, width, height } = PointCloudUtils.transferBox2Kitti(box);
    const infos =
      perspectiveView === EPerspectiveView.Back
        ? [
            {
              label: t('Width'),
              value: width,
            },
            {
              label: t('Height'),
              value: height,
            },
          ]
        : [
            {
              label: t('Length'),
              value: length,
            },
            {
              label: t('Height'),
              value: height,
            },
          ];

    return (
      <div
        style={{
          position: 'absolute',
          ...DEFAULT_BOX_INFO_STYLE,
          bottom: '4%',
          left: '50%',
          transform: 'translate(-50%, 0)',
        }}
      >
        {infos.map((info, index) => (
          <span key={index} style={{ marginRight: index === 0 ? 16 : 0 }}>{`${
            info.label
          }: ${info.value.toFixed(DECIMAL_PLACES)}`}</span>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Display selected box's infos
 */
export const BoxInfos = ({
  checkMode,
  config,
  style,
}: {
  checkMode?: boolean;
  config: IPointCloudConfig;
  style?: React.CSSProperties;
}) => {
  const ptCtx = React.useContext(PointCloudContext);
  const { selectedBox } = useSingleBox();
  const [infos, setInfos] = useState<Array<{ label: string; value: string }>>([]);
  const trans = useTranslation();
  const { t, i18n } = trans;
  const isShowOnHeader = style;

  useEffect(() => {
    if (!selectedBox) {
      return;
    }
    const { length, width, height, rotation_y } = PointCloudUtils.transferBox2Kitti(
      selectedBox.info,
    );
    const { x, y, z } = selectedBox.info.center;

    let infos = [
      {
        label: 'x',
        value: x?.toFixed(DECIMAL_PLACES),
      },
      {
        label: 'y',
        value: y?.toFixed(DECIMAL_PLACES),
      },
      {
        label: 'z',
        value: z?.toFixed(DECIMAL_PLACES),
      },
      {
        label: t('Length'),
        value: length?.toFixed(DECIMAL_PLACES),
      },
      {
        label: t('Width'),
        value: width?.toFixed(DECIMAL_PLACES),
      },
      {
        label: t('Height'),
        value: height?.toFixed(DECIMAL_PLACES),
      },
      {
        label: t('Rotation_y'),
        value: UnitUtils.rad2deg(rotation_y)?.toFixed(DECIMAL_PLACES),
      },
    ];
    // Get Point Count.
    ptCtx.mainViewInstance?.filterPointsByBox(selectedBox.info).then((data) => {
      if (!data) {
        setInfos(infos);
        return;
      }

      infos.push({
        label: t('PointCount'),
        value: `${selectedBox.info?.count ?? 0}`,
      });

      //  SubAttribute is shown in checkMode
      if (checkMode === true && selectedBox.info.subAttribute && config) {
        const subAttributeNameList = PointCloudUtils.getSubAttributeName(
          selectedBox.info.subAttribute,
          config,
        );
        subAttributeNameList.forEach((data) => infos.push(data));
      }

      setInfos(infos);
    });
  }, [selectedBox, i18n.language]);

  if (selectedBox) {
    return (
      <div
        style={
          style
            ? style
            : {
                position: 'absolute',
                ...DEFAULT_BOX_INFO_STYLE,
                right: 8,
                bottom: 8,
              }
        }
      >
        {infos.map((i) => {
          if (isShowOnHeader) {
            return (
              <div key={i.label} style={{ margin: '0px 4px' }}>
                {`${i.label}: ${i.value}`}
              </div>
            );
          }
          return (
            <div key={i.label}>
              <span style={{ width: '38px', display: 'inline-block', textAlign: 'end' }}>
                {i.label}
              </span>
              : <span>{i.value}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

export const PointCloudValidity = () => {
  const ptCtx = React.useContext(PointCloudContext);
  const { t } = useTranslation();

  if (ptCtx.valid === false) {
    return (
      <div
        style={{
          position: 'absolute',
          backgroundColor: 'rgb(242, 101, 73)',
          color: 'white',
          opacity: 0.7,
          left: 0,
          top: 0,
          fontSize: 30,
          padding: '8px 16px',
          zIndex: 20,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {t('Invalid')}
      </div>
    );
  }
  return null;
};
