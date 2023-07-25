/**
 * @file Switch tool pattern
 * @author liuyong <liuyong1_vendor@sensetime.com>
 * @date 2023年07月10日
 */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { AppState } from '@/store';
import { LabelBeeContext } from '@/store/ctx';
import StepUtils from '@/utils/StepUtils';
import { IStepInfo } from '@/types/step';
import { EToolName } from '@/data/enums/ToolType';
import { EPolygonPattern, PolygonOperation } from '@labelbee/lb-annotation';
import BasicToolIcons from './basicToolIcons';

interface IProps {
  toolInstance: PolygonOperation;
  stepInfo: IStepInfo;
}

const ToolIcons = (props: IProps) => {
  const [, forceRender] = useState({});
  const { toolInstance, stepInfo } = props;

  const getSelectedTool = () => {
    if (stepInfo.tool === EToolName.Polygon) {
      return toolInstance.pattern === EPolygonPattern.Rect ? EToolName.Rect : EToolName.Polygon;
    }
    return stepInfo.tool;
  };

  const changeTool = (v: EToolName) => {
    if (v === getSelectedTool()) {
      return;
    }

    if (stepInfo.tool === EToolName.Polygon) {
      updatePolygonPattern(v);
    }
  };

  const updatePolygonPattern = (v: EToolName) => {
    const pattern = v === EToolName.Rect ? EPolygonPattern.Rect : EPolygonPattern.Normal;
    toolInstance.setPattern(pattern);
    forceRender({});
  };

  return (
    <BasicToolIcons
      toolName={stepInfo.tool}
      selectedToolName={getSelectedTool()}
      onChange={changeTool}
    />
  );
};

const mapStateToProps = (state: AppState) => {
  const stepInfo = StepUtils.getCurrentStepInfo(state.annotation?.step, state.annotation?.stepList);

  return {
    toolInstance: state.annotation.toolInstance,
    stepInfo,
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(ToolIcons);
