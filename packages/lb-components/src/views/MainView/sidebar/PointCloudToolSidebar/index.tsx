import React, { useState } from 'react';
import { ToolIcons } from '../ToolIcons';
import { cTool } from '@labelbee/lb-annotation';
import { Input, Tag } from 'antd';
import { EditFilled } from '@ant-design/icons';

const SELECTED_BOX_ID = [1, 2, 3, 7, 8, 10, 101, 1002, 9999, 99999];

const AnnotatedBox = () => {
  return (
    <div style={{ padding: 24, borderBottom: '1px solid #eee' }}>
      <div style={{ marginBottom: 16 }}>所有已标注的框ID</div>
      <div>
        {SELECTED_BOX_ID.map((i) => (
          <Tag color='#F3F4FF' key={i} style={{ color: '#666', marginBottom: 8 }}>
            {i}
          </Tag>
        ))}
      </div>
    </div>
  );
};

const BoxIdInput = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [value, setValue] = useState('5');

  const applyValue = (newValue?: string) => {
    if (newValue) {
      setValue(newValue);
    }

    // TODO: emit value;
    setIsEdit(false);
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
        <span>当前标注框ID</span>
        <span>批量修改</span>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {isEdit ? (
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            size='small'
            onBlur={(e) => {
              applyValue(e.target.value);
            }}
            onPressEnter={() => {
              applyValue();
            }}
          />
        ) : (
          <span>{value}</span>
        )}
        <EditFilled
          style={{ color: '#999', marginLeft: 16 }}
          onClick={() => {
            setIsEdit(!isEdit);
          }}
        />
      </div>
    </div>
  );
};

const PointCloudToolSidebar = () => {
  return (
    <>
      <ToolIcons toolName={cTool.EPointCloudName.PointCloud} />
      <AnnotatedBox />
      <BoxIdInput />
    </>
  );
};

export default PointCloudToolSidebar;
