import React, { useMemo } from 'react';
import { AudioPlayer } from '@/components/audioPlayer';
import { getClassName } from '@/utils/dom';
import PreviewResult from '@/components/predictTracking/previewResult';
import { Layout } from 'antd/es';
import { Spin } from 'antd';
import { prefix } from '@/constant';
import { AppProps } from '@/App';
import { CommonToolUtils, cTool } from '@labelbee/lb-annotation';
// const styles = require('./index.module.scss')
import styles from './index.module.scss';
import { isImageValue } from '@/utils/audio';
import TagResultShow from '@/components/audioAnnotate/tagResultShow';
import { AudioClipProvider, useAudioClipStore } from './audioContext';
import TextInput from './textInput';

const { EAudioToolName } = cTool;
const { Sider, Content } = Layout;
const layoutCls = `${prefix}-layout`;

interface IProps {
  path: string;
  loading: boolean;
  audioContext?: any;
}

const AudioTextToolTextarea = ({
  result,
  inputDisabled,
  updateText,
  configList,
  autofocus,
  preContext,
  isCheck,
  clipAttributeConfigurable,
  clipTextConfigurable,
  textConfigurable,
  updateRegion,
  clipAttributeList,
  EventBus
}: any) => {
  return (
    <div className={styles.textareaContainer}>
      <div className={styles.textareaContent}>
        <TextInput
          isCheck={isCheck}
          result={result?.value}
          textInputDisabled={inputDisabled}
          textID={result?.id || 0}
          updateText={updateText}
          configList={configList}
          autofocus={!inputDisabled && autofocus}
          preContext={preContext}
          regions={result?.regions}
          clipAttributeConfigurable={clipAttributeConfigurable}
          clipTextConfigurable={clipTextConfigurable}
          textConfigurable={textConfigurable}
          updateRegion={updateRegion}
          clipAttributeList={clipAttributeList}
          EventBus={EventBus}
        />
      </div>
    </div>
  );
};

const AudioSideBar = (props: any) => {
  if (typeof props.sider === 'function') {
    return props.sider({ useAudioClipStore });
  } else {
    return props.sider;
  }
};

const AudioAnnotate: React.FC<AppProps & IProps> = (props) => {
  const siderWidth = props.style?.sider?.width;

  // 迁移部分sensebee的参数
  const { step, stepList, audioContext, footer, sider, imgList } = props;
  const { currentFile: currentData, imgIndex, drawLayerSlot } = audioContext || {}
  const stepInfo = CommonToolUtils.getCurrentStepInfo(step, stepList);
  const annotationStepInfo = CommonToolUtils.getCurrentStepToolAndConfig(step, stepList);
  const {
    tagConfigurable,
    textConfigurable = true,
    clipConfigurable = false,
    clipAttributeConfigurable = false,
    clipAttributeList = [],
    clipTextConfigurable = false,
    inputList = [],
    configList = [],
  } = useMemo(() => {
    if (annotationStepInfo) {
      return CommonToolUtils.jsonParser(annotationStepInfo?.config);
    }
  }, [annotationStepInfo]);

  const clipConfig = {
    clipConfigurable,
    clipAttributeConfigurable,
    clipAttributeList,
    clipTextConfigurable,
  };

  const valid = isImageValue(currentData.result);
  const count = CommonToolUtils.jsonParser(currentData.result)?.duration ?? 0;
  const totalText = valid ? count : 0;
  const inputDisabled = !valid || audioContext?.loading || ![textConfigurable, clipTextConfigurable].includes(true);
  let preContext: { [key: string]: any } = {};
  if (imgIndex !== -1 && imgList?.length) {
    const preResult = imgList[imgIndex]?.preResult;
    const loadPreStep = audioContext?.isEdit ? audioContext?.stepConfig.loadPreStep : stepInfo.loadPreStep;

    if (preResult && loadPreStep) {
      const preResultObj = CommonToolUtils.jsonParser(preResult);
      const context = preResultObj?.config?.context ?? {};
      Object.keys(context).forEach((item: string) => {
        if (item && context[item]) {
          preContext[item] = {
            visible: true,
            content: context[item],
            type: item,
          };
        }
      });
    }
  }

  return <AudioClipProvider>
    <Spin spinning={audioContext?.loading} wrapperClassName='audio-tool-spinner'>
      <Layout className={getClassName('layout', 'container')} style={{ height: '100%' }}>
        {props?.leftSider}
        <Content className={`${layoutCls}__content`}>
          <div className={styles.containerWrapper}>
            <div className={styles.audioWrapper}>
              {tagConfigurable && (
                <TagResultShow result={audioContext?.result?.tag} labelInfoSet={inputList} EventBus={audioContext?.EventBus}/>
              )}
              {audioContext?.promptLayer}
              <AudioPlayer
                context={{
                  isEdit: audioContext?.isEdit,
                  count: totalText,
                  toolName: EAudioToolName.AudioTextTool,
                  imgIndex,
                }}
                drawLayerSlot={drawLayerSlot}
                fileData={currentData}
                onLoaded={audioContext?.onLoaded}
                invalid={!valid}
                updateRegion={audioContext?.updateRegion}
                removeRegion={audioContext.removeRegion}
                regions={audioContext?.result?.regions}
                activeToolPanel={audioContext?.activeToolPanel}
                footer={footer}
                EventBus={audioContext.EventBus}
                {...clipConfig}
              />
            </div>
            {(textConfigurable || clipTextConfigurable) && (
              <AudioTextToolTextarea
                preContext={preContext}
                result={audioContext?.result}
                inputDisabled={inputDisabled}
                updateText={audioContext?.updateText}
                updateRegion={audioContext?.updateRegion}
                configList={configList}
                autofocus={audioContext?.autoFocus}
                textConfigurable={textConfigurable}
                clipTextConfigurable={clipTextConfigurable}
                clipAttributeList={clipAttributeList}
                clipAttributeConfigurable={clipAttributeConfigurable}
                EventBus={audioContext.EventBus}
              />
            )}
          </div>
        </Content>
        <Sider
          className={`${layoutCls}__side`}
          width={siderWidth ?? 240}
          style={props.style?.sider}
        >
          <AudioSideBar sider={sider} />
        </Sider>
        <PreviewResult />
      </Layout>
    </Spin>
  </AudioClipProvider>;
};

export default AudioAnnotate
