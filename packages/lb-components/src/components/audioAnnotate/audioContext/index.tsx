import { RightOutlined } from '@ant-design/icons';
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Input } from 'antd';
import { useSetState } from 'ahooks';
import { SetState } from 'ahooks/lib/useSetState';
import { IAudioTextToolConfig } from '@labelbee/lb-utils';
import styles from './index.module.scss';
export enum EContextType {
  before = '前文',
  after = '后文',
}

interface IAudioContextProps {
  audioContext: {
    visible?: boolean;
    content: string;
    title: string;
    type: keyof typeof EContextType;
  };
}
const AudioContext = (props: IAudioContextProps) => {
  const { audioContext: context } = props;
  if (!context || !context.visible) {
    return null;
  }

  const { content, type } = context;
  return <AudioContextInfo title={EContextType?.[type]} content={content} />;
};

interface IProps {
  title: string;
  content: string;
}

const AudioContextInfo = (props: IProps) => {
  const [visible, setVisible] = useState(true);
  const [myContent, setMyContent] = useState('');
  const { title, content } = props;

  const toggleVisible = () => {
    setVisible(!visible);
  };

  useEffect(() => {
    setMyContent(content);
    setVisible(true);
  }, [content]);

  return (
    <div className={styles.audioContextContainer}>
      <div className={styles.title}>
        <RightOutlined
          style={{ marginRight: 8 }}
          rotate={visible ? 90 : 0}
          onClick={toggleVisible}
        />
        <span onClick={toggleVisible}>{title}</span>
      </div>
      {visible && (
        <div className={styles.content}>
          <Input.TextArea
            bordered={false}
            value={myContent}
            disabled={true}
            style={{ padding: 0 }}
            autoSize={true}
          />
        </div>
      )}
    </div>
  );
};

export default AudioContext;

export interface ISelectedRegion {
  id?: string;
  loop?: boolean;
}
type IAudioClipConfig = Pick<
  IAudioTextToolConfig,
  | 'clipConfigurable'
  | 'clipAttributeConfigurable'
  | 'clipAttributeList'
  | 'clipTextConfigurable'
  | 'secondaryAttributeConfigurable'
  | 'subAttributeList'
>;
interface IAudioClipState extends IAudioClipConfig {
  /** 选中的截取属性，新建截取片段的默认属性 */
  selectedAttribute: string;
  /** 选中的截取数据的id，loop用于展示是否在循环，空对象表示没有选中的数据 */
  selectedRegion: ISelectedRegion;
  /** 锁定属性的列表 */
  attributeLockList: string[];
  /** 是否按下合并键 */
  combined: boolean;
  /** 是否按下分割键 */
  segment: boolean;
}
interface IAudioClipContext {
  audioClipState: IAudioClipState;
  setAudioClipState: SetState<IAudioClipState>;
}

const DEFAULT_AUDIO_CLIP = {
  selectedAttribute: '',
  selectedRegion: {},
  attributeLockList: [],
  clipConfigurable: false,
  clipAttributeConfigurable: false,
  clipAttributeList: [],
  clipTextConfigurable: false,
  combined: false,
  segment: false,
};

const AudioClipContext = React.createContext<IAudioClipContext>({
  audioClipState: DEFAULT_AUDIO_CLIP,
  setAudioClipState: () => {},
});

export const useAudioClipStore = () => useContext(AudioClipContext);

export const AudioClipProvider: React.FC = ({ children }) => {
  const [state, setState] = useSetState(DEFAULT_AUDIO_CLIP);

  const value = useMemo(() => {
    return {
      audioClipState: state,
      setAudioClipState: setState,
    };
  }, [state, setState]);

  return <AudioClipContext.Provider value={value}>{children}</AudioClipContext.Provider>;
};
