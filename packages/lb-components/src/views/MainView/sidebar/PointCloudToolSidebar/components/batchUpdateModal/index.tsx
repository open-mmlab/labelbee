import { ESubmitType } from '@/constant';
import { BatchUpdateTrackID, ToSubmitFileData } from '@/store/annotation/actionCreators';
import { useDispatch } from '@/store/ctx';
import { Form, InputNumber, Modal } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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

interface IProps {
  id: number;
}

const inputStyle = {
  width: '80px',
};

const BatchUpdateModal = ({ id }: IProps) => {
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const onFinish = (values: any) => {
    dispatch(ToSubmitFileData(ESubmitType.SyncImgList));
    dispatch(BatchUpdateTrackID(id, values.newID, [values.prevPage - 1, values.nextPage - 1]));
    setVisible(false);
  };

  const onCancel = () => setVisible(false);

  const onOk = () => form.submit();
  const defaultNumberRules = [{ required: true, message: t('PositiveIntegerCheck') }];

  return (
    <>
      <a style={{ color: '#666FFF' }} onClick={() => setVisible(true)}>
        {t('BatchUpdateText')}
      </a>
      <Modal
        title={t('BatchUpdateTrackID')}
        visible={visible}
        onCancel={onCancel}
        onOk={onOk}
        wrapClassName='labelbee-custom-modal'
      >
        <Form {...layout} form={form} onFinish={onFinish}>
          <Form.Item name='id' label={t('CurrentBoxTrackIDs')}>
            {id}
          </Form.Item>

          <Form.Item name='newID' label={t('TrackIDUnifyAs')} rules={defaultNumberRules}>
            <InputNumber precision={0} min={1} style={inputStyle} />
          </Form.Item>
          <Form.Item label={t('UnifyTrackIDRange')} required={true}>
            <Form.Item
              style={{ display: 'inline-block' }}
              rules={defaultNumberRules}
              name='prevPage'
              noStyle={true}
            >
              <InputNumber precision={0} min={1} style={inputStyle} />
            </Form.Item>
            <span
              style={{
                display: 'inline-block',
                width: '24px',
                textAlign: 'center',
              }}
            >
              -
            </span>
            <Form.Item
              style={{ display: 'inline-block' }}
              rules={defaultNumberRules}
              name='nextPage'
              noStyle={true}
            >
              <InputNumber precision={0} min={1} style={inputStyle} />
            </Form.Item>
            <span
              style={{
                display: 'inline-block',
                width: '40x',
                marginLeft: '10px',
                textAlign: 'center',
              }}
            >
              {t('Page')}
            </span>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default BatchUpdateModal;
