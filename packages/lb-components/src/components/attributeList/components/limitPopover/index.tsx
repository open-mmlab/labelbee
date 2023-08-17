import React from 'react';
import { Tooltip } from 'antd';
import defaultSizeSvg from '@/assets/toolStyle/icon_defaultSize.svg';
import { ILimit, IDefaultSize } from '@labelbee/lb-utils';
import { useTranslation } from 'react-i18next';

const LimitPopover = ({
  limit,
  updateSize,
}: {
  limit: ILimit;
  updateSize?: (size: IDefaultSize) => void;
}) => {
  const { t } = useTranslation();
  const defaultSize = limit?.sizeLimit?.defaultSize;
  const sizeRange = limit?.sizeLimit?.sizeRange;
  const positionLimit = limit?.positionLimit;

  const { heightDefault, depthDefault, widthDefault } = defaultSize || {};
  const { heightMax, heightMin, depthMax, depthMin, widthMax, widthMin } = sizeRange || {};
  const { XMin, XMax, YMin, YMax, ZMin, ZMax } = positionLimit || {};

  return (
    <Tooltip
      color='rgba(0, 0, 0, 0.75)'
      title={
        <div style={{ padding: '8px' }}>
          {defaultSize && (
            <div style={{ marginBottom: '24px' }}>
              <div>
                【{t('DefaultSize')}】
              </div>
              <span>{`${t('Length')}: ${widthDefault}m、`}</span>
              <span>{`${t('Width')}: ${heightDefault}m、`}</span>
              <span>{`${t('Height')}: ${depthDefault}m`}</span>
            </div>
          )}

          {sizeRange && (
            <div style={{ marginBottom: '24px' }}>
              <div>*{t('NormalSizeRange')}</div>
              <span>{`${t('Length')}:: ${depthMin}~${depthMax}m、`}</span>
              <span>{`${t('Width')}: ${widthMin}~${widthMax}m、`}</span>
              <span>{`${t('Height')}: ${heightMin}~${heightMax}m`}</span>
            </div>
          )}
          {positionLimit && (
            <div>
              <div>*{t('NormalCenterPointRange')}</div>
              <span>{`X: ${XMin}~${XMax}、`}</span>
              <span>{`Y: ${YMin}~${YMax}、`}</span>
              <span>{`Z: ${ZMin}~${ZMax}`}</span>
            </div>
          )}
        </div>
      }
      placement='bottomRight'
    >
      <img
        src={defaultSizeSvg}
        style={{ margin: '0px 8px' }}
        onClick={(e) => {
          e.preventDefault()
          if (defaultSize) {
            updateSize?.(defaultSize)
          }
        }}
      />
    </Tooltip>
  );
};
export default LimitPopover;
