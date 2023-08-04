import React, { useEffect } from 'react';
import { Form, Input } from 'antd';
import { ILLMToolConfig, ITextList } from '@/components/LLMToolView/types';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { isArray } from 'lodash';

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
      return { ...i, value: textAttribute[index]?.value };
    });
    form.setFieldsValue({ text: combinResult });
  }, [textConfig, textAttribute]);

  return (
    <Form
      form={form}
      onValuesChange={(__, allValues) => {
        setText(allValues.text);
      }}
    >
      <Form.List name='text'>
        {(fields, operation) => {
          return (
            <>
              {fields.map((field, index) => {
                const { max, min, title, tip } = textConfig[field.name] || {};
                const showTextIput = title;
                const messageError = t('LeastCharacterError', {
                  num: min,
                });
                return (
                  <div
                    style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}
                    key={index}
                  >
                    <Form.Item
                      name={[field.name, 'title']}
                      extra={tip}
                      style={{
                        fontSize: '16px',
                        lineHeight: '22px',
                        fontWeight: 500,
                        color: '#333333',
                        marginBottom: 8,
                      }}
                      required={!!min}
                      label={' '}
                      colon={false}
                    >
                      {title}
                      <span
                        className={classnames({
                          [`clearText`]: true,
                          [`clearText__disabled`]: checkMode,
                        })}
                        style={{ verticalAlign: 'initial' }}
                        onClick={() => {
                          form.setFields([
                            {
                              name: ['text', field.name, 'value'],
                              value: undefined,
                              errors: min ? [messageError] : [],
                            },
                          ]);
                          const newText = form.getFieldValue('text');
                          setText(newText);
                        }}
                      />
                    </Form.Item>
                    {showTextIput && (
                      <Form.Item
                        name={[field.name, 'value']}
                        style={{
                          marginBottom: 8,
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
                          maxLength={max || 1000}
                          disabled={checkMode}
                          showCount={true}
                          style={{ width: '100%' }}
                        />
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
