import React, { useEffect, useState, useRef, FocusEvent } from 'react';
import { connect } from 'react-redux';
import { AppState } from '@/store';
import { cloneDeep } from 'lodash';
import { classnames } from '@/utils';
import { Input, Switch } from 'antd/es';
import { cKeyCode, cTool } from '@labelbee/lb-annotation';
import { PageForward } from '@/store/annotation/actionCreators';
import { ConfigUtils } from '@/utils/ConfigUtils';
import { IStepInfo } from '@/types/step';
import TextToolOperation from '@labelbee/lb-annotation/dist/types/core/toolOperation/TextToolOperation';
import { useTranslation } from 'react-i18next';
import { LabelBeeContext } from '@/store/ctx';
import { VideoTextTool } from '@/components/videoAnnotate/videoTextTool';

const EKeyCode = cKeyCode.default;
const { EVideoToolName } = cTool

const syntheticEventStopPagination = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  e.stopPropagation();
  e.nativeEvent.stopPropagation();
  e.nativeEvent.stopImmediatePropagation();
};

interface ITextareaWithFooterProps {
  textareaProps?: any;
  footer?: any;
}

export const TextareaWithFooter = (props: ITextareaWithFooterProps) => {
  const { textareaProps, footer } = props;

  return (
    <>
      <Input.TextArea
        bordered={false}
        rows={6}
        onKeyDown={syntheticEventStopPagination}
        onKeyUp={syntheticEventStopPagination}
        {...textareaProps}
      />
      <div
        className={classnames({
          textAreaLength: true,
        })}
      >
        {footer}
      </div>
    </>
  );
};

interface IProps {
  dispatch: Function;
  toolInstance: TextToolOperation | VideoTextTool;
  imgIndex: number;
  triggerEventAfterIndexChanged: boolean;
  step: number;
  stepList: IStepInfo[];
  basicResultList: any[];
}

interface IConfigListItem {
  label: string;
  key: string;
  required: boolean;
  default: string;
  maxLength: number;
}

export const SingleTextInput = (props: any) => {
  const ref = useRef(null);
  const [textAreaFocus, setTextAreaFocus] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const { t } = useTranslation();

  const { disabled, config, result, updateText, index, switchToNextTextarea, hasMultiple, onNext } =
    props;
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
    onFocus: () => {
      setTextAreaFocus(true);
    },
    onBlur: (e: FocusEvent<HTMLTextAreaElement>) => {
      setTextAreaFocus(false);
      if (config.required) {
        setInvalid(!e.target.value);
      }
    },
    style: {
      resize: 'none',
      wordBreak: 'break-all',
    },
    onKeyDownCapture: (e: React.KeyboardEvent) => {
      if (e.ctrlKey && e.keyCode === EKeyCode.Enter) {
        if (onNext) {
          onNext();
        }
        e.preventDefault();
      }

      if (e.keyCode === EKeyCode.Tab && tabToSwitchEnabled) {
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
        switchToNextTextarea(index);
      }

      e.nativeEvent.stopPropagation();
    },
  };

  const TextareaFooter = (
    <div className='textAreaFooter'>
      <div className='hotkeyTip'>
        {tabToSwitchEnabled && <span>{`[${t('Switch')}]Tab`}</span>}
        <span>{`[${t('TurnPage')}]Ctrl+Enter`}</span>
      </div>
      <div className='wordCount'>
        <span className={textLength >= maxLength ? 'warning' : ''}>{textLength}</span>/
        <span>{maxLength}</span>
      </div>
    </div>
  );

  useEffect(() => {
    if (disabled) {
      setTextAreaFocus(false);
    }
  }, [disabled]);

  return (
    <div className='textField'>
      <div className='label'>
        <span className={classnames({ required: config.required })}>{config.label}</span>
        <i
          className={classnames({ clearText: true, disabled: disabled })}
          onClick={() => {
            if (disabled) {
              return;
            }
            updateTextWithKey('');
          }}
        />
      </div>
      <div
        className={classnames({
          disabled,
          'textarea-outline': true,
          'ant-input-focused': textAreaFocus,
          textareaContainer: true,
          focus: textAreaFocus,
          invalid: invalid,
        })}
      >
        <TextareaWithFooter footer={TextareaFooter} textareaProps={textareaProps} />
      </div>
    </div>
  );
};

const TextToolSidebar: React.FC<IProps> = ({
  toolInstance,
  imgIndex,
  dispatch,
  triggerEventAfterIndexChanged,
  step,
  stepList,
  basicResultList,
}) => {
  const [configList, setConfigList] = useState<IConfigListItem[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const [showText, setShowText] = useState<boolean>(true);
  const [, forceRender] = useState(0);

  const { t } = useTranslation();

  const switchToNextTextarea = (currentIndex: number) => {
    const nextIndex = (currentIndex + 1) % configList.length;
    textareaFocus(nextIndex);
  };

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

  useEffect(() => {
    if (toolInstance) {
      setConfigList(cloneDeep(toolInstance.config.configList));
      toolInstance.singleOn('valueUpdated', () => {
        forceRender((s) => s + 1);
      });
    }
  }, [toolInstance]);

  const result = toolInstance?.textList?.[0]?.value ?? {};

  const updateText = (v: string, k: string) => {
    toolInstance?.updateTextValue?.(k, v, toolInstance?.textList?.[0]);
  };

  useEffect(() => {
    if (imgIndex > -1 && triggerEventAfterIndexChanged) {
      textareaFocus(0);
    }
  }, [imgIndex]);

  const onNext = () => {
    dispatch(PageForward(true));
  };

  const toggleShowText = (v: boolean) => {
    setShowText(v)
    toolInstance?.toggleShowText(v)
  }

  const stepConfig = ConfigUtils.getStepConfig(stepList, step);
  const disabled = stepConfig.dataSourceStep > 0 && basicResultList.length === 0;
  const showToggleText = stepConfig.tool === EVideoToolName.VideoTextTool
  return toolInstance && (
    <div className='textToolOperationMenu'>
      {configList.map((i, index) => (
        <SingleTextInput
          config={i}
          key={i.key}
          index={index}
          result={result}
          updateText={updateText}
          switchToNextTextarea={switchToNextTextarea}
          hasMultiple={configList.length > 1}
          focus={focusIndex === index}
          onNext={onNext}
          disabled={disabled}
        />
      ))}
      {showToggleText && (
        <div className='textToolSwitchItem'>
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
  );
};

function mapStateToProps(state: AppState) {
  return {
    toolInstance: state.annotation.toolInstance,
    imgIndex: state.annotation.imgIndex,
    step: state.annotation.step,
    basicResultList: state.annotation.basicResultList,
    stepList: state.annotation.stepList,
    triggerEventAfterIndexChanged: state.annotation.triggerEventAfterIndexChanged,
  };
}

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(TextToolSidebar);
