/*
 * @file LLM tool text edit
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2023-11-09
 */
import React, { useEffect } from 'react';
import { Form, Input, Popover } from 'antd';
import { ITextList } from '@/components/LLMToolView/types';
import { useTranslation } from 'react-i18next';
import { InfoCircleOutlined } from '@ant-design/icons';

interface IProps {
  newAnswer?: string;
  textEditObject: ITextList;
  updateValue: (changeValue: string) => void;
  checkMode?: boolean;
}

const TextEditor = (props: IProps) => {
  const { checkMode, newAnswer, textEditObject, updateValue } = props;

  const { max, min } = textEditObject;
  const { TextArea } = Input;
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const messageError = t('LeastCharacterError', {
    num: min,
  });

  useEffect(() => {
    /**
     * When filling in answers is turned on, unedited answers will be filled in,
     * and answers that have been edited will be filled in with the last edited answer.
     */
    form.setFieldsValue({ value: newAnswer });
    if (!checkMode) {
      form.validateFields();
    }
  }, [newAnswer]);

  return (
    <Form
      form={form}
      onValuesChange={(__, allValues) => {
        const value = allValues.value;
        updateValue(value);
      }}
      style={{ marginBottom: '16px' }}
    >
      <div style={{ marginBottom: '16px' }}>
        {t('AnswerTextEdit')}
        <Popover placement='bottom' content='仅文本模式下显示编辑结果差异'>
          <InfoCircleOutlined style={{ margin: '0px 4px', cursor: 'pointer' }} />
        </Popover>
      </div>
      <Form.Item
        name='value'
        style={{
          marginBottom: 8,
        }}
        rules={[
          {
            validator: (rule, value = '') => {
              if (min && value?.length < Number(min)) {
                return Promise.reject(messageError);
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <TextArea
          maxLength={max}
          autoSize={{ minRows: 4, maxRows: 10 }}
          allowClear={true}
          disabled={checkMode}
          showCount={max ? true : false}
          style={{ width: '100%' }}
        />
      </Form.Item>
    </Form>
  );
};

export default TextEditor;
