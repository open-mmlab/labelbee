import React, { FocusEvent, useEffect, useRef, useState } from 'react';
import { Radio, Switch, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { TextareaWithFooter } from '@/views/MainView/sidebar/TextToolSidebar';
import { DEFAULT_TEXT_CONFIG_ITEM, timeFormat, getAttributeColor, getAttributeFontColor, getAttributeShowText, updateColorOpacity } from '@/utils/audio';
import { cKeyCode } from '@labelbee/lb-annotation'
import { IAudioTimeSlice, ITextConfigItem } from '@labelbee/lb-utils';
import classnames from 'classnames';
import AudioContext, { useAudioClipStore } from '../audioContext';
import styles from './index.module.scss';
import { IInputList } from '@/types/main';
import { useTranslation } from 'react-i18next';
// import { AlgorithmButtonForText } from '../icons/algorithmButton';

const EKeyCode = cKeyCode.default

interface IClearIcon {
  onClick: () => void;
  title: string;
  disabled?: boolean;
}

export const ClearIcon = ({ onClick, title, disabled }: IClearIcon) => {
  return (
    <Tooltip placement='bottom' title={title}>
      <span
        className={classnames({
          [styles.clearIcon]: true,
          [styles.disabled]: disabled,
        })}
        onClick={onClick}
      />
    </Tooltip>
  );
};

interface IProps {
  /** 显示的文本 */
  text?: string;
  /** 是否显示文本 */
  showText?: boolean;
  /** 更新文本的方法 */
  updateText?: (text: string, key: string) => void;
  /** 切换文本是否显示 */
  toggleShowText?: (isShow: boolean) => void;
  /** 文本框是否被禁用 */
  textInputDisabled: boolean;
  /** 文本ID */
  textID: boolean;
  /** 是否使用自动聚焦 */
  autofocus: boolean;
  toolName?: string;
  /** 显示OCR开关 */
  showOcrSwitch?: boolean;
  configList: ITextConfigItem[];
  result: any;
  config?: any;
  /** 预标注前后文 */
  preContext: any;
  /** 是否是查看模式 */
  isCheck: boolean;
  /** 是否开启文本标注 除了音频其余工具不会传这个参数 所以默认值是true */
  textConfigurable?: boolean;
  /** 是否开启截取文本标注 */
  clipTextConfigurable?: boolean;
  /** 是否开启截取属性标注 */
  clipAttributeConfigurable?: boolean;
  /** 截取片段 */
  regions?: IAudioTimeSlice[];
  /** 截取属性列表 */
  clipAttributeList?: IInputList[];
  /** 更新截取片段数据 */
  updateRegion?: (region: IAudioTimeSlice) => void;
  isEdit?: boolean;
}

export const SingleTextInput = (props: any) => {
  const { t } = useTranslation();

  const ref = useRef(null);
  const [textAreaFocus, setTextAreaFocus] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const {
    disabled,
    config,
    result,
    updateText,
    index,
    switchToNextTextarea,
    hasMultiple,
    textID,
    addPlaceholder,
    onFocus,
    onBlur,
    onFocusStyle = {},
    // 右侧输入框上方展示元素
    extra,
  } = props;
  const { maxLength } = config;

  const value = result ? result[config.key] : '';
  const textLength = value?.length ?? 0;

  const updateTextWithKey = (newVal: string) => {
    if (updateText) {
      updateText(newVal, config.key);
      if (config.required) {
        setInvalid(!newVal);
      }
    }
  };

  const tabToSwitchEnabled = hasMultiple && switchToNextTextarea;

  const textareaProps = {
    id: `textInput-${index}`,
    ref,
    disabled,
    value,
    maxLength,
    autoSize: { minRows: 2, maxRows: 6 },
    onChange: (e: FocusEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      updateTextWithKey(value);
    },
    onFocus: (e: FocusEvent<HTMLTextAreaElement>) => {
      setTextAreaFocus(true);
      onFocus?.(e);
      if (e.target.value) {
        setInvalid(false);
      }
    },
    onBlur: (e: FocusEvent<HTMLTextAreaElement>) => {
      setTextAreaFocus(false);
      onBlur?.(e);
      if (config.required) {
        setInvalid(!e.target.value);
      }
    },
    style: {
      resize: 'none',
      wordBreak: 'break-all',
    },
    onKeyDownCapture: (e: React.KeyboardEvent) => {
      const { keyCode } = e;
      if (e.ctrlKey) {
        if (keyCode === EKeyCode.Enter) {
          e.preventDefault();
        }
        if (addPlaceholder && [EKeyCode.One, EKeyCode.Two, EKeyCode.Three].includes(keyCode)) {
          e.preventDefault();
          switch (keyCode) {
            case EKeyCode.One:
              addPlaceholder('䦆');
              break;
            case EKeyCode.Two:
              addPlaceholder('攫');
              break;
            case EKeyCode.Three:
              addPlaceholder('玃');
              break;
          }
        }
      } else if (keyCode === EKeyCode.Tab && tabToSwitchEnabled) {
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
        switchToNextTextarea(index);
      } else {
        e.nativeEvent.stopPropagation();
      }
    },
  };

  const TextareaFooter = (
    <div className={styles.textAreaFooter}>
      <div className={styles.hotkeyTip}>
        {tabToSwitchEnabled && <span>[{t('Switch')}]Tab</span>}
        <span>[{t('TurnPage')}]Ctrl+Enter</span>
      </div>
      <div className={styles.wordCount}>
        <span className={textLength >= maxLength ? styles.warning : ''}>{textLength}</span>/
        <span>{maxLength}</span>
      </div>
    </div>
  );

  useEffect(() => {
    if (disabled) {
      setTextAreaFocus(false);
    }
  }, [disabled]);

  useEffect(() => {
    setInvalid(false);
  }, [textID]);

  /**
   * 训练模块暂时关闭算法训练
   */
  // const algorithmDisabled = isTraining();

  return (
    <div className={styles.textField}>
      <div className={styles.label}>
        <span className={classnames({ [styles.required]: config.required })}>{config.label}</span>
        <ClearIcon
          onClick={() => {
            if (!disabled) {
              updateTextWithKey('');
            }
          }}
          title=''
          disabled={disabled}
        />

        {/* {!algorithmDisabled && ( */}
        {/*  <AlgorithmButtonForText */}
        {/*    afterAlgorithm={(textVal: string) => { */}
        {/*      updateTextWithKey(textVal); */}
        {/*    }} */}
        {/*  /> */}
        {/* )} */}

        <div className={styles.extra}>{extra}</div>
      </div>
      <div
        className={classnames({
          disabled,
          'textarea-outline': true,
          'ant-input-focused': textAreaFocus,
          [styles.textareaContainer]: true,
          [styles.focus]: textAreaFocus,
          [styles.invalid]: invalid,
        })}
        style={textAreaFocus ? onFocusStyle : {}}
      >
        <TextareaWithFooter footer={TextareaFooter} textareaProps={textareaProps} />
      </div>
    </div>
  );
};

/** 文本工具的文本框和对照按钮 */
const TextInput = (props: IProps) => {
  const {
    configList: dataList,
    autofocus,
    textID,
    result,
    showText,
    updateText,
    toggleShowText,
    textInputDisabled,
    isCheck,
    isEdit,
    config,
    preContext,
    regions = [],
    textConfigurable = true,
    clipTextConfigurable,
    clipAttributeConfigurable,
    updateRegion,
    clipAttributeList = [],
  } = props;

  const { t } = useTranslation();

  const [focusIndex, setFocusIndex] = useState(0);
  const [placeholder, setPlaceholder] = useState('');
  const placeholderTimer = useRef<any>(null);
  const { audioClipState } = useAudioClipStore();
  const configList = dataList || [{ ...DEFAULT_TEXT_CONFIG_ITEM }];
  let regionsList = regions;


  if (clipTextConfigurable && !isCheck) {
    const selectedId = audioClipState.selectedRegion.id;
    regionsList = regionsList.filter((item) => {
      return item.id === selectedId;
    });
  }


  const textareaFocus = (index: number) => {
    setTimeout(() => {
      const textarea = document.getElementById(`textInput-${index}`) as HTMLTextAreaElement;
      if (textarea) {
        setFocusIndex(index);
        textarea.focus();
        textarea.select();
        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  };

  const switchToNextTextarea = (currentIndex: number) => {
    const configListLength = textConfigurable ? configList.length : 0;
    const regionsLength = clipTextConfigurable ? regionsList.length : 0;
    const allTextareaLength = configListLength + regionsLength;
    const nextIndex = (currentIndex + 1) % allTextareaLength;
    textareaFocus(nextIndex);
  };

  const tabToFirstTextarea = (e: KeyboardEvent) => {
    if (e.keyCode === EKeyCode.Tab) {
      e.preventDefault();
      if (configList.length > 0) {
        textareaFocus(0);
      }
    }
  };

  const addPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById(`textInput-${focusIndex}`) as HTMLTextAreaElement;
    if (!config?.enablePlaceholderHotkey || !textarea || !updateText) {
      return;
    }
    const { value, selectionStart, selectionEnd } = textarea;
    const newValue = `${value.slice(0, selectionStart)}${placeholder}${value.slice(selectionEnd)}`;
    updateText(newValue, configList[focusIndex].key);
    setPlaceholder(placeholder);
    setTimeout(() => {
      textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
      textarea.focus();
    }, 0);
    clearTimeout(placeholderTimer.current);
    placeholderTimer.current = setTimeout(() => {
      setPlaceholder('');
    }, 400);
  };

  useEffect(() => {
    if (!isEdit) {
      document.addEventListener('keydown', tabToFirstTextarea);
    }

    return () => {
      document.removeEventListener('keydown', tabToFirstTextarea);
    };
  }, [dataList]);

  useEffect(() => {
    if (autofocus && !textInputDisabled) {
      textareaFocus(0);
    }
  }, [textID]);

  let _configList = configList;
  if (isCheck) {
    _configList = configList.filter((item) => {
      return result?.[item.key] !== undefined;
    });
  }

  let clipIdMapText: { [key: string]: string } = {};
  if (clipTextConfigurable && regionsList) {
    regionsList.forEach((item) => {
      const { id, text } = item;
      clipIdMapText[id] = text;
    });
  }

  return (
    <>
      {config?.enablePlaceholderHotkey && (
        <div className={styles.placeholderHotkey}>
          <div className={styles.title}>
            占位符快捷输入
            <Tooltip
              overlayStyle={{ maxWidth: 240 }}
              title={
                <div>
                  <div>䦆（Ctrl+1）：</div>
                  <div style={{ marginBottom: 12 }}>
                    文字异常，但只根据这个字的形状就可以猜出是什么字
                  </div>
                  <div>攫（Ctrl+2）：</div>
                  <div style={{ marginBottom: 12 }}>
                    文字异常，且无法根据形状猜字，但能结合上下文语义判断出是什么字
                  </div>
                  <div>玃（Ctrl+3）：</div>
                  <div>完全无法判断是什么字</div>
                </div>
              }
              placement='bottom'
            >
              <QuestionCircleOutlined className={styles.questionIcon} />
            </Tooltip>
          </div>
          <Radio.Group value={placeholder}>
            <Radio.Button value='䦆' onClick={(e: any) => addPlaceholder(e.target.value)}>
              <div className='label'>
                <div className='text'>䦆 (视觉)</div>
                <div className='hotkey'>Ctrl+1</div>
              </div>
            </Radio.Button>
            <Radio.Button value='攫' onClick={(e: any) => addPlaceholder(e.target.value)}>
              <div className='label'>
                <div className='text'>攫 (语义)</div>
                <div className='hotkey'>Ctrl+2</div>
              </div>
            </Radio.Button>
            <Radio.Button value='玃' onClick={(e: any) => addPlaceholder(e.target.value)}>
              <div className='label'>
                <div className='text'>玃 (无效)</div>
                <div className='hotkey'>Ctrl+3</div>
              </div>
            </Radio.Button>
          </Radio.Group>
        </div>
      )}
      <div className={styles.textInputContainer}>
        <AudioContext audioContext={preContext?.before} />

        {textConfigurable &&
          _configList.map((i, index) => (
            <SingleTextInput
              config={i}
              key={index}
              index={index}
              result={result}
              updateText={updateText}
              switchToNextTextarea={switchToNextTextarea}
              hasMultiple={configList.length > 1}
              disabled={textInputDisabled}
              textID={textID}
              addPlaceholder={addPlaceholder}
              onFocus={() => setFocusIndex(index)}
            />
          ))}
        {clipTextConfigurable &&
          regionsList.map((item, index) => {
            const { id, start, end, attribute } = item;
            // 兼容SingleTextInput的props
            const config = {
              label: `${t('textTool')}（${timeFormat(start, 'ss.SSS')} - ${timeFormat(end, 'ss.SSS')}）`,
              key: id,
              maxLength: 3000,
            };
            // 处理按tab无法正常切换问题
            const regionIndex = _configList.length + index;

            const attributeColor = getAttributeColor(attribute, clipAttributeList);

            const textStyle = {
              color: getAttributeFontColor(attribute, clipAttributeList),
              backgroundColor: attributeColor,
            };

            return (
              <SingleTextInput
                config={config}
                key={index}
                index={regionIndex}
                disabled={textInputDisabled}
                result={clipIdMapText}
                updateText={(text: string) => {
                  updateRegion?.({
                    ...item,
                    text,
                  });
                }}
                switchToNextTextarea={() => {
                  switchToNextTextarea(regionIndex);
                }}
                hasMultiple={true}
                onFocus={() => setFocusIndex(regionIndex)}
                onFocusStyle={
                  clipAttributeConfigurable
                    ? {
                        borderColor: attributeColor,
                        boxShadow: `0 0 0 2px ${updateColorOpacity(attributeColor, 0.4)}`,
                      }
                    : {}
                }
                extra={
                  clipAttributeConfigurable ? (
                    <div style={textStyle} className={styles.attribute}>
                      {getAttributeShowText(attribute, [
                        { value: '', key: t('NoAttribute') },
                        ...clipAttributeList,
                      ])}
                    </div>
                  ) : null
                }
              />
            );
          })}
        <AudioContext audioContext={preContext?.after} />
        {/* 文本显示按钮，不会存储在配置或结果中 */}
        {toggleShowText && (
          <div className={styles.switchItem}>
            {t('toggleShowText')}
            <Switch
              style={{ alignSelf: 'center' }}
              checked={showText}
              onChange={(v) => {
                toggleShowText(v);
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default TextInput;
