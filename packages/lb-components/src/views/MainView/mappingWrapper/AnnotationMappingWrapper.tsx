/**
 * @author lijingchi <lijingchi1@sensetime.com>
 * @file 标注页面的映射视图，注入annotation的数据以嵌入到标注工具组件
 * @date 2021-12-15
 */

import React, { useMemo } from 'react';
import { getImageFromMappingUnit } from '@/utils/ImageManager';
import { connectComponent } from '@/utils/store';
import { jsonParser } from '@/utils/tool/common';
import { EAnnotationMapping } from '@/constant/task';
import { StateType } from '@/models/annotation';
import { StateType as EditAnnotationType } from '@/models/editAnnotation';
import { IMappingWrapperRenderProps, MappingWrapperRender } from './index';
import _ from 'lodash';

export interface IAnnotationMappingWrapper {
  annotation: StateType;
  editAnnotation: EditAnnotationType;
  children: JSX.Element;
  result: any[];
  rotate: number;
  basicResult: any;
}

/**
 * 标注页面（包含编辑步骤），根据标注单元（unitType）判读是否需要显示对应的视图
 * @param props: IAnnotationMappingWrapper
 */
export const AnnotationMappingWrapper = (props: IAnnotationMappingWrapper) => {
  const { annotation, editAnnotation, children, result, rotate, basicResult } = props;
  const isEdit = annotation.isEdit || editAnnotation.isEdit;
  const anno: StateType | EditAnnotationType = isEdit ? editAnnotation : annotation;
  const imageBSrc = getImageFromMappingUnit(anno, 'B');
  const imageASrc = getImageFromMappingUnit(anno);
  const { currentStep, stepList } = anno;
  const completeResult = isEdit ? {} : jsonParser(annotation.result) || {};
  const mappingConfig = annotation?.mappingConfig;
  const mappingType = mappingConfig?.mappingType;
  const isNoMapping = mappingType === EAnnotationMapping.No;
  const writtingResult = useMemo(() => {
    return isNoMapping ? [] : _.cloneDeep(result);
  }, [JSON.stringify(result), isNoMapping]);
  const unitType = annotation?.unitType;

  const mappingWrapperRenderProps: IMappingWrapperRenderProps = {
    imageBSrc,
    imageASrc,
    writtingResult,
    stepList,
    step: currentStep,
    rotate,
    unitType,
    children,
    mappingConfig,
    completeResult,
    basicResult: isNoMapping ? undefined : basicResult,
    isAnnotatePage: true,
  };

  return <MappingWrapperRender {...mappingWrapperRenderProps} />;
};

export const AnnoCtxMappingWrapper = connectComponent(
  ['annotation', 'editAnnotation', 'createStep'],
  AnnotationMappingWrapper,
);

/**
 * 计算A图的宽度
 * @param size
 * @param right
 */
export const canvasSizeForAImage = (size: ISize, right?: number) => {
  if (right) {
    return { ...size, width: size.width * right };
  }

  return size;
};
