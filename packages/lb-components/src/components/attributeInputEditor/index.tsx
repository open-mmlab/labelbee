import React, { useState, useEffect, useCallback } from 'react';
import { Input, Button, Space } from 'antd';
import { EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import './index.scss';

interface IAttributeInputEditorProps {
  selectedAttribute?: string;
  attributeChanged: (v: string) => void;
}

const AttributeInputEditor: React.FC<IAttributeInputEditorProps> = (props) => {
  const { selectedAttribute, attributeChanged } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  // This ensures that the editing state will be reset when switching timeline or creating new segments
  useEffect(() => {
    if (isEditing) {
      setIsEditing(false);
      setEditValue('');
    }
  }, [selectedAttribute]);

  // Enter edit mode
  const handleEdit = useCallback(() => {
    setEditValue(selectedAttribute || '');
    setIsEditing(true);
  }, [selectedAttribute]);

  // Confirm and save
  const handleConfirm = useCallback(() => {
    attributeChanged(editValue);
    setIsEditing(false);
  }, [editValue, attributeChanged]);

  // Cancel editing and exit edit mode
  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  if (isEditing) {
    return (
      <div className="custom-attribute-input-wrapper editing">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder='请输入主属性'
          onPressEnter={handleConfirm}
          autoFocus
        />
        <Space className="button-group">
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={handleConfirm}
          >
            确认
          </Button>
          <Button
            size="small"
            icon={<CloseOutlined />}
            onClick={handleCancel}
          >
            取消
          </Button>
        </Space>
      </div>
    );
  }

  return (
    <div className="custom-attribute-input-wrapper display">
      <div className="attribute-text">
        {selectedAttribute || '无属性'}
      </div>
      <Button
        type="link"
        size="small"
        icon={<EditOutlined />}
        onClick={handleEdit}
      >
        编辑
      </Button>
    </div>
  );
};

export default AttributeInputEditor;
