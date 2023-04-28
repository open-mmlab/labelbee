/**
 * Switch Pattern in PointCloudTool
 *
 * 1. Direction
 * 2. Segmentation
 */
import React, { useContext } from 'react';
import { EPointCloudName } from '@labelbee/lb-annotation';
import { EPointCloudPattern } from '@labelbee/lb-utils';
import { Button } from 'antd';
import { AppState } from '@/store';
import { connect } from 'react-redux';
import { LabelBeeContext } from '@/store/ctx';
import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';

interface IProps {
  toolName: string;
}

const SwitchPattern = ({ toolName }: IProps) => {
  const {
    globalPattern,
    setGlobalPattern,
    setTopViewInstance,
    setSideViewInstance,
    setBackViewInstance,
    setMainViewInstance,
  } = useContext(PointCloudContext);

  if (toolName !== EPointCloudName.PointCloud) {
    return null;
  }

  const clearDetection = () => {
    setTopViewInstance(undefined);
    setSideViewInstance(undefined);
    setBackViewInstance(undefined);
    setMainViewInstance(undefined);
  };

  const updateDetection = () => {
    setGlobalPattern(EPointCloudPattern.Detection);
    clearDetection();
  };
  const updateSegmentation = () => {
    setGlobalPattern(EPointCloudPattern.Segmentation);
    clearDetection();
  };

  return (
    <span style={{ margin: '0 10px' }}>
      <Button
        type={globalPattern === EPointCloudPattern.Detection ? 'primary' : undefined}
        onClick={updateDetection}
      >
        检测模式
      </Button>
      <Button
        type={globalPattern === EPointCloudPattern.Segmentation ? 'primary' : undefined}
        onClick={updateSegmentation}
      >
        分割模式
      </Button>
    </span>
  );
};

const mapStateToProps = (state: AppState) => ({
  toolName: state.annotation.stepList[state.annotation.step - 1]?.tool ?? '',
});

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(SwitchPattern);
