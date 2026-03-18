import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { AppState } from 'src/store';
import { GraphToolInstance } from 'src/store/annotation/types';
import StepUtils from '@/utils/StepUtils';
import { IStepInfo } from '@/types/step';
import { jsonParser } from '@/utils';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { LabelBeeContext } from '@/store/ctx';
import { Divider, Select, Checkbox } from 'antd';
import { IInputList, i18n } from '@labelbee/lb-utils';
import AttributeList from '@/components/attributeList';

interface IProps {
  toolInstance?: GraphToolInstance;
  stepInfo?: IStepInfo;
}

const subTitleStyle = {
  margin: '12px 20px 8px',
  fontSize: 14,
  fontWeight: 500,
  wordWrap: 'break-word' as const,
};

const GlobalTagList: React.FC<IProps> = (props) => {
  const [_, forceRender] = useState(0);
  const { toolInstance } = props;
  const { t } = useTranslation();

  const config = props.stepInfo ? jsonParser(props.stepInfo.config) : {};
  const globalTagList = config?.globalTagList ?? [];
  const globalTagConfigurable = config?.globalTagConfigurable === true;

  const videoClipContext = (toolInstance as any)?.exportContext;
  const extraResult = videoClipContext?.extraResult ?? {};
  const globalTag = extraResult?.globalTag ?? {};

  if (!props.stepInfo || !globalTagConfigurable || globalTagList.length === 0) {
    return null;
  }

  const setGlobalTag = (key: string, value: string | string[]) => {
    if (toolInstance && (toolInstance as any).setGlobalTag) {
      if (Array.isArray(value)) {
        (toolInstance as any).setGlobalTag(key, value.join(';'));
      } else {
        (toolInstance as any).setGlobalTag(key, value);
      }
      forceRender((s) => s + 1);
    }
  };

  const getGlobalTagValue = (tag: IInputList) => {
    const value = globalTag[tag.value];

    if (tag?.isMulti) {
      return value ? value?.split(';') : [];
    }

    return value;
  };

  return (
    <>
      {globalTagList.map(
        (tag: IInputList) =>
          tag?.subSelected && (
            <div style={{ marginTop: 12 }} key={tag.value}>
              <div style={subTitleStyle}>
                {t('GlobalTag')}-{tag.key}
              </div>
              {tag.subSelected?.length < 5 ? (
                tag?.isMulti ? (
                  <Checkbox.Group
                    style={{
                      padding: `0px 20px 16px 16px`,
                    }}
                    options={tag.subSelected.map((v: IInputList) => ({
                      label: v.key,
                      value: v.value,
                    }))}
                    value={getGlobalTagValue(tag) as string[]}
                    onChange={(value) => setGlobalTag(tag.value, value as string[])}
                  />
                ) : (
                  <AttributeList
                    list={tag.subSelected.map((v: IInputList) => ({
                      label: v.key,
                      value: v.value,
                    }))}
                    selectedAttribute={getGlobalTagValue(tag) as string}
                    num='-'
                    forbidColor={true}
                    forbidDefault={true}
                    attributeChanged={(value) => setGlobalTag(tag.value, value)}
                    style={{ marginBottom: 12 }}
                  />
                )
              ) : (
                <Select
                  style={{ margin: '0px 20px 16px 16px', width: '87%' }}
                  mode={tag?.isMulti ? 'multiple' : undefined}
                  value={getGlobalTagValue(tag)}
                  placeholder={t('PleaseSelect')}
                  onChange={(value) => setGlobalTag(tag.value, value)}
                  allowClear={true}
                >
                  {tag.subSelected.map((sub: IInputList) => (
                    <Select.Option key={sub.value} value={sub.value}>
                      {sub.key}
                    </Select.Option>
                  ))}
                </Select>
              )}
              <Divider style={{ margin: 0 }} />
            </div>
          ),
      )}
    </>
  );
};

const mapStateToProps = (state: AppState) => {
  const stepInfo = StepUtils.getCurrentStepInfo(state.annotation?.step, state.annotation?.stepList);
  
  return {
    toolInstance: state.annotation.toolInstance,
    stepInfo,
  };
};

const WrapGlobalTagList = (props: IProps) => {
  return (
    <I18nextProvider i18n={i18n}>
      <GlobalTagList {...props} />
    </I18nextProvider>
  );
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(WrapGlobalTagList);
