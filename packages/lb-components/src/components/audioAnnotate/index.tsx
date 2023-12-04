import React, { useMemo, useState, useEffect } from 'react';
import { AudioPlayer } from '@/components/audioPlayer';
import { getClassName } from '@/utils/dom';
import PreviewResult from '@/components/predictTracking/previewResult';
import { Layout } from 'antd/es';
import { Spin } from 'antd';
import { prefix } from '@/constant';
import { AppProps } from '@/App';
import { cKeyCode, CommonToolUtils, cTool, uuid, TagUtils, EventBus } from '@labelbee/lb-annotation';
import styles from './index.module.scss';
import TagResultShow from '@/components/audioAnnotate/tagResultShow';
import { AudioClipProvider, useAudioClipStore } from './audioContext';
import TextInput from './textInput';
import { connect } from 'react-redux';
import { a2MapStateToProps, IA2MapStateProps } from '@/store/annotation/map';
import { LabelBeeContext } from '@/store/ctx';
import { jsonParser } from '@/utils';
import { useCustomToolInstance } from '@/hooks/annotation';
import { IAudioTimeSlice, ITextConfigItem } from '@labelbee/lb-utils'
import { sidebarCls } from '@/views/MainView/sidebar';
import LabelSidebar from './audioSide/labelSidebar'
import ClipSidebar from './audioSide/clipSidebar'
import ToggleTagModeSvg from '@/assets/annotation/audio/tag.svg';
import ToggleTagModeASvg from '@/assets/annotation/audio/tagA.svg';
import ClipSvg from '@/assets/annotation/audio/clip.svg'
import ClipASvg from '@/assets/annotation/audio/clipA.svg'

const { EAudioToolName } = cTool;
const EKeyCode = cKeyCode.default;

const { Sider, Content } = Layout;
const layoutCls = `${prefix}-layout`;

interface IProps extends IA2MapStateProps {
  path: string;
  loading: boolean;
  audioContext?: any;
}

const ToggleAudioOption = ({
  setSideTab,
  sideTab,
}: {
  setSideTab: (v: string) => void;
  sideTab: string;
}) => {
  const options = [
    {
      tab: 'tag',
      commonSvg: ToggleTagModeSvg,
      selectedSvg: ToggleTagModeASvg,
    },
    {
      tab: 'clip',
      commonSvg: ClipSvg,
      selectedSvg: ClipASvg,
    },
  ];

  return (
    <div className={styles.toggleAudioOption}>
      {options.map((info, index) => {
        const { tab, selectedSvg, commonSvg } = info;

        return (
          <div key={index} className={styles.option}>
            <img
              className={styles.icon}
              src={sideTab === tab ? selectedSvg : commonSvg}
              onClick={() => {
                if (sideTab === tab) {
                  return;
                }
                setSideTab(tab);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

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
        />
      </div>
    </div>
  );
};

const AudioSideBar = (props: any) => {
  const {
    sider,
    config,
    result,
    updateTagResult,
    updateRegion,
    isEdit,
    tagConfigurable,
    clipConfigurable,
  } = props
  let labelInfoSet = config?.inputList || []
  let tagResult = result?.tag ?? {}
  let regions = result?.regions ?? []

  const [labelSelectedList, setLabelSelectedList] = useState<number[]>([]);

  const [sideTab, setSideTab] = useState('tag');

  useEffect(() => {
    if (!tagConfigurable && clipConfigurable) {
      setSideTab('clip');
      return;
    }

    setSideTab('tag');
  }, [tagConfigurable, clipConfigurable]);

  useEffect(() => {
    window.addEventListener('keydown', keydown);
    return () => {
      window.removeEventListener('keydown', keydown);
    };
  });

  const keydown = (e: KeyboardEvent) => {
    if (tagConfigurable && clipConfigurable) {
      switch (e.keyCode) {
        case EKeyCode.L:
          setSideTab('tag');
          break;
        case EKeyCode.X:
          setSideTab('clip');
          break;
      }
    }

    if (sideTab === 'tag') {
      if (!CommonToolUtils.hotkeyFilter(e)) {
        return;
      }

      if (CommonToolUtils.isMoveKey(e?.keyCode)) {
        e.preventDefault();
      }

      let keyCode = e.keyCode;

      if (keyCode) {
        if ((keyCode <= 57 && keyCode >= 49) || (keyCode <= 105 && keyCode >= 97)) {
          if (keyCode > 57) {
            keyCode = keyCode - 97;
          } else {
            keyCode = keyCode - 49;
          }

          // 数字键 0 - 9 48 - 57 / 97 - 105
          // 数字键检测
          const labeleSelectedList = labelSelectedList.slice();

          if (labelInfoSet.length === 1) {
            // 说明标签只有一层
            setLabel(0, keyCode);
            setLabelSelectedList([0, keyCode]);
            setTimeout(() => {
              setLabelSelectedList([]);
            }, 500);
          } else if (labeleSelectedList.length === 1) {
            setLabel(labeleSelectedList[0], keyCode);
            setLabelSelectedList([labeleSelectedList[0], keyCode]);
            setTimeout(() => {
              setLabelSelectedList([]);
            }, 500);
          } else {
            setLabelSelectedList([keyCode]);
          }
        }
      }
    }
  };
  const setLabel = (i: number, j: number) => {
    // 改数据要触发外层数据更新 updateTagResult
    // 需要判断 i j 是否能找到 labelInfoSet 的值
    if (
      i < labelInfoSet.length &&
      labelInfoSet[i].subSelected &&
      j < labelInfoSet[i].subSelected.length
    ) {
      const key = labelInfoSet[i].value;
      const isMulti = labelInfoSet[i].isMulti;

      let value = labelInfoSet[i].subSelected[j].value;
      // 判断是否有数据， 有则需要检测覆盖

      let times = 0;
      const result = tagResult;

      for (const oldKey in tagResult) {
        if (oldKey === labelInfoSet[i].value) {
          times++;

          // 需要区分是否为多选
          if (isMulti === true) {
            const keyList = result[oldKey].split(';').filter((v: string) => v !== ''); // 注意： 需要过滤 '' 空字符串分割出现 ['']
            const index = keyList.indexOf(value);

            if (index === -1) {
              keyList.push(value);
            } else {
              // 处在数据需要清除
              keyList.splice(index, 1);
            }
            value = keyList.join(';');
          }

          if (value === '') {
            delete result[oldKey];
          } else {
            result[oldKey] = value;
          }
        }
      }

      // 如果都不在的说明为新的,需要往里面嵌入新的信息
      times === 0 && Object.assign(tagResult, { [key]: value });
      updateTagResult(tagResult);
    }
  };

  const clearTagResult = (value: any) => {
    delete tagResult[value];
    updateTagResult(tagResult);
  };

  const toggleAudioOption = tagConfigurable && clipConfigurable && <ToggleAudioOption setSideTab={setSideTab} sideTab={sideTab} />

  const labelSidebar = sideTab === 'tag' && <LabelSidebar
    labelInfoSet={tagConfigurable ? labelInfoSet : []} // 工具配置
    labelSelectedList={labelSelectedList}
    setLabel={setLabel}
    tagResult={tagResult}
    clearResult={clearTagResult}
    isEdit={isEdit}
    withPanelTab={false}
  />

  const clipSidebar = sideTab === 'clip' && <ClipSidebar
    regions={regions}
    updateRegion={updateRegion}
    useAudioClipStore={useAudioClipStore}
  />

  if (sider) {
    if (typeof sider === 'function') {
      return <div className={`${sidebarCls}`}>
        {sider({
          toggleAudioOption,
          labelSidebar,
          clipSidebar,
        })}
      </div>
    } else {
      return sider;
    }
  }
  return (
    <div className={`${sidebarCls}`}>
      <div className={`${sidebarCls}__content`}>
        {toggleAudioOption}
        {labelSidebar}
        {clipSidebar}
      </div>
    </div>
  );

};

const AudioAnnotate: React.FC<AppProps & IProps> = (props) => {
  const siderWidth = props.style?.sider?.width;

  // 迁移部分sensebee的参数
  const { step, stepList, audioContext, sider, drawLayerSlot, imgList, imgIndex, currentData, config, stepInfo } = props;
  const annotationStepInfo = CommonToolUtils.getCurrentStepToolAndConfig(step, stepList);

  const basicInfo = jsonParser(currentData.result);
  const { toolInstanceRef } = useCustomToolInstance({ basicInfo });

  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<any>(null)
  const [duration, setDuration] = useState<number>(0)

  useEffect(() => {
    setLoading(true)
  }, [imgIndex])

  useEffect(() => {
    if (loading === false) {
      initResult()
    }
  }, [loading])

  useEffect(() => {
    initToolInstance()
  }, [])

  useEffect(() => {
    toolInstanceRef.current.exportData = () => {
      return [[result], { duration, valid }];
    };

    toolInstanceRef.current.setResult = updateResult
    toolInstanceRef.current.clearResult = clearResult
    toolInstanceRef.current.currentPageResult = result?.regions
    toolInstanceRef.current.emit('updatePageNumber')
  }, [result]);


  const initToolInstance = () => {
    toolInstanceRef.current.emit = (event: string) => {
      const listener = toolInstanceRef.current.fns.get(event);
      if (listener) {
        listener.forEach((fn: any) => {
          if (fn) {
            fn?.();
          }
        });
      }
    }
    toolInstanceRef.current.fns = new Map()
    toolInstanceRef.current.singleOn = (event: string, func: () => void) => {
      toolInstanceRef.current.fns.set(event, [func]);
    };

    toolInstanceRef.current.on = (event: string, func: () => void) => {
      toolInstanceRef.current.singleOn(event, func);
    };

    toolInstanceRef.current.unbindAll = (eventName: string) => {
      toolInstanceRef.current.fns.delete(eventName);
    };
  }

  const currentResult = useMemo(() => {
    const stepResult = basicInfo[`step_${stepInfo?.step}`]
    return stepResult?.result || []
  }, [config, basicInfo, stepInfo])

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

  const valid = audioContext ? audioContext?.valid : true;
  const count = CommonToolUtils.jsonParser(currentData.result)?.duration ?? 0;
  const totalText = valid ? count : 0;
  const inputDisabled = !valid || loading || ![textConfigurable, clipTextConfigurable].includes(true);
  let preContext: { [key: string]: any } = {};
  if (imgIndex !== -1 && imgList?.length) {
    const preResult = imgList[imgIndex]?.preResult;
    const loadPreStep = audioContext?.isEdit ? audioContext?.stepConfig?.loadPreStep : stepInfo?.loadPreStep;

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

  const initResult = () => {
    if (currentResult?.length > 0) {
      setResult(currentResult[0])
    } else {
      setResult({
        id: uuid(),
        sourceID: '',
        value: getInitValue(),
        tag: getInitTagValue(),
        regions: [],
      })
    }
  }

  /** 获取文本的默认数据 */
  const getInitValue = (useDefault = true) => {
    const initValue: any = {};
    let configList = config.configList || [];
    if (configList.length > 0) {
      configList.forEach((i: ITextConfigItem) => {
        initValue[i.key as keyof typeof initValue] = useDefault ? i.default || '' : '';
      });
    }

    return initValue;
  };

  /** 获取标签的默认数据 */
  const getInitTagValue = () => {
    return TagUtils.getDefaultResultByConfig(config.inputList || []);
  };

  const onLoaded = ({ duration, hasError }: any) => {
    setLoading(false);
    setDuration(duration);
  }

  const removeRegion = (id: string) => {
    setResult((result: any) => ({
      ...result,
      regions: (result?.regions || []).filter((item: any) => item.id !== id),
    }))
  };

  const updateRegion = (region: IAudioTimeSlice) => {
    setResult((result: any) => {
      const currentRegions: IAudioTimeSlice[] = result?.regions ?? [];
      const { id } = region;
      const currentRegion = currentRegions.find((item: IAudioTimeSlice) => item.id === id);
      if (currentRegion) {
        return {
          ...result,
          regions: currentRegions.map((item: IAudioTimeSlice) => {
            if (id === item.id) {
              return {
                ...item,
                ...region,
              };
            }
            return item;
          }),
        }
      } else {
        return {
          ...result,
          regions: [...currentRegions, region],
        }
      }
    })
  };

  const updateText = (val: string, key: string) => {
    setResult((result: any) => ({
      ...result,
      value: {
        ...result.value,
        [key]: val,
      }
    }))
  }

  const updateTagResult = (tagResult: any) => {
    setResult((result: any) => ({
      ...result,
      tag: tagResult,
    }))
  }

  const updateResult = (result: any) => {
    setResult(result)
  }

  const clearResult = () => {
    setResult((result: any) => ({
      ...result,
      value: getInitValue(),
      tag: {},
      regions: [],
    }))
    EventBus.emit('clearRegions');
  }

  return <AudioClipProvider>
    <Spin spinning={loading} wrapperClassName='audio-tool-spinner'>
      <Layout className={getClassName('layout', 'container')} style={{ height: '100%' }}>
        {props?.leftSider}
        <Content className={`${layoutCls}__content`}>
          <div className={styles.containerWrapper}>
            <div className={styles.audioWrapper}>
              {tagConfigurable && (
                <TagResultShow result={result?.tag} labelInfoSet={inputList} hasPromptLayer={!!audioContext?.promptLayer}/>
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
                onLoaded={onLoaded}
                invalid={!valid}
                updateRegion={updateRegion}
                removeRegion={removeRegion}
                regions={result?.regions}
                activeToolPanel={audioContext?.activeToolPanel}
                footer={props.footer}
                {...clipConfig}
              />
            </div>
            {(textConfigurable || clipTextConfigurable) && (
              <AudioTextToolTextarea
                preContext={preContext}
                result={result}
                inputDisabled={inputDisabled}
                updateText={updateText}
                updateRegion={updateRegion}
                configList={configList}
                autofocus={false}
                textConfigurable={textConfigurable}
                clipTextConfigurable={clipTextConfigurable}
                clipAttributeList={clipAttributeList}
                clipAttributeConfigurable={clipAttributeConfigurable}
              />
            )}
          </div>
        </Content>
        <Sider
          className={`${layoutCls}__side`}
          width={siderWidth ?? 240}
          style={props.style?.sider}
        >
          <AudioSideBar
            sider={sider}
            config={config}
            result={result}
            updateTagResult={updateTagResult}
            updateRegion={updateRegion}
            isEdit={audioContext?.isEdit}
            tagConfigurable={tagConfigurable}
            clipConfigurable={clipConfigurable}
          />
        </Sider>
        <PreviewResult />
      </Layout>
    </Spin>
  </AudioClipProvider>;
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(AudioAnnotate)
