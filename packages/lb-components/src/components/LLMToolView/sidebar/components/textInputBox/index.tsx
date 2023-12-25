import React, { useEffect } from 'react';
import { Form, Input, message } from 'antd';
import { ILLMToolConfig, ITextList } from '@/components/LLMToolView/types';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { isArray } from 'lodash';
import LatexEditor from '@/components/latexEditor';
import styles from './index.module.scss';
import MarkdownView from '@/components/markdownView';

interface IProps {
  textAttribute: ITextList[];
  checkMode?: boolean;
  LLMConfig?: ILLMToolConfig;
  setText: (value: ITextList[]) => void;
}

const TextInputBox = (props: IProps) => {
  const { checkMode, LLMConfig, textAttribute, setText } = props;
  const textConfig = LLMConfig?.text && isArray(LLMConfig.text) ? LLMConfig?.text : [];
  const { TextArea } = Input;
  const [form] = Form.useForm();
  const { t } = useTranslation();

  useEffect(() => {
    const combinResult = textConfig.map((i, index) => {
      const value = textAttribute?.filter((item) => item?.textId === i?.textId) || [];
      return { ...i, value: value[0]?.value };
    });
    form.setFieldsValue({ text: combinResult });
  }, [textConfig, textAttribute]);

  const insertText = ({
    newText,
    fieldName,
    max,
  }: {
    newText: string;
    fieldName: number;
    max?: number;
  }) => {
    const id = `textInput_${fieldName}`;
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
    form.setFields([
      {
        name: ['text', fieldName, 'value'],
        value: newValue,
        errors: [],
      },
    ]);

    updateValue();

    // Position the cursor at the end of the inserted text
    textarea.selectionStart = start + newText.length;
    textarea.selectionEnd = start + newText.length;

    // Give TextArea focus
    textarea.focus();
  };

  const updateValue = () => {
    const newText = form.getFieldValue('text');
    setText(newText);
  };

  return (
    <Form form={form}>
      <Form.List name='text'>
        {(fields, operation) => {
          return (
            <>
              {fields.map((field, index) => {
                const { max, min, title, tip, isLaText } = textConfig[field.name] || {};
                const showTextInput = title;
                const messageError = t('LeastCharacterError', {
                  num: min,
                });
                return (
                  <div
                    style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}
                    key={index}
                  >
                    {showTextInput && (
                      <Form.Item
                        name={[field.name, 'title']}
                        extra={tip}
                        className={styles.textTitle}
                        required={!!min}
                        label={' '}
                        colon={false}
                      >
                        {title}
                        {showTextInput && (
                          <span
                            className={classnames({
                              [`clearText`]: true,
                              [`clearText__disabled`]: checkMode,
                            })}
                            style={{ verticalAlign: 'initial' }}
                            onClick={() => {
                              if (checkMode) {
                                return;
                              }
                              form.setFields([
                                {
                                  name: ['text', field.name, 'value'],
                                  value: undefined,
                                  errors: min ? [messageError] : [],
                                },
                              ]);
                              updateValue();
                            }}
                          />
                        )}
                      </Form.Item>
                    )}

                    {isLaText && showTextInput && (
                      <LatexEditor
                        onSelectLatex={(value) =>
                          insertText({ newText: value, fieldName: field.name, max })
                        }
                        disabled={checkMode}
                      />
                    )}
                    {showTextInput && (
                      <Form.Item
                        name={[field.name, 'value']}
                        style={{
                          marginBottom: 24,
                        }}
                        rules={[
                          {
                            validator: (rule, value) => {
                              if (min && value?.length < Number(min)) {
                                return Promise.reject(messageError);
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                        initialValue={undefined}
                      >
                        <TextArea
                          maxLength={max}
                          disabled={checkMode}
                          showCount={max ? true : false}
                          autoSize={{ minRows: 4, maxRows: 10 }}
                          style={{ width: '100%' }}
                          id={`textInput_${field.name}`}
                          onChange={() => updateValue()}
                        />
                      </Form.Item>
                    )}
                    {isLaText && showTextInput && (
                      <Form.Item shouldUpdate={true} noStyle={true}>
                        {() => {
                          const inputValue =
                            form.getFieldValue(['text', field.name, 'value']) || '';
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
                  </div>
                );
              })}
            </>
          );
        }}
      </Form.List>
    </Form>
  );
};

export default TextInputBox;
