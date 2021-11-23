import { Slider } from 'antd/es';
import React from 'react';
import widthSvg from '@/assets/toolStyle/icon_border.svg';
import colorSvg from '@/assets/toolStyle/icon_borderColor.svg';
import borderOpacitySvg from '@/assets/toolStyle/icon_opacityStroke.svg';
import fillOpacitySvg from '@/assets/toolStyle/icon_opacityFill.svg';

import { connect } from 'react-redux';
import { UpdateToolStyleConfig } from '@/store/toolStyle/actionCreators';
import { store } from '@/index';
import { AppState } from '@/store';
import { ToolStyleState } from '@/store/toolStyle/types';
import { useTranslation } from 'react-i18next';

interface IProps {
  toolStyle: ToolStyleState;
  config: string;
}
type ToolStyleKey = keyof ToolStyleState;

const getMarks = (type: string, t: any) => {
  const lineMarks = [
    { step: 1, value: '1' },
    { step: 2, value: '2' },
    { step: 3, value: '3' },
    { step: 4, value: '4' },
    { step: 5, value: '5' },
  ];
  const colorMarks = [
    { step: 1, value: 'Blue' },
    { step: 3, value: 'Cyan' },
    { step: 5, value: 'Green' },
    { step: 7, value: 'Yellow' },
    { step: 9, value: 'Pink' },
  ];
  const borderOpacityMarks = [
    { step: 1, value: '0.2' },
    { step: 3, value: '0.4' },
    { step: 5, value: '0.6' },
    { step: 7, value: '0.8' },
    { step: 9, value: '1.0' },
  ];

  const fillOpacityMarks = [
    { step: 1, value: '0' },
    { step: 3, value: '0.2' },
    { step: 5, value: '0.4' },
    { step: 7, value: '0.6' },
    { step: 9, value: '0.8' },
  ];
  let list: Array<{ step: number; value: string }> = [];
  const marks: {
    [a: number]: {
      style: {};
      label: any;
    };
  } = {};
  switch (type) {
    case 'width':
      list = lineMarks;
      break;
    case 'color':
      list = colorMarks;
      break;
    case 'borderOpacity':
      list = borderOpacityMarks;
      break;
    case 'fillOpacity':
      list = fillOpacityMarks;
      break;
  }
  list.forEach(({ step, value }) => {
    marks[step] = {
      style: { color: '#999999', fontSize: '12px' },
      label: <span>{t(value)}</span>,
    };
  });
  return marks;
};

const getTitle = (title: string) => {
  switch (title) {
    case 'width':
      return 'BorderThickness';
    case 'color':
      return 'Color';
    case 'borderOpacity':
      return 'BorderOpacity';
    case 'fillOpacity':
      return 'FillOpacity';
    default:
      return '';
  }
};
const getImage = (title: string) => {
  switch (title) {
    case 'width':
      return widthSvg;
    case 'color':
      return colorSvg;
    case 'borderOpacity':
      return borderOpacitySvg;
    case 'fillOpacity':
      return fillOpacitySvg;
  }
};
const getDefaultValue = (value: string) => {
  switch (value) {
    case 'width':
      return 2;
    case 'color':
      return 1;
    case 'borderOpacity':
      return 9;
    case 'fillOpacity':
      return 9;
  }
};

/**
 * 判断使用那种样式 (slider的step中间为选中和step为选中)
 * @param info TToolStyleConfig
 */
const getStyleType = (info: string): boolean => ['width'].includes(info);

const ToolStyle = (props: IProps) => {
  const { toolStyle } = props;
  const { width, color, borderOpacity, fillOpacity } = toolStyle;
  const styleConfig = {
    width,
    color,
    borderOpacity,
    fillOpacity,
  };
  const { t } = useTranslation();

  // TODO - 样式标准的定义
  const annotationConfig: any = props.config;

  const changeToolStyle = (obj: { [key: string]: number }) => {
    store.dispatch(UpdateToolStyleConfig(obj));
  };

  return (
    <div className='toolStyle'>
      {Object.entries(styleConfig).map((item: any[]) => {
        const key: ToolStyleKey = item[0];
        // 判断是否需要 color 的使用，现在暂时默认不需要
        if (annotationConfig?.attributeConfigurable === true && key === 'color') {
          return null;
        }
        return (
          <div id={`style-${key}`} className='styleSlider' key={key}>
            <span className='title'>
              <img src={getImage(key)} className='icon' />
              {t(getTitle(key))}
            </span>
            <span className='slider'>
              <Slider
                tipFormatter={null}
                max={getStyleType(key) ? 5 : 10}
                min={getStyleType(key) ? 1 : 0}
                step={getStyleType(key) ? 1 : null}
                value={(toolStyle[key] ?? getDefaultValue(key)) as number}
                marks={getMarks(key, t)}
                onChange={(e: any) => changeToolStyle({ [key]: e })}
              />
            </span>
          </div>
        );
      })}
    </div>
  );
};
const mapStateToProps = ({ toolStyle, annotation }: AppState) => ({
  toolStyle,
  config: annotation.toolInstance.config,
});
export default connect(mapStateToProps)(ToolStyle);
