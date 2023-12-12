import React, { useRef } from 'react'
export const VideoTextLayer = (props: any) => {
  const { toolColor, value, configList, showEmptyValue, hasPromptLayer } = props;

  const textLayer = useRef<HTMLDivElement>(null);

  const getLabel = (key: string) => {
    const item = configList?.find((i: any) => i.key === key);
    return item?.label ?? key;
  };

  const getDisplayText = (str: string) => {
    /** pre-wrap默认不显示结尾行，需要添加空格让其正常显示 */
    return str.endsWith('\n') ? str + ' ' : str;
  };

  /** 渲染层级需要比审核图层更高，避免无法滚动超出的内容 */
  return (
    <div
      ref={textLayer}
      style={{
        position: 'absolute',
        right: 0,
        top: hasPromptLayer ? 40 : 0,
        zIndex: 22,
        maxWidth: 416,
        fontFamily: 'SourceHanSansCN-Regular',
        background: toolColor,
        color: 'white',
        wordBreak: 'break-all',
        lineHeight: '24px',
        whiteSpace: 'pre-wrap',
        maxHeight: '80%',
        overflowY: 'auto',
        opacity: 0.9,
      }}
    >
      {Object.keys(value)
        .filter((i: any) => (showEmptyValue ? true : value[i]))
        .map((i) => (
          <div
            key={i}
            style={{
              padding: '8px 16px',
            }}
          >
            <div>{`${getLabel(i)}:`}</div>
            <div>{getDisplayText(value[i]) || '(空)'}</div>
          </div>
        ))}
    </div>
  );
};
