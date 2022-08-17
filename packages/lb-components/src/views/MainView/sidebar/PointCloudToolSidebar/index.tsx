import React, { useContext } from 'react';
import { ToolIcons } from '../ToolIcons';
import { cTool } from '@labelbee/lb-annotation';
import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import { Col, Radio, Row, Select } from 'antd';
import { AppState } from '@/store';
import StepUtils from '@/utils/StepUtils';
import { connect } from 'react-redux';
import { IStepInfo } from '@/types/step';
import { jsonParser } from '@/utils';
import { ICustomToolInstance } from '@/hooks/annotation';

const { EToolName, EPolygonPattern } = cTool;

interface IProps {
  stepInfo: IStepInfo;
  toolInstance: ICustomToolInstance; // Created by useCustomToolInstance.
}

// Temporarily hidden, this feature does not support the function for the time being.
// const SELECTED_BOX_ID = [1, 2, 3, 7, 8, 10, 101, 1002, 9999, 99999];
// const AnnotatedBox = () => {
//   return (
//     <div style={{ padding: 24, borderBottom: '1px solid #eee' }}>
//       <div style={{ marginBottom: 16 }}>所有已标注的框ID</div>
//       <div>
//         {SELECTED_BOX_ID.map((i) => (
//           <Tag color='#F3F4FF' key={i} style={{ color: '#666', marginBottom: 8 }}>
//             {i}
//           </Tag>
//         ))}
//       </div>
//     </div>
//   );
// };
// const BoxIdInput = () => {
//   const [isEdit, setIsEdit] = useState(false);
//   const [value, setValue] = useState('5');

//   const applyValue = (newValue?: string) => {
//     if (newValue) {
//       setValue(newValue);
//     }

//     // TODO: emit value;
//     setIsEdit(false);
//   };

//   return (
//     <div style={{ padding: 24 }}>
//       <div
//         style={{
//           marginBottom: 16,
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//         }}
//       >
//         <span>当前标注框ID</span>
//         <span>批量修改</span>
//       </div>
//       <div
//         style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//         }}
//       >
//         {isEdit ? (
//           <Input
//             value={value}
//             onChange={(e) => {
//               setValue(e.target.value);
//             }}
//             size='small'
//             onBlur={(e) => {
//               applyValue(e.target.value);
//             }}
//             onPressEnter={() => {
//               applyValue();
//             }}
//           />
//         ) : (
//           <span>{value}</span>
//         )}
//         <EditFilled
//           style={{ color: '#999', marginLeft: 16 }}
//           onClick={() => {
//             setIsEdit(!isEdit);
//           }}
//         />
//       </div>
//     </div>
//   );
// };

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
      <div style={{ marginBottom: 20, fontSize: 14, fontWeight: 500 }}>标签</div>
      <Row style={{ marginBottom: 12 }}>
        <Col span={10} style={titleStyle}>
          主属性
        </Col>
        <Col span={14}>
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
      <div style={titleStyle}>副属性</div>
      {subAttributeList.map((subAttribute) => (
        <Row key={subAttribute.value} style={{ marginBottom: 18 }}>
          <Col span={10} style={{ color: '#999999' }}>
            {subAttribute.key}
          </Col>
          <Col span={14}>
            <Select
              style={{ width: '100%' }}
              bordered={false}
              value={ptx.selectedPointCloudBox?.subAttribute?.[subAttribute.value]}
              placeholder='请填写~'
              onChange={(value) => setSubAttribute(subAttribute.value, value)}
            >
              {subAttribute.subSelected.map((sub: any) => (
                <Select.Option key={sub.value} value={sub.value}>
                  {sub.key}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      ))}
    </div>
  );
};

const PointCloudToolSidebar: React.FC<IProps> = ({ stepInfo, toolInstance }) => {
  const ptCtx = useContext(PointCloudContext);

  const onChange = (toolName: any) => {
    switch (toolName) {
      case EToolName.Rect:
        ptCtx.topViewInstance?.pointCloud2dOperation.setPattern(EPolygonPattern.Rect);

        break;
      case EToolName.Polygon:
        ptCtx.topViewInstance?.pointCloud2dOperation.setPattern(EPolygonPattern.Normal);
        break;
    }
  };

  const config = jsonParser(stepInfo.config);
  const attributeList = config?.attributeList ?? [];
  const subAttributeList =
    config?.secondaryAttributeConfigurable === true ? config?.inputList ?? [] : [];

  return (
    <>
      <ToolIcons
        toolName={cTool.EPointCloudName.PointCloud}
        selectedToolName={EToolName.Rect}
        onChange={onChange}
      />
      {/* <AnnotatedBox />
      <BoxIdInput /> */}
      {ptCtx.selectedID && (
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
  };
};

export default connect(mapStateToProps)(PointCloudToolSidebar);
