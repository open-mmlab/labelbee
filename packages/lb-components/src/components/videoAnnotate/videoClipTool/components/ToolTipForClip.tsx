import { timeFormat, precisionMinus } from '@/utils/audio';
import { IVideoTimeSlice, IInputList } from '@labelbee/lb-utils';
import { AttributeUtils } from '@labelbee/lb-annotation';
import { Tooltip } from 'antd';
import React from 'react';
import { ETimeSliceType } from '../constant';
import { decimalReserved } from '@/components/videoPlayer/utils'
import { useTranslation } from 'react-i18next';

const ToolTipForClip = (props: {
  slot: React.ReactElement | undefined;
  item: IVideoTimeSlice;
  attributeList: IInputList[];
}) => {
  const { slot, item, attributeList } = props;
  const { t } = useTranslation();

  if (!slot) {
    return null;
  }
  const { type, attribute, textAttribute } = item;
  if (item.start === undefined || item.end === undefined) {
    return null;
  }

  const start = decimalReserved(item.start, 2);
  const end = decimalReserved(item.end ?? 0, 2) ?? 0;

  const title = (
    <div>
      <div>
        {type === ETimeSliceType.Period
          ? `${timeFormat(start, 'ss:SS')}~${timeFormat(end, 'ss:SS')}，${precisionMinus(
              end,
              start,
            )}s`
          : timeFormat(start, 'ss:SS')}
      </div>
      <div>{`${t('Attribute')}：${AttributeUtils.getAttributeShowText(attribute, attributeList) || t('NoAttribute')}`}</div>
      <div>{`${t('textTool')}：${textAttribute}`}</div>
    </div>
  );
  return <Tooltip title={title}>{slot}</Tooltip>;
};

export default ToolTipForClip;
