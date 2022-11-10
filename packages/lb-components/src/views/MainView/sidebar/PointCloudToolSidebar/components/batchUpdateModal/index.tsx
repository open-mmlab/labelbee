import { ESubmitType } from '@/constant';
import { BatchUpdateTrackID, ToSubmitFileData } from '@/store/annotation/actionCreators';
import { useDispatch } from '@/store/ctx';
import { Form, InputNumber, Modal } from 'antd';
import React, { useState } from 'react';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

/**
 * 检查当前数字是否为有效数字
 * @param value
 * @param nonZero 是否包括 0
 * @returns
 */
export const isInvalidNumber = (value: any, nonZero = false) => {
  const intValue = Number(value);
  if (typeof value === 'undefined' || intValue < 0 || isNaN(intValue)) {
    return true;
  }
  if (nonZero === true && intValue === 0) {
    return true;
  }
  return false;
};

export const decimalCheck = (rule: any, value: any, decimalNum = 0) => {
  const intValue = Number(value);
  if (isInvalidNumber(value)) {
    return Promise.reject(new Error('请输入一个大于等于0的数字'));
  }
  const decimal = intValue.toString().split('.')[1];
  if (decimal?.length > decimalNum) {
    let errorText = `请输入一个小数位数不超过${decimalNum}位数的数字`;
    if (decimalNum < 1) {
      errorText = `请输入一个正整数`;
    }
    return Promise.reject(errorText);
  }
  return Promise.resolve();
};

const defaultNumberRules = [
  { required: true, message: '请填写一个数字' },
  { validator: (rule: any, value: any) => decimalCheck(rule, value, 0) },
];

interface IProps {
  id: number;
}

const BatchUpdateModal = ({ id }: IProps) => {
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    dispatch(ToSubmitFileData(ESubmitType.BatchUpdateTrackID));
    dispatch(BatchUpdateTrackID(id, values.newID, [values.prevPage - 1, values.nextPage - 1]));
    setVisible(false);
  };

  return (
    <>
      <span onClick={() => setVisible(true)}>批量修改</span>
      <Modal
        title='批量修改ID'
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={() => form.submit()}
      >
        <Form {...layout} form={form} onFinish={onFinish}>
          <Form.Item name='id' label='当前标注框ID'>
            {id}
          </Form.Item>

          <Form.Item name='newID' label='统一标注框ID为' rules={defaultNumberRules}>
            <InputNumber />
          </Form.Item>
          <Form.Item label='统一ID范围' required={true}>
            <Form.Item
              style={{ display: 'inline-block', width: 'calc(50% - 24px)' }}
              rules={defaultNumberRules}
              name='prevPage'
            >
              <InputNumber />
            </Form.Item>
            <span
              style={{
                display: 'inline-block',
                width: '24px',
                lineHeight: '32px',
                textAlign: 'center',
              }}
            >
              -
            </span>
            <Form.Item
              style={{ display: 'inline-block', width: 'calc(50% - 24px)' }}
              rules={defaultNumberRules}
              name='nextPage'
            >
              <InputNumber />
            </Form.Item>
            <span
              style={{
                display: 'inline-block',
                width: '24px',
                lineHeight: '32px',
                textAlign: 'center',
              }}
            >
              页
            </span>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default BatchUpdateModal;
