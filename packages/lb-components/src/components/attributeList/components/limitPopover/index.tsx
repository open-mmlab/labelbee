import React from 'react';
import { Tooltip } from 'antd';
import styleLockSvg from '@/assets/toolStyle/icon_styleLock.svg';
import styleLockActivateSvg from '@/assets/toolStyle/icon_styleLock_a.svg';
import { ILimit } from '@labelbee/lb-utils';
import { useTranslation } from 'react-i18next';

const LimitPopover = ({
  limit,
  isDefaultSize,
  onChange,
}: {
  limit: ILimit;
  isDefaultSize: boolean;
  onChange: () => void;
}) => {
  const { t } = useTranslation();
  const defaultSize = limit?.sizeLimit?.defaultSize;
  const sizeRange = limit?.sizeLimit?.sizeRange;
  const positionLimit = limit?.positionLimit;

  const { heightDefault, lengthDefault, widthDefault } = defaultSize;
  const { heightMax, heightMin, lengthMax, lengthMin, widthMax, widthMin } = sizeRange;
  const { XMin, XMax, YMin, YMax, ZMin, ZMax } = positionLimit;

  return (
    <Tooltip
      color='rgba(0, 0, 0, 0.75)'
      title={
        <div style={{ padding: '8px' }}>
          {defaultSize && (
            <div style={{ marginBottom: '24px' }}>
              <div>
                {t('DefaultSize')}({isDefaultSize ? t('Locked') : t('Unlocked')})
              </div>
              <span>{`${t('Length')}: ${lengthDefault}、`}</span>
              <span>{`${t('Width')}: ${widthDefault}、`}</span>
              <span>{`${t('Height')}: ${heightDefault}`}</span>
            </div>
          )}

          {sizeRange && (
            <div style={{ marginBottom: '24px' }}>
              <div>{t('NormalSizeRange')}</div>
              <span>{`${t('Length')}:: ${lengthMin}~${lengthMax}、`}</span>
              <span>{`${t('Width')}: ${widthMin}~${widthMax}、`}</span>
              <span>{`${t('Height')}: ${heightMin}~${heightMax}`}</span>
            </div>
          )}
          {positionLimit && (
            <div>
              <div>{t('NormalCenterPointRange')}</div>
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
        src={isDefaultSize ? styleLockActivateSvg : styleLockSvg}
        style={{ margin: '0px 8px' }}
      />
    </Tooltip>
  );
};
export default LimitPopover;
