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
  const LOGICAL_TEXT: { [a: string]: string } = {
    and: t('And'),
    or: t('Or'),
  };
  const defaultSize = limit?.sizeLimit?.defaultSize;
  const sizeRange = limit?.sizeLimit?.sizeRange;
  const logicalCondition = limit?.sizeLimit?.logicalCondition || [];
  const positionLimit = limit?.positionLimit;

  const { heightDefault, depthDefault, widthDefault } = defaultSize || {};
  const { heightMax, heightMin, depthMax, depthMin, widthMax, widthMin } = sizeRange || {};
  const { XMin, XMax, YMin, YMax, ZMin, ZMax } = positionLimit || {};
  const showNormalSizeRangeBox = logicalCondition.length > 0 || sizeRange;

  /**
   * width:长
   * height：宽
   * depth: 高
   * @param text （配置的字段）
   * @returns
   */
  const gitText = (text: string) => {
    switch (text) {
      case 'width':
        return t('Length');
      case 'height':
        return t('Width');
      case 'depth':
        return t('Height');
    }
    return '';
  };

  return (
    <Tooltip
      color='rgba(0, 0, 0, 0.75)'
      title={
        <div style={{ padding: '8px' }}>
          {defaultSize && (
            <div style={{ marginBottom: '24px' }}>
              <div>【{t('DefaultSize')}】</div>
              <span>{`${t('Length')}: ${widthDefault}m、`}</span>
              <span>{`${t('Width')}: ${heightDefault}m、`}</span>
              <span>{`${t('Height')}: ${depthDefault}m`}</span>
            </div>
          )}

          {showNormalSizeRangeBox && (
            <div style={{ marginBottom: '24px' }}>
              <div>*{t('NormalSizeRange')}</div>
              {sizeRange && (
                <span>
                  (<span>{`${t('Length')}: ${widthMin}~${widthMax}m、`}</span>
                  <span>{`${t('Width')}: ${heightMin}~${heightMax}m、`}</span>
                  <span>{`${t('Height')}: ${depthMin}~${depthMax}m`}</span>)
                </span>
              )}

              {logicalCondition.length > 0 && (
                <>
                  {sizeRange ? ` ${LOGICAL_TEXT[logicalCondition[0]?.logical]} ` : null}
                  <span>
                    (
                    {logicalCondition.map((i, index) => {
                      const leftText = gitText(i?.dimensionLeft);
                      const rightText = gitText(i?.dimensionRight);
                      return (
                        <span key={index}>
                          {index !== 0 ? ` ${LOGICAL_TEXT[i?.logical]} ` : null}
                          {`${leftText} ${i?.condition} ${rightText} `}
                        </span>
                      );
                    })}
                    )
                  </span>
                </>
              )}
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
          e.preventDefault();
          if (defaultSize) {
            updateSize?.(defaultSize);
          }
        }}
      />
    </Tooltip>
  );
};
export default LimitPopover;
