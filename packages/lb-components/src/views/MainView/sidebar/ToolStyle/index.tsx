import { Slider } from 'antd';
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

interface IProps {
  toolStyle: ToolStyleState;
  config: string;
}

const getMarks = (type: string) => {
  const lineMarks = [
    { step: 1, value: '1' },
    { step: 2, value: '2' },
    { step: 3, value: '3' },
    { step: 4, value: '4' },
    { step: 5, value: '5' },
  ];
  const colorMarks = [
    { step: 1, value: '蓝' },
    { step: 3, value: '青' },
    { step: 5, value: '绿' },
    { step: 7, value: '黄' },
    { step: 9, value: '粉' },
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
      label: <span>{value}</span>,
    };
  });
  return marks;
};

const getTitle = (title: string) => {
  switch (title) {
    case 'width':
      return '边框粗细';
    case 'color':
      return '颜色';
    case 'borderOpacity':
      return '边框透明度';
    case 'fillOpacity':
      return '填充透明度';
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

  const annotationConfig = props.config;

  // 判断是否需要 color 的使用，现在暂时默认不需要
  if (annotationConfig?.attributeConfigurable === true) {
    delete styleConfig.color;
  }

  const changeToolStyle = (obj: { [key: string]: number }) => {
    store.dispatch(UpdateToolStyleConfig(obj));
  };

  return (
    <div className="toolStyle">
      {Object.entries(styleConfig).map((item: any[]) => (
        <div id={`style-${item[0]}`} className="styleSlider" key={item[0]}>
          <span className="title">
            <img src={getImage(item[0])} className="icon" />
            {getTitle(item[0])}
          </span>
          <span className="slider">
            <Slider
              tipFormatter={null}
              max={getStyleType(item[0]) ? 5 : 10}
              min={getStyleType(item[0]) ? 1 : 0}
              step={getStyleType(item[0]) ? 1 : null}
              value={toolStyle[item[0]] ?? getDefaultValue(item[0])}
              marks={getMarks(item[0])}
              onChange={(e: any) => changeToolStyle({ [item[0]]: e })}
            />
          </span>
        </div>
      ))}
    </div>
  );
};
const mapStateToProps = ({ toolStyle, annotation }: AppState) => ({ toolStyle, config: annotation.toolInstance.config });
export default connect(mapStateToProps)(ToolStyle);
