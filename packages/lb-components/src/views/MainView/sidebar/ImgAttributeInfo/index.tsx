import { Col, Row, Slider, Switch, Input } from 'antd/es';
import { connect } from 'react-redux';
import { throttle } from 'lodash';
import React, { useEffect } from 'react';
import { ImgAttributeState } from '@/store/imgAttribute/types';
import ImgAttribute from '@/store/imgAttribute/actionCreators';
import { store } from '@/index';

import saturationSvg from '@/assets/annotation/image/saturation.svg';
import contrastSvg from '@/assets/annotation/image/contrast.svg';
import brightnessSvg from '@/assets/annotation/image/brightness.svg';
import ZoomUpSvg from '@/assets/attributeIcon/zoomUp.svg';
import originalPic from '@/assets/annotation/image/icon_yuantu.svg';
import { useTranslation } from 'react-i18next';

interface IProps {
  imgAttribute: ImgAttributeState;
}

const ImgAttributeInfo = (props: IProps) => {
  const {
    imgAttribute: { contrast, saturation, brightness, zoomRatio, isOriginalSize },
  } = props;

  const { t } = useTranslation();

  const imgAttributeChange = throttle(
    (payload: Partial<ImgAttributeState>) => {
      store.dispatch(ImgAttribute.UpdateImgAttribute(payload as ImgAttributeState));
    },
    60,
    { trailing: true },
  );

  const imgAttributeInfo = [
    {
      name: 'Saturation',
      min: -100,
      max: 500,
      step: 2,
      onChange: (v: number) => imgAttributeChange({ saturation: v }),
      value: saturation,
      svg: saturationSvg,
    },
    {
      name: 'Contrast',
      min: -100,
      max: 300,
      step: 2,
      onChange: (v: number) => imgAttributeChange({ contrast: v }),
      value: contrast,
      svg: contrastSvg,
    },
    {
      name: 'Exposure',
      min: -100,
      max: 400,
      step: 2,
      onChange: (v: number) => imgAttributeChange({ brightness: v }),
      value: brightness,
      svg: brightnessSvg,
    },
    {
      name: 'ScreenRatio',
      min: 0.1,
      max: 10,
      step: 0.1,
      onChange: (v: number) => imgAttributeChange({ zoomRatio: v }),
      value: zoomRatio,
      svg: ZoomUpSvg,
    },
  ];

  useEffect(() => {
    return () => {
      store.dispatch(ImgAttribute.InitImgAttribute());
    };
  }, []);

  return (
    <div>
      {imgAttributeInfo.map((info: any, index: number) => (
        <div className='imgAttributeController' key={`option_${index}`}>
          <Row className='tools' style={{ padding: '0px 0' }}>
            <Col span={24}>
              <span className='singleTool'>
                <img width={12} height={12} src={info.svg} />
                <span className='toolName'>{t(info.name)}</span>
              </span>
            </Col>
          </Row>
          <Row>
            <Col span={20}>
              <Slider
                min={info.min}
                max={info.max}
                step={info.step}
                value={info.value}
                onChange={info.onChange}
                trackStyle={{ background: '#666fff' }}
              />
            </Col>
            <Col span={4}>
              <Input
                value={info.value}
                disabled
                style={{
                  fontSize: 12,
                  marginBottom: 23,
                  padding: '0px 2px',
                  textAlign: 'center',
                }}
              />
            </Col>
          </Row>
        </div>
      ))}
      <div className='imgAttributeController'>
        <Row className='tools' style={{ padding: '10px 0' }}>
          <Col span={18}>
            <span className='singleTool'>
              <img src={originalPic} width={16} style={{ marginTop: '-2px' }} />
              <span className='toolName'>{t('OriginalScale')}</span>
            </span>
          </Col>
          <Col>
            <Switch
              checked={isOriginalSize}
              onChange={(v: boolean) => imgAttributeChange({ isOriginalSize: v })}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

function mapStateToProps({ imgAttribute }: any) {
  return { imgAttribute };
}

export default connect(mapStateToProps)(ImgAttributeInfo);
