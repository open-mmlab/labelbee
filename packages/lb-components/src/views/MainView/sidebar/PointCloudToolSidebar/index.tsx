import React, { useContext, useState, useEffect } from 'react';
import { EditFilled } from '@ant-design/icons';
import { ToolIcons } from '../ToolIcons';
import { cTool } from '@labelbee/lb-annotation';
import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import { Col, Radio, Row, Select, Tag, message, Input } from 'antd';
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
      <div style={{ marginBottom: 16 }}>所有已标注的框ID</div>
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

  const selectedBoxTrackID = selectedBox?.info.trackID;

  const hasDuplicateTrackID = (trackID: number) => {
    const duplicateBox = pointCloudBoxList.find((i) => i.trackID === selectedBoxTrackID);
    return duplicateBox && duplicateBox.id !== selectedBox?.info.id;
  };

  const applyInputValue = (isBlurEvent = false) => {
    const newTrackID = parseInt(inputValue, 10);

    if (isBlurEvent) {
      setIsEdit(false);
    }

    if (isNaN(newTrackID)) {
      message.error('请输入正整数');
      return;
    }

    if (inputValue.indexOf('.') > -1) {
      message.error('输入trackID不允许包含小数点');
      return;
    }

    if (hasDuplicateTrackID(newTrackID)) {
      message.error('存在重复的trackID');
      return;
    }

    if (!(newTrackID > 0)) {
      message.error('输入trackID必须为正整数!');
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
        <span>当前标注框ID</span>
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
  const ptx = useContext(PointCloudContext);
  const { t } = useTranslation();

  const titleStyle = {
    fontWeight: 400,
    fontSize: 14,
    marginBottom: 14,
  };

  const setAttribute = (attribute: string) => {
    toolInstance.setDefaultAttribute(attribute);
  };

  const setSubAttribute = (key: string, value: string) => {
    toolInstance.setSubAttribute(key, value);
  };

  return (
    <div style={{ padding: 24, borderBottom: '1px solid #eee' }}>
      <div style={{ marginBottom: 20, fontSize: 14, fontWeight: 500 }}>{t('Tag')}</div>
      <Row style={{ marginBottom: 12 }}>
        <Col span={9} style={titleStyle}>
          {t('Attribute')}
        </Col>
        <Col span={15}>
          <Radio.Group
            style={{ width: '100%' }}
            value={ptx.selectedPointCloudBox?.attribute}
            onChange={(e) => setAttribute(e.target.value)}
          >
            {attributeList.map((v) => (
              <Radio key={v.value} value={v.value} style={{ marginBottom: 16 }}>
                {v.key}
              </Radio>
            ))}
          </Radio.Group>
        </Col>
      </Row>
      <div style={titleStyle}> {t('SubAttribute')}</div>
      {subAttributeList.map(
        (subAttribute) =>
          subAttribute?.subSelected && (
            <Row key={subAttribute.value} style={{ marginBottom: 18 }}>
              <Col
                span={9}
                style={{
                  color: '#999999',
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                {subAttribute.key}
              </Col>
              <Col span={15}>
                <Select
                  style={{ width: '100%' }}
                  bordered={false}
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
              </Col>
            </Row>
          ),
      )}
    </div>
  );
};

const PointCloudToolSidebar: React.FC<IProps> = ({ stepInfo, toolInstance, imgList, imgIndex }) => {
  const { selectedBox } = useSingleBox();
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
        </>
      )}
      {selectedBox && (
        <AttributeUpdater
          toolInstance={toolInstance}
          attributeList={attributeList}
          subAttributeList={subAttributeList}
        />
      )}
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
