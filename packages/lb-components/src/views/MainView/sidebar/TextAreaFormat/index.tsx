import { TEXT_ATTRIBUTE_MAX_LENGTH } from '@/data/enums/ToolType';
import { TextUtils } from '@/utils/TextUtils';
import { Input, message, Tooltip } from 'antd/es';
import React, { FocusEvent, useEffect, useState } from 'react';
import IconClearSmallA from '@/assets/annotation/common/icon_clearSmall_a.svg';
import IconClearSmall from '@/assets/annotation/common/icon_clearSmall.svg';
import { classnames } from '@/utils';
import { useTranslation } from 'react-i18next';

interface IProps {
  onChange: (value: string, isSubmit?: boolean) => void;
  textValue: string | undefined;
  checkString: string;
  textCheckType: number;
}

const TextAreaFormat = (props: IProps) => {
  const { t } = useTranslation();

  const { onChange, textValue, checkString, textCheckType } = props;
  const [textLength, setTextLength] = useState<number>(0);
  const [error, setError] = useState<boolean>(false);
  const [onFocus, setOnFocus] = useState<boolean>(false);
  const [hoverDelete, setHoverDelete] = useState<boolean>(false);

  const clearIcon = (
    <a>
      <Tooltip placement='bottom' title={t('EmptyTextInput')}>
        <img
          onMouseEnter={() => setHoverDelete(true)}
          onMouseLeave={() => setHoverDelete(false)}
          style={{ marginLeft: 6 }}
          src={hoverDelete ? IconClearSmallA : IconClearSmall}
          onClick={(e) => {
            e.stopPropagation();
            onChange('');
          }}
        />
      </Tooltip>
    </a>
  );

  const keyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  useEffect(() => {
    if (textValue) {
      setTextLength(textValue.length);
    }
  }, []);

  useEffect(() => {
    if (textValue === undefined || textValue === '') {
      setError(false);
    } else {
      try {
        textValue && setError(!new RegExp(checkString).test(textValue));
      } catch (error) {
        setError(true);
        message.destroy();
        message.error(t('RegularExpIncorrectly'));
      }
    }
    setTextLength(textValue?.length ?? 0);
  }, [textValue]);

  const checkText = (e: FocusEvent<HTMLTextAreaElement>) => {
    if (error) {
      onChange('');
      message.error(TextUtils.getErrorNotice(textCheckType));
      return true;
    }
    onChange(e.target.value, true); // 失焦的时候直接进行数据的提交
  };

  return (
    <div className='textInputContainer'>
      <div className='label'>
        {t('TextInput')}
        {clearIcon}
      </div>
      <div
        className={classnames({
          textareaContainer: true,
          focus: onFocus,
        })}
      >
        <div
          className={classnames({
            toolTextAreaBox: true,
            toolTextAreaBoxFocus: onFocus,
          })}
        >
          <Input.TextArea
            style={{ resize: 'none', height: 120, wordBreak: 'break-all' }}
            maxLength={TEXT_ATTRIBUTE_MAX_LENGTH}
            onKeyDownCapture={(e) => {
              e.stopPropagation();
            }}
            onKeyUpCapture={(e) => {
              e.stopPropagation();
            }}
            onChange={(e) => {
              onChange(e.target.value);
              setTextLength(e.target.value.length);
            }}
            onFocus={(e) => setOnFocus(true)}
            onBlur={(e) => {
              checkText(e);
              setOnFocus(false);
            }}
            value={textValue}
            onKeyDown={keyDown}
            className={error ? 'warning' : ''}
          />
          <div className='textAreaFooter'>
            <span className='wordCount'>
              <span className={textLength > TEXT_ATTRIBUTE_MAX_LENGTH || error ? 'warning' : ''}>
                {textLength}
              </span>
              /<span>{TEXT_ATTRIBUTE_MAX_LENGTH}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextAreaFormat;
