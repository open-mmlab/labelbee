/*
 * @file LLM tool text edit
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2023-11-09
 */
import React, { useEffect } from 'react';
import { Form, Input, message, Popover } from 'antd';
import { ITextList } from '@/components/LLMToolView/types';
import { useTranslation } from 'react-i18next';
import { InfoCircleOutlined } from '@ant-design/icons';
import MarkdownView from '@/components/markdownView';
import LatexEditor from '@/components/latexEditor';
import styles from './index.module.scss';

interface IProps {
  newAnswer?: string;
  textEditObject: ITextList;
  updateValue: (changeValue: string) => void;
  checkMode?: boolean;
  answerIndex: number;
}

const TextEditor = (props: IProps) => {
  const { checkMode, newAnswer, textEditObject, updateValue, answerIndex } = props;

  const { max, min, isLaText } = textEditObject;
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
    const id = `inputTextarea_${answerIndex}`;
    const textarea = document.getElementById(id) as HTMLInputElement;

    const text = textarea.value || '';
    // Get cursor position
    const start = textarea?.selectionStart ?? text.length;
    const end = textarea.selectionEnd ?? text.length;

    // Get cursor character
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    const newValue = before + newText + after;
    if (max && newValue?.length > max) {
      message.error(
        t('MaximumCharacterError', {
          num: max,
        }),
      );
      return;
    }
    textarea.value = newValue;
    form.setFieldsValue({ value: newValue });
    updateValue(newValue);

    // Position the cursor at the end of the inserted text
    textarea.selectionStart = start + newText.length;
    textarea.selectionEnd = start + newText.length;

    // Give TextArea focus
    textarea.focus();
  };

  return (
    <Form
      form={form}
      onValuesChange={(__, allValues) => {
        const value = allValues.value;
        updateValue(value);
      }}
      className={styles.form}
    >
      <Form.Item
        name='title'
        style={{ marginBottom: '8px' }}
        label={
          <>
            {t('AnswerTextEdit')}
            <Popover placement='bottom' content={t('ShowEditingResultDifferencesInTextModeOnly')}>
              <InfoCircleOutlined style={{ margin: '0px 4px', cursor: 'pointer' }} />
            </Popover>
          </>
        }
        colon={false}
        required={!!min}
      />

      {isLaText && <LatexEditor onSelectLatex={insertText} disabled={checkMode} />}
      <Form.Item
        name='value'
        style={{
          marginBottom: 24,
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
          id={`inputTextarea_${answerIndex}`}
        />
      </Form.Item>
      {isLaText && (
        <Form.Item shouldUpdate={true} noStyle={true}>
          {() => {
            const inputValue = form.getFieldValue('value') || '';
            const markdownText = inputValue.replace(/\n/g, '  \n');

            return (
              <div className={styles.outputDisplay}>
                <div className={styles.title}>{t('OutputDisplay')}</div>
                <div className={styles.content}>
                  {inputValue ? <MarkdownView value={markdownText} /> : ''}
                </div>
              </div>
            );
          }}
        </Form.Item>
      )}
    </Form>
  );
};

export default TextEditor;
