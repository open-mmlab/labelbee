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
import { jsonParser } from '@/utils';
import { ICustomToolInstance } from '@/hooks/annotation';
import { useStatus } from '@/components/pointCloudView/hooks/useStatus';
import { useSingleBox } from '@/components/pointCloudView/hooks/useSingleBox';
import { useTranslation } from 'react-i18next';
import { LabelBeeContext } from '@/store/ctx';
import BatchUpdateModal from './components/batchUpdateModal';
import { IFileItem } from '@/types/data';
import { PointCloudUtils } from '@labelbee/lb-utils';
import AttributeList from '@/components/attributeList';
import { IInputList } from '@/types/main';
import { useAttribute } from '@/components/pointCloudView/hooks/useAttribute';

interface IProps {
  stepInfo: IStepInfo;
  toolInstance: ICustomToolInstance; // Created by useCustomToolInstance.
  imgList: IFileItem[];
  imgIndex: number;
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
  const { pointCloudBoxList } = useContext(PointCloudContext);
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

    updateSelectedBox({ trackID: newTrackID });
  };

  useEffect(() => {
    setIsEdit(false);
  }, [selectedBoxTrackID]);

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
        {selectedBoxTrackID && <BatchUpdateModal id={selectedBoxTrackID} />}
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
}: {
  toolInstance: ICustomToolInstance;
  attributeList: any[]; // TODO
  subAttributeList: any[]; // TODO
}) => {
  const { selectedBox } = useSingleBox();
  const ptx = useContext(PointCloudContext);
  const { t } = useTranslation();
  const { defaultAttribute } = useAttribute();

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

const PointCloudToolSidebar: React.FC<IProps> = ({ stepInfo, toolInstance, imgList, imgIndex }) => {
  const { updatePointCloudPattern, pointCloudPattern } = useStatus();

  const config = jsonParser(stepInfo.config);
  const attributeList = config?.attributeList ?? [];
  const subAttributeList =
    config?.secondaryAttributeConfigurable === true ? config?.inputList ?? [] : [];

  return (
    <>
      <ToolIcons
        toolName={cTool.EPointCloudName.PointCloud}
        selectedToolName={pointCloudPattern}
        onChange={(v) => updatePointCloudPattern?.(v)}
      />
      {config?.trackConfigurable === true && (
        <>
          <AnnotatedBox imgList={imgList} imgIndex={imgIndex} />
          <BoxTrackIDInput />
          <Divider style={{ margin: 0 }} />
        </>
      )}
      <AttributeUpdater
        toolInstance={toolInstance}
        attributeList={attributeList}
        subAttributeList={subAttributeList}
      />
    </>
  );
};

const mapStateToProps = (state: AppState) => {
  const stepInfo = StepUtils.getCurrentStepInfo(state.annotation?.step, state.annotation?.stepList);
  const toolInstance = state.annotation?.toolInstance;

  return {
    stepInfo,
    toolInstance,
    imgList: state.annotation.imgList,
    imgIndex: state.annotation.imgIndex,
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloudToolSidebar,
);
