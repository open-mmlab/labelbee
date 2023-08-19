/**
 * @author lijingchi <lijingchi1@sensetime.com>
 * @file B图映射渲染组件，根据A图的结果进行悬案
 * @date 2021-12-15
 */

import React, { useContext, useMemo } from 'react';
import { BasicOperationContext } from '../tools/basicOperation';
import { EToolName } from '@/constant/tool';
import DrawPolygon from '@/pages/checkTool/components/DrawPolygon';
import DrawLine from '@/pages/checkTool/components/DrawLine';
import DrawPoint from '@/components/tools/pointTool/drawPoint';
import DrawTag from '@/pages/checkTool/components/tagTool';
import DrawImage from '@/components/tools/drawImage';
import { StaticViewWithRelyData } from '../StaticView';
import { getCurrentStepInfo, jsonParser } from '@/utils/tool/common';
import { IStepConfig } from '@/service/task';
import { ITagConfig } from '@/types/toolConfig';
import { uniqWith } from 'lodash';
import { EStepType } from '@/constant/task';
import { ReactComponent as BPoint } from '@/assets/icon/BPoint.svg';
import { connectComponent } from '@/utils/store';

export interface IMappingViewGraphicProps {
  transferedResult: any[];
  step: number;
  stepList: IStepConfig[];
  isCheckTool?: boolean;
  isAnnotatePage?: boolean;
}

const fillLableAndFindCoordForTags = (transferedResult: any[], config: ITagConfig) => {
  const tags = transferedResult.map((i) => {
    const resultKeyFromInputList: any = {};
    if (i.result) {
      Object.keys(i.result).forEach((r) => {
        const inputItem = config.inputList.find((s) => s.value === r);
        const valueItem = inputItem && inputItem.subSelected?.find((s) => s.value === i.result[r]);

        if (inputItem && valueItem) {
          resultKeyFromInputList[inputItem.key] = valueItem.key;
        } else {
          resultKeyFromInputList[r] = i.result[r];
        }
      });

      return {
        ...i,
        result: resultKeyFromInputList,
      };
    }

    return i;
  });

  return tags;
};

/**
 * 支持多个形式的参数传递
 * @param props
 */
export const GraphicMappingViewWrapper = (props: IMappingViewGraphicProps) => {
  const { transferedResult, stepList, step, isCheckTool } = props;
  const stepArray = isCheckTool
    ? uniqWith(transferedResult, (arrVal, othVal) => {
        return arrVal.step === othVal.step && arrVal.stepType === othVal.stepType;
      })
    : [{ step }];

  return stepArray.map((s) => {
    const stepType = s.stepType ?? EStepType.ANNOTATION;
    const isPre = stepType === EStepType.PRE_ANNOTATION;
    const stepInfo = isPre
      ? { tool: s.tool, step: s.step, config: '{}' }
      : getCurrentStepInfo(s.step, stepList);

    const result = isCheckTool
      ? transferedResult.filter((r) => r.step === s.step && r.stepType === stepType)
      : transferedResult;

    return (
      <GraphicMappingView
        stepInfo={stepInfo}
        result={result}
        key={stepInfo?.step + stepInfo?.stepType}
      />
    );
  });
};

/**
 * 映射视图，目前支持 多边形、线条、标点、标签
 * @param IMappingViewGraphicProps
 */
const GraphicMappingView = (props: { result: any[]; stepInfo: any }) => {
  const { result, stepInfo } = props;
  const { tool, config: configStr } = stepInfo || {};
  const config = jsonParser(configStr);
  const { imgNode, currentPos, zoom, rotate, size } = useContext(BasicOperationContext);

  const toolProps = {
    imgNode,
    currentPos,
    zoom,
    rotate,
    size,
    config,
    result,
  };

  if (tool === EToolName.Polygon) {
    return <DrawPolygon {...toolProps} isShowBackground={true} />;
  }

  if (tool === EToolName.Line) {
    return <DrawLine {...toolProps} />;
  }

  if (tool === EToolName.Point) {
    return <DrawPoint {...toolProps} point={result} />;
  }

  if (tool === EToolName.Tag) {
    const tags = fillLableAndFindCoordForTags(result, config);
    const hasPos = tags.some((i) => i.x || i.y);

    return (
      <DrawTag
        {...toolProps}
        tag={tags}
        style={{
          backgroundColor: hasPos ? 'initial' : '#666fff',
          opacity: hasPos ? 1 : 0.6,
        }}
      />
    );
  }

  return null;
};

const ImageViewUsedContext = () => {
  const context = useContext(BasicOperationContext);
  return <DrawImage {...context} />;
};

/** 图片B光标中心点, 在syncMappingView（缩放同步）开启后显示 */
const ImageBCursor = connectComponent(
  ['imgAttribute'],
  ({
    isAnnotatePage,
    imgAttribute,
  }: {
    isAnnotatePage?: boolean;
    imgAttribute: IImageAttribute;
  }) => {
    const context = useContext(BasicOperationContext);
    const { top, left } = useMemo(() => {
      /** 中心点对齐 图片size为 12*12 */
      return {
        top: context.imageACoord.y - 6,
        left: context.imageACoord.x - 6,
      };
    }, [context.imageACoord.x, context.imageACoord.y]);

    if (isAnnotatePage && imgAttribute.syncMappingView) {
      return <BPoint style={{ top, left, position: 'absolute' }} />;
    }

    return null;
  },
);

export const MappingView = (
  props: IMappingViewGraphicProps & { completeResult: any; transferedResult: any },
) => {
  const {
    transferedResult,
    step,
    stepList,
    completeResult,
    basicResult,
    isCheckTool,
    isAnnotatePage,
  } = props;

  return (
    <>
      <ImageViewUsedContext />
      <StaticViewWithRelyData
        step={step}
        stepList={stepList}
        completeResult={completeResult}
        basicResult={basicResult}
      />
      <GraphicMappingViewWrapper
        transferedResult={transferedResult}
        step={step}
        stepList={stepList}
        isCheckTool={isCheckTool}
      />
      <ImageBCursor isAnnotatePage={isAnnotatePage} />
    </>
  );
};
