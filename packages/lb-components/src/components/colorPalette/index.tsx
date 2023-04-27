/**
 * @file Color Palette
 * @author lixinghua <lixinghua_vendor@sensetime.com>
 * @date 2023.04.24
 */
import React from 'react';
import { RgbaColorPicker } from 'react-colorful';
import { toRGBAObj, toRGBAStr } from '@/utils/colorUtils';

interface IProps {
  defaultColor?: string;
  setColor: (color: string) => void;
}

const Palette = (props: IProps) => {
  const { setColor, defaultColor } = props;

  return (
    <RgbaColorPicker
      color={defaultColor && toRGBAObj(defaultColor)}
      onChange={(values) => {
        const colorStr = toRGBAStr(values);
        setColor(colorStr);
      }}
    />
  );
};
export default Palette;
