/**
 * @file Rotate polygon
 * @author liuyong <liuyong1_vendor@sensetime.com>
 * @date 2023年07月13日
 */
import { LabelBeeContext } from '@/store/ctx';
import { EPolygonPattern, PolygonOperation, cAnnotation } from '@labelbee/lb-annotation';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import sinistralSvg from '@/assets/annotation/toolHotKeyIcon/icon_sinistral5.svg';
import sinistralSvgA from '@/assets/annotation/toolHotKeyIcon/icon_sinistral5_a.svg';
import dextralSvg from '@/assets/annotation/toolHotKeyIcon/icon_dextral5.svg';
import dextralSvgA from '@/assets/annotation/toolHotKeyIcon/icon_dextral5_a.svg';
import { AppState } from '@/store';
import { sidebarCls } from '..';

const { ERotateDirection } = cAnnotation;

interface IProps {
  toolInstance: PolygonOperation;
}

const OperationRotate = (props: IProps) => {
  const [, forceRender] = useState({});
  const { toolInstance } = props;

  useEffect(() => {
    toolInstance.on('patternChange', () => {
      forceRender({});
    });
  }, []);

  const dataList = [
    {
      name: '左旋1°(←)',
      icon: sinistralSvg,
      hoverIcon: sinistralSvgA,
      onClick: () => toolInstance.rotatePolygon(1, ERotateDirection.Anticlockwise),
    },
    {
      name: '右旋1°(→)',
      icon: dextralSvg,
      hoverIcon: dextralSvgA,
      onClick: () => toolInstance.rotatePolygon(1, ERotateDirection.Clockwise),
    },
  ];

  if (toolInstance.pattern !== EPolygonPattern.Rect) {
    return null;
  }

  return (
    <div className={`${sidebarCls}__operationRotate`}>
      {dataList.map((item) => {
        return (
          <div key={item.name} className='operation' onClick={item.onClick}>
            <img className='icon' src={item.icon} />
            <img className='hoverIcon' src={item.hoverIcon} />
            <span>{item.name}</span>
          </div>
        );
      })}
    </div>
  );
};

const mapStateToProps = (state: AppState) => {
  return { toolInstance: state.annotation.toolInstance };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(OperationRotate);
