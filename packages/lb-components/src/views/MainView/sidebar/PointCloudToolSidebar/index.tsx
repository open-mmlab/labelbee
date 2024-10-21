import React, { useContext, useState, useEffect } from 'react';
import { EditFilled } from '@ant-design/icons';
import { ToolIcons } from '../ToolIcons';
import { EToolName } from '@/data/enums/ToolType';
import { cTool } from '@labelbee/lb-annotation';
import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import { message, Input, Divider } from 'antd';
import { AppState } from '@/store';
import StepUtils from '@/utils/StepUtils';
import { connect } from 'react-redux';
import { IStepInfo } from '@/types/step';
import { classnames, jsonParser } from '@/utils';
import { ICustomToolInstance } from '@/hooks/annotation';
import { useStatus } from '@/components/pointCloudView/hooks/useStatus';
import { useSingleBox } from '@/components/pointCloudView/hooks/useSingleBox';
import { useTranslation } from 'react-i18next';
import { LabelBeeContext, useDispatch } from '@/store/ctx';
import BatchUpdateModal from './components/batchUpdateModal';
import AnnotatedBox from './components/annotatedBox';
import RectRotateSensitivitySlider from './components/rectRotateSensitivitySlider';
import FindTrackIDIndex from './components/findTrackIDIndex';
import FirstFrameDataSwitch from './components/firstFrameDataSwitch';
import SelectBoxVisibleSwitch from './components/selectBoxVisibleSwitch';
import { IFileItem } from '@/types/data';
import {
  IInputList,
  IDefaultSize,
  EPointCloudSegmentStatus,
  IPointCloudSegmentation,
  EPointCloudPattern,
} from '@labelbee/lb-utils';
import AttributeList from '@/components/attributeList';
import { useAttribute } from '@/components/pointCloudView/hooks/useAttribute';
import LassoSelectorSvg from '@/assets/annotation/pointCloudTool/lassoSelector.svg';
import LassoSelectorSvgA from '@/assets/annotation/pointCloudTool/lassoSelector_a.svg';
import CirCleSelectorSvg from '@/assets/annotation/pointCloudTool/circleSelector.svg';
import CirCleSelectorSvgA from '@/assets/annotation/pointCloudTool/circleSelector_a.svg';
import RectSvg from '@/assets/annotation/rectTool/icon_rect.svg';
import RectASvg from '@/assets/annotation/rectTool/icon_rect_a.svg';
import { sidebarCls } from '..';
import { SetTaskStepList } from '@/store/annotation/actionCreators';
import { usePointCloudViews } from '@/components/pointCloudView/hooks/usePointCloudViews';
import SubAttributeList from '@/components/subAttributeList';
import DynamicResizer from '@/components/DynamicResizer';
interface IProps {
  stepInfo: IStepInfo;
  toolInstance: ICustomToolInstance; // Created by useCustomToolInstance.
  imgList: IFileItem[];
  imgIndex: number;
  stepList: IStepInfo[];
  enableColorPicker?: boolean;
}

const BoxTrackIDInput = () => {
  const [isEdit, setIsEdit] = useState(false);
  const ptCtx = useContext(PointCloudContext);
  const { pointCloudBoxList } = ptCtx;
  const { selectedBox, updateSelectedBox } = useSingleBox();
  const [inputValue, setInputValue] = useState('');
  const { t } = useTranslation();

  const selectedBoxTrackID = selectedBox?.info.trackID;

  const hasDuplicateTrackID = (trackID: number) => {
    const duplicateBox = pointCloudBoxList.find(
      (v) => v.trackID === trackID && v.id !== selectedBox?.info.id,
    );
    return !!duplicateBox;
  };

  const applyInputValue = (isBlurEvent = false) => {
    const newTrackID = parseInt(inputValue, 10);
    if (isBlurEvent) {
      setIsEdit(false);
    }

    if (isNaN(newTrackID)) {
      message.error(t('PositiveIntegerCheck'));
      return;
    }

    if (inputValue.indexOf('.') > -1) {
      message.error(t('NotAllowDecimalPointsInTrackID'));
      return;
    }

    if (hasDuplicateTrackID(newTrackID)) {
      message.error(t('DuplicateTrackIDsExist'));
      return;
    }

    if (!(newTrackID > 0)) {
      message.error(t('PositiveIntegerCheck'));
      return;
    }

    updateCurrentPolygonList(newTrackID);
  };

  useEffect(() => {
    setIsEdit(false);
  }, [selectedBoxTrackID]);

  const updateCurrentPolygonList = (newTrackID: number) => {
    const newPointCloudList = updateSelectedBox({ trackID: newTrackID });
    ptCtx?.topViewInstance?.updatePolygonList(newPointCloudList ?? []);
    if (ptCtx.mainViewInstance && ptCtx.selectedPointCloudBox) {
      ptCtx?.mainViewInstance.generateBox(ptCtx?.selectedPointCloudBox);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{t('CurrentBoxTrackIDs')}</span>
        {selectedBoxTrackID && (
          <BatchUpdateModal
            id={selectedBoxTrackID}
            updateCurrentPolygonList={(value) => updateCurrentPolygonList(value)}
          />
        )}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          lineHeight: '12px',
        }}
      >
        {isEdit && selectedBoxTrackID ? (
          <Input
            defaultValue={selectedBoxTrackID}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            disabled={!selectedBoxTrackID}
            size='small'
            onBlur={() => {
              applyInputValue();
            }}
            onPressEnter={() => {
              applyInputValue(true);
            }}
          />
        ) : (
          <span>{selectedBoxTrackID}</span>
        )}
        <EditFilled
          style={{
            color: '#999',
            marginLeft: 16,
            cursor: typeof selectedBoxTrackID !== 'undefined' ? 'pointer' : 'not-allowed',
          }}
          onClick={() => {
            if (selectedBoxTrackID) {
              setIsEdit(!isEdit);
            }
          }}
        />
      </div>
    </div>
  );
};

/**
 * Determine if the
 */
const isAllowUpdateInSegment = ({
  segmentStatus,
  globalPattern,
}: {
  segmentStatus: EPointCloudSegmentStatus;
  globalPattern: EPointCloudPattern;
}) => {
  return (
    globalPattern === EPointCloudPattern.Segmentation &&
    ![EPointCloudSegmentStatus.Edit, EPointCloudSegmentStatus.Ready].includes(segmentStatus)
  );
};

const AttributeUpdater = ({
  attributeList,
  subAttributeList,
  toolInstance,
  config,
  stepList,
  stepInfo,
  enableColorPicker,
}: {
  toolInstance: ICustomToolInstance;
  attributeList: IInputList[];
  subAttributeList: any[]; // TODO: Type definition
  config: any;
  stepList: IStepInfo[];
  stepInfo: IStepInfo;
  enableColorPicker?: boolean;
}) => {
  const [segmentData, setSegmentData] = useState<{
    segmentStatus: EPointCloudSegmentStatus;
    cacheSegData?: IPointCloudSegmentation;
  }>({
    segmentStatus: EPointCloudSegmentStatus.Ready,
  });

  const { selectedBox } = useSingleBox();
  const ptx = useContext(PointCloudContext);
  const { ptSegmentInstance } = ptx;
  const { t } = useTranslation();
  const { defaultAttribute } = useAttribute();
  const pointCloudViews = usePointCloudViews();
  const { isPointCloudSegmentationPattern } = useStatus();

  const dispatch = useDispatch();

  const titleStyle = {
    fontWeight: 500,
    fontSize: 14,
    margin: '12px 0 8px 20px',
  };

  useEffect(() => {
    if (!ptSegmentInstance) {
      return;
    }
    ptSegmentInstance.on('syncPointCloudStatus', setSegmentData);

    return () => {
      ptSegmentInstance.unbind('syncPointCloudStatus', setSegmentData);
    };
  }, [ptSegmentInstance]);

  const updateColorConfig = (value: string, color: string) => {
    const attributeList = config?.attributeList?.map((i: any) => {
      if (i.value === value) {
        return { ...i, color };
      }
      return i;
    });

    const formatConfig = { ...config, attributeList };
    const configStr = JSON.stringify(formatConfig);
    const formatStepList = stepList?.map((i: IStepInfo) => {
      if (i?.step === stepInfo?.step) {
        return { ...i, config: configStr };
      }
      return i;
    });
    ptx?.topViewInstance?.updateAttributeList(attributeList);
    ptx?.sideViewInstance?.updateAttributeList(attributeList);
    ptx?.backViewInstance?.updateAttributeList(attributeList);
    ptx?.mainViewInstance?.setConfig(formatConfig);
    dispatch(SetTaskStepList({ stepList: formatStepList }));
  };

  const updateSize = (size: IDefaultSize) => {
    if (pointCloudViews.updateViewsByDefaultSize) {
      pointCloudViews.updateViewsByDefaultSize(size);
    }
  };

  const setAttribute = (attribute: string) => {
    if (
      isAllowUpdateInSegment({
        globalPattern: ptx.globalPattern,
        segmentStatus: segmentData.segmentStatus,
      })
    ) {
      return;
    }

    toolInstance.setDefaultAttribute(attribute);
  };

  const setSubAttribute = (key: string, value: string) => {
    if (
      isAllowUpdateInSegment({
        globalPattern: ptx.globalPattern,
        segmentStatus: segmentData.segmentStatus,
      })
    ) {
      return;
    }

    toolInstance.setSubAttribute(key, value);
  };

  const list = attributeList.map((i: IInputList) => ({
    label: i.key,
    value: i.value,
    color: i?.color,
    limit: i?.limit,
    isDefault: i?.isDefault,
  }));

  const isSelected =
    selectedBox ||
    (segmentData.cacheSegData && segmentData.segmentStatus === EPointCloudSegmentStatus.Edit);

  // Just segment pattern forbid limitPopover
  const forbidShowLimitPopover = isPointCloudSegmentationPattern;

  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={titleStyle}>{t('Attribute')}</div>
      <div
        style={{
          height: 0,
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <AttributeList
          list={list}
          forbidDefault={true}
          selectedAttribute={defaultAttribute ?? ''}
          attributeChanged={(attribute: string) => setAttribute(attribute)}
          updateColorConfig={updateColorConfig}
          enableColorPicker={enableColorPicker}
          updateSize={updateSize}
          forbidShowLimitPopover={forbidShowLimitPopover}
        />
        <Divider style={{ margin: 0 }} />
        {isSelected && (
          <SubAttributeList
            subAttributeList={subAttributeList}
            setSubAttribute={setSubAttribute}
            getValue={(subAttribute) => {
              return (
                ptx.selectedPointCloudBox?.subAttribute?.[subAttribute.value] ||
                segmentData.cacheSegData?.subAttribute?.[subAttribute.value]
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

const renderSegmentTools = [
  {
    toolName: 'LassoSelector',
    commonSvg: LassoSelectorSvg,
    selectedSvg: LassoSelectorSvgA,
  },
  {
    toolName: 'RectSelector',
    commonSvg: RectSvg,
    selectedSvg: RectASvg,
  },
  {
    toolName: 'CircleSelector',
    commonSvg: CirCleSelectorSvg,
    selectedSvg: CirCleSelectorSvgA,
  },
];

export const PointCloudSegToolIcon = ({ toolInstance }: { toolInstance: ICustomToolInstance }) => {
  const { ptSegmentInstance } = useContext(PointCloudContext);
  const [currentTool, setCurrentTool] = useState('LassoSelector');
  const { t } = useTranslation();

  useEffect(() => {
    if (!ptSegmentInstance) {
      return;
    }

    const updateLassoSelector = () => {
      setCurrentTool('LassoSelector');
    };

    const updateRectSelector = () => {
      setCurrentTool('RectSelector');
    };

    const updateCircleSelector = () => {
      setCurrentTool('CircleSelector');
    };

    ptSegmentInstance.on('LassoSelector', updateLassoSelector);
    ptSegmentInstance.on('RectSelector', updateRectSelector);
    ptSegmentInstance.on('CircleSelector', updateCircleSelector);
    return () => {
      ptSegmentInstance.unbind('LassoSelector', updateLassoSelector);
      ptSegmentInstance.unbind('RectSelector', updateRectSelector);
      ptSegmentInstance.unbind('CircleSelector', updateCircleSelector);
    };
  }, [ptSegmentInstance]);

  return (
    <div className={`${sidebarCls}__level`}>
      {renderSegmentTools.map((tool) => {
        const isSelected = currentTool === tool.toolName;
        return (
          <span
            className={`${sidebarCls}__toolOption`}
            key={tool.toolName}
            onClick={() => ptSegmentInstance?.emit(tool.toolName)}
          >
            <img
              className={`${sidebarCls}__singleTool`}
              src={isSelected ? tool?.selectedSvg : tool?.commonSvg}
            />
            <span
              className={classnames({
                [`${sidebarCls}__toolOption__selected`]: isSelected,
              })}
            >
              {t(tool.toolName)}
            </span>
          </span>
        );
      })}
    </div>
  );
};

const PointCloudToolSidebar: React.FC<IProps> = ({
  stepInfo,
  toolInstance,
  imgList,
  imgIndex,
  stepList,
  enableColorPicker,
}) => {
  const { updatePointCloudPattern, pointCloudPattern, isPointCloudSegmentationPattern } =
    useStatus();

  const config = jsonParser(stepInfo.config);
  const attributeList = config?.attributeList ?? [];
  const subAttributeList =
    config?.secondaryAttributeConfigurable === true ? config?.inputList ?? [] : [];

  if (isPointCloudSegmentationPattern) {
    return (
      <>
        <PointCloudSegToolIcon toolInstance={toolInstance} />
        <AttributeUpdater
          toolInstance={toolInstance}
          attributeList={attributeList}
          subAttributeList={subAttributeList}
          config={config}
          stepList={stepList}
          stepInfo={stepInfo}
          enableColorPicker={enableColorPicker}
        />
      </>
    );
  }

  return (
    <>
      <ToolIcons
        toolName={cTool.EPointCloudName.PointCloud}
        selectedToolName={pointCloudPattern}
        onChange={(v) => updatePointCloudPattern?.(v)}
      />
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <DynamicResizer
          minTopHeight={42}
          defaultHeight={400}
          localKey={
            'id:' +
            stepInfo?.id +
            'taskID:' +
            stepInfo?.taskID +
            'step:' +
            stepInfo?.step +
            'type:' +
            stepInfo?.type
          }
        >
          <AttributeUpdater
            toolInstance={toolInstance}
            attributeList={attributeList}
            subAttributeList={subAttributeList}
            config={config}
            stepList={stepList}
            stepInfo={stepInfo}
            enableColorPicker={enableColorPicker}
          />
          {config?.trackConfigurable === true && pointCloudPattern === EToolName.Rect ? (
            <div
              style={{
                height: '100%',
                overflow: 'auto',
              }}
            >
              <BoxTrackIDInput />
              <Divider style={{ margin: 0 }} />
              <AnnotatedBox imgList={imgList} imgIndex={imgIndex} />
              <Divider style={{ margin: 0 }} />
              <FindTrackIDIndex imgList={imgList} imgIndex={imgIndex} />
              <Divider style={{ margin: 0 }} />
              <RectRotateSensitivitySlider />
              {stepInfo.loadPreStep > 0 && <FirstFrameDataSwitch />}
              <SelectBoxVisibleSwitch />
            </div>
          ) : (
            <div />
          )}
        </DynamicResizer>
      </div>
    </>
  );
};

const mapStateToProps = (state: AppState) => {
  const stepInfo = StepUtils.getCurrentStepInfo(state.annotation?.step, state.annotation?.stepList);
  const toolInstance = state.annotation?.toolInstance;
  const stepList = state.annotation?.stepList;

  return {
    stepInfo,
    toolInstance,
    imgList: state.annotation.imgList,
    imgIndex: state.annotation.imgIndex,
    stepList,
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloudToolSidebar,
);
