/**
 * 用于标注查看模式
 * @author laoluo
 */

import React, { useEffect, useRef, useImperativeHandle, useState } from 'react';
import { ViewOperation, ImgUtils } from '@labelbee/lb-annotation';
import { Spin } from 'antd/es';

interface IProps {
  src: string; // 图片路径
  size: {
    width: number;
    height: number;
  };
  style: {
    color?: string;
    fill?: string;
    thickness?: number;
  };
  annotations: any[]; // TODO
  zoomChange?: (zoom: number) => void;
  backgroundStyle: React.CSSProperties;
  onChange?: (type: 'hover' | 'selected', ids: string[]) => void;

  showLoading?: boolean;
}

const DEFAULT_SIZE = {
  width: 1280,
  height: 720,
};

const AnnotationView = (props: IProps, ref: any) => {
  const {
    size = DEFAULT_SIZE,
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
  } = props;
  const [loading, setLoading] = useState(false);
  const annotationRef = useRef<HTMLDivElement>(null);
  const viewOperation = useRef<ViewOperation>();

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
    }
  }, [size?.width, size?.height]);

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

  const mainRender = <div ref={annotationRef} style={{ ...size, ...backgroundStyle }} />;

  return (
    <Spin spinning={showLoading || loading} delay={300}>
      {mainRender}
    </Spin>
  );

  // return mainRender;
};

export default React.forwardRef(AnnotationView);
