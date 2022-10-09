/**
 * 用于标注查看模式
 * @author laoluo
 */

import React, { useEffect, useRef, useImperativeHandle, useState } from 'react';
import { ViewOperation, ImgUtils } from '@labelbee/lb-annotation';
import { Spin } from 'antd/es';
import useRefCache from '@/hooks/useRefCache';

type TAfterImgOnLoad = (img: HTMLImageElement) => void;

interface IProps {
  src: string; // 图片路径
  size?: {
    width?: number;
    height?: number;
  };
  style?: {
    color?: string;
    fill?: string;
    thickness?: number;
  };
  annotations: any[]; // TODO
  zoomChange?: (zoom: number) => void;
  backgroundStyle?: React.CSSProperties;
  onChange?: (type: 'hover' | 'selected', ids: string[]) => void;

  showLoading?: boolean;
  globalStyle?: React.CSSProperties; // Custom global style.

  afterImgOnLoad?: TAfterImgOnLoad;
}

const DEFAULT_SIZE = {
  width: 500,
  height: 100, // Most Important, If the outer size is smaller than this will not take effect by default
};

const sizeInitialized = (size?: { width?: number; height?: number }) => {
  if (!size) {
    return DEFAULT_SIZE;
  }
  if (size.width && size.height) {
    return size;
  }

  const newSize = {
    ...size,
  };

  if (!newSize.width) {
    newSize.width = DEFAULT_SIZE.width;
  }

  if (!newSize.height) {
    newSize.height = DEFAULT_SIZE.height;
  }

  return newSize;
};

const AnnotationView = (props: IProps, ref: any) => {
  const {
    src,
    annotations = [],
    style = {
      stroke: 'blue',
      thickness: 3,
    },
    zoomChange,
    backgroundStyle = {},
    onChange,
    showLoading = false,
    globalStyle,
    afterImgOnLoad,
  } = props;
  const size = sizeInitialized(props.size);
  const [loading, setLoading] = useState(false);
  const annotationRef = useRef<HTMLDivElement>(null);
  const viewOperation = useRef<ViewOperation>();
  const afterImgOnLoadRef = useRefCache<TAfterImgOnLoad | undefined>(afterImgOnLoad);

  useImperativeHandle(
    ref,
    () => {
      const toolInstance = viewOperation.current;
      if (!toolInstance) {
        return {};
      }

      return {
        zoomIn: () => toolInstance.zoomChanged(true), // 放大
        zoomOut: () => toolInstance.zoomChanged(false), // 缩小
        initImgPos: () => toolInstance.initImgPos(),
        toolInstance,
      };
    },
    [viewOperation.current],
  );

  useEffect(() => {
    if (annotationRef.current) {
      viewOperation.current = new ViewOperation({
        container: annotationRef.current,
        size,
        style,
        annotations,
        config: '{}', // TODO，暂时不需要
      });

      viewOperation.current.init();
    }

    return () => {
      viewOperation.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (viewOperation.current) {
      setLoading(true);
      viewOperation.current?.setLoading(true);
      ImgUtils.load(src)
        .then((imgNode: HTMLImageElement) => {
          viewOperation.current?.setLoading(false);
          setLoading(false);

          viewOperation.current?.setImgNode(imgNode);

          if (afterImgOnLoadRef.current) {
            afterImgOnLoadRef.current(imgNode);
          }
        })
        .catch(() => {
          viewOperation.current?.setLoading(false);
          setLoading(false);
        });
    }
  }, [src]);

  /**
   * 基础数据绘制监听
   */
  useEffect(() => {
    if (viewOperation.current) {
      viewOperation.current.updateData(annotations);
    }
  }, [annotations]);

  /** 窗口大小监听 */
  useEffect(() => {
    const toolInstance = viewOperation.current;

    if (toolInstance?.setSize) {
      toolInstance.setSize(size);
      toolInstance.initPosition();
    }
  }, [props.size?.width, props.size?.height]);

  useEffect(() => {
    if (viewOperation.current) {
      viewOperation.current?.on('onChange', (...args: any) => {
        onChange?.apply(null, args);
      });

      viewOperation.current?.on('renderZoom', (zoom: number) => {
        if (zoomChange) {
          zoomChange(zoom);
        }
      });
    }
    return () => {
      viewOperation.current?.unbindAll('onChange');
      viewOperation.current?.unbindAll('renderZoom');
    };
  }, [zoomChange, onChange]);

  const mainRender = (
    <div ref={annotationRef} style={{ position: 'relative', ...size, ...backgroundStyle }} />
  );

  return (
    <Spin spinning={showLoading || loading} delay={300} style={globalStyle}>
      {mainRender}
    </Spin>
  );

  // return mainRender;
};

export default React.forwardRef(AnnotationView);
