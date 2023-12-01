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
import MarkdownView from '@/components/markdownView';
import LatexEditor from '@/components/latexEditor';

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

  const insertText = (newText: string) => {
    const textarea = document.getElementById('inputTextarea') as HTMLInputElement;

    const text = textarea.value || '';
    // Get cursor position
    const start = textarea?.selectionStart ?? text.length;
    const end = textarea.selectionEnd ?? text.length;

    // Get cursor character
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    const newValue = before + newText + after;
    textarea.value = newValue;

    form.setFieldsValue({ value: newValue });
    updateValue(newValue);

    // 将光标定位到插入文本的末尾
    textarea.selectionStart = start + newText.length;
    textarea.selectionEnd = start + newText.length;

    // 使 TextArea 获取焦点
    textarea.focus();
  };

  return (
    <Form
      form={form}
      onValuesChange={(__, allValues) => {
        const value = allValues.value;
        updateValue(value);
      }}
      style={{ marginBottom: '16px' }}
    >
      <Form.Item
        name='title'
        style={{ marginBottom: '16px' }}
        label={' '}
        colon={false}
        required={!!min}
      >
        {t('AnswerTextEdit')}
        <Popover placement='bottom' content={t('ShowEditingResultDifferencesInTextModeOnly')}>
          <InfoCircleOutlined style={{ margin: '0px 4px', cursor: 'pointer' }} />
        </Popover>
      </Form.Item>
      <LatexEditor onSelectLatex={insertText} />
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
          id='inputTextarea'
        />
      </Form.Item>
      <Form.Item shouldUpdate={true} noStyle={true}>
        {() => {
          const inputValue = form.getFieldValue('value') || '';
          const markdownText = inputValue.replace(/\n/g, '  \n');

          return (
            <>
              <div style={{ lineHeight: '32px' }}>输出展示</div>
              <div
                style={{
                  minHeight: '100px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  background: '#fff',
                  padding: '4px',
                }}
              >
                {inputValue ? <MarkdownView value={markdownText} /> : ''}
              </div>
            </>
          );
        }}
      </Form.Item>
    </Form>
  );
};

export default TextEditor;
