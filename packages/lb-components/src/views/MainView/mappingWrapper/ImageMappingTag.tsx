/**
 * @author lijingchi <lijingchi1@sensetime.com>
 * @file 映射视图左上角Tag组件
 * @date 2021-12-15
 */

import React from 'react';
import { EAnnotationMapping } from '@/constant/task';
import { MappingImageType } from '@/types/task';

/**
 * 根据mappingType, 获取B图映射描述
 * @param mappingType
 */
const getImageBDesc = (mappingType?: EAnnotationMapping) => {
  if (mappingType === EAnnotationMapping.OneOne) {
    return '(A图映射)';
  }

  if (mappingType === EAnnotationMapping.Fisheye) {
    return '(A图鱼眼映射)';
  }

  return '';
};

/**
 * 映射Tag, 定位在A、B图的左上角
 * @param props
 */
export const ImageMappingTag = (props: {
  imageType: MappingImageType;
  mappingType?: EAnnotationMapping;
}) => {
  const { imageType, mappingType } = props;
  const text = imageType === 'A' ? 'A图' : `B图，仅预览${getImageBDesc(mappingType)}`;

  return (
    <div
      style={{
        background: 'rgba(153, 153, 153, 0.8)',
        color: 'white',
        position: 'absolute',
        top: 0,
        left: 0,
        padding: '4px 12px',
        zIndex: 12,
        lineHeight: '20px',
      }}
    >
      {text}
    </div>
  );
};
