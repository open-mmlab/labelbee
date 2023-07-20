import React, { useContext, useState, useEffect } from 'react';
import { EditFilled } from '@ant-design/icons';
import { ToolIcons } from '../ToolIcons';
import { cTool } from '@labelbee/lb-annotation';
import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import { Select, Tag, message, Input, Divider } from 'antd';
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
import { IFileItem } from '@/types/data';
import { PointCloudUtils } from '@labelbee/lb-utils';
import AttributeList from '@/components/attributeList';
import { IInputList } from '@/types/main';
import { useAttribute } from '@/components/pointCloudView/hooks/useAttribute';
import LassoSelectorSvg from '@/assets/annotation/pointCloudTool/lassoSelector.svg';
import LassoSelectorSvgA from '@/assets/annotation/pointCloudTool/lassoSelector_a.svg';
import CirCleSelectorSvg from '@/assets/annotation/pointCloudTool/circleSelector.svg';
import CirCleSelectorSvgA from '@/assets/annotation/pointCloudTool/circleSelector_a.svg';
import { sidebarCls } from '..';
import { SetTaskStepList } from '@/store/annotation/actionCreators';

interface IProps {
  stepInfo: IStepInfo;
  toolInstance: ICustomToolInstance; // Created by useCustomToolInstance.
  imgList: IFileItem[];
  imgIndex: number;
  stepList: IStepInfo[];
  enableColorPicker?: boolean;
}

// Temporarily hidden, this feature does not support the function for the time being.
const AnnotatedBox = ({ imgList, imgIndex }: { imgList: IFileItem[]; imgIndex: number }) => {
  const ptCtx = useContext(PointCloudContext);
  const [showIDs, setShowIds] = useState<number[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const newImgList = imgList as Array<{ result: string }>;
    let trackMap = new Map();
    setShowIds(
      PointCloudUtils.getAllPointCloudResult({
        imgList: newImgList,
        extraBoxList: pointCloudBoxList,
        ignoreIndexList: [imgIndex],
      })
        .filter((v) => {
          if (!v.trackID) {
            return false;
          }

          if (trackMap.get(v.trackID)) {
            return false;
          }
          trackMap.set(v.trackID, true);
          return true;
        })
        .sort((a, b) => {
          const aTrackID = a?.trackID ?? 0;
          const bTrackID = b?.trackID ?? 0;

          return aTrackID - bTrackID;
        })
        .map((v) => v?.trackID ?? 0),
    );
  }, [ptCtx.pointCloudBoxList, imgList]);

  const { pointCloudBoxList } = ptCtx;

  return (
    <div style={{ padding: 24, borderBottom: '1px solid #eee' }}>
      <div style={{ marginBottom: 16 }}>{t('AllTrackIDs')}</div>
      <div>
        {showIDs.map((id) => (
          <Tag color='#F3F4FF' key={id} style={{ color: '#666', marginBottom: 8 }}>
            {id}
          </Tag>
        ))}
      </div>
    </div>
  );
};

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
  attributeList: any[]; // TODO
  subAttributeList: any[]; // TODO
  config: any;
  stepList: IStepInfo[];
  stepInfo: IStepInfo;
  enableColorPicker?: boolean;
}) => {
  const { selectedBox } = useSingleBox();
  const ptx = useContext(PointCloudContext);
  const { t } = useTranslation();
  const { defaultAttribute } = useAttribute();
  const dispatch = useDispatch();

  const titleStyle = {
    fontWeight: 500,
    fontSize: 14,
    margin: '12px 0 8px 20px',
  };

  const subTitleStyle = {
    margin: '12px 20px 8px',
    fontSize: 14,
    fontWeight: 500,
    wordWrap: 'break-word' as any, // WordWrap Type ?
  };

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

  const setAttribute = (attribute: string) => {
    toolInstance.setDefaultAttribute(attribute);
  };

  const setSubAttribute = (key: string, value: string) => {
    toolInstance.setSubAttribute(key, value);
  };

  const list = attributeList.map((i: any) => ({
    label: i.key,
    value: i.value,
    color: i?.color,
  }));

  return (
    <div>
      <div style={titleStyle}>{t('Attribute')}</div>
      <AttributeList
        list={list}
        forbidDefault={true}
        selectedAttribute={defaultAttribute ?? ''}
        attributeChanged={(attribute: string) => setAttribute(attribute)}
        updateColorConfig={updateColorConfig}
        enableColorPicker={enableColorPicker}
      />
      <Divider style={{ margin: 0 }} />
      {selectedBox && (
        <>
          {subAttributeList.map(
            (subAttribute) =>
              subAttribute?.subSelected && (
                <div style={{ marginTop: 12 }} key={subAttribute.value}>
                  <div style={subTitleStyle}>
                    {t('SubAttribute')}-{subAttribute.key}
                  </div>
                  {subAttribute.subSelected?.length < 5 ? (
                    <AttributeList
                      list={subAttribute.subSelected.map((v: IInputList) => ({
                        label: v.key,
                        value: v.value,
                      }))}
                      selectedAttribute={
                        ptx.selectedPointCloudBox?.subAttribute?.[subAttribute.value]
                      }
                      num='-'
                      forbidColor={true}
                      forbidDefault={true}
                      attributeChanged={(value) => setSubAttribute(subAttribute.value, value)}
                      style={{ marginBottom: 12 }}
                    />
                  ) : (
                    <Select
                      style={{ margin: '0px 21px 17px 16px', width: '87%' }}
                      value={ptx.selectedPointCloudBox?.subAttribute?.[subAttribute.value]}
                      placeholder={t('PleaseSelect')}
                      onChange={(value) => setSubAttribute(subAttribute.value, value)}
                      allowClear={true}
                    >
                      {subAttribute.subSelected.map((sub: any) => (
                        <Select.Option key={sub.value} value={sub.value}>
                          {sub.key}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                  <Divider style={{ margin: 0 }} />
                </div>
              ),
          )}
        </>
      )}
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

    const updateCircleSelector = () => {
      setCurrentTool('CircleSelector');
    };

    ptSegmentInstance.on('LassoSelector', updateLassoSelector);
    ptSegmentInstance.on('CircleSelector', updateCircleSelector);
    return () => {
      ptSegmentInstance.unbind('LassoSelector', updateLassoSelector);
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
      <AttributeUpdater
        toolInstance={toolInstance}
        attributeList={attributeList}
        subAttributeList={subAttributeList}
        config={config}
        stepList={stepList}
        stepInfo={stepInfo}
        enableColorPicker={enableColorPicker}
      />
      {config?.trackConfigurable === true && (
        <>
          <BoxTrackIDInput />
          <Divider style={{ margin: 0 }} />
          <AnnotatedBox imgList={imgList} imgIndex={imgIndex} />
        </>
      )}
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
