/**
 * 用于标注查看模式
 * @author laoluo
 */

import React, {
  useEffect,
  useCallback,
  useRef,
  useImperativeHandle,
  useState,
  useContext,
} from 'react';
import { ViewOperation, ImgUtils, EPointCloudName } from '@labelbee/lb-annotation';
import { Spin } from 'antd/es';
import useRefCache from '@/hooks/useRefCache';
import { TAnnotationViewData, IPointCloudBoxList } from '@labelbee/lb-utils';
import MeasureCanvas from '../measureCanvas';
import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';

export type TAfterImgOnLoad = (img: HTMLImageElement) => void;

interface IProps {
  src: string; // 图片路径
  fallbackSrc?: string; // alternate pictures when picture loading fails
  size?: {
    width?: number;
    height?: number;
  };
  style?: {
    color?: string;
    fill?: string;
    thickness?: number;
  };
  annotations: any[]; // TODO: Update Type
  zoomChange?: (zoom: number) => void;
  backgroundStyle?: React.CSSProperties;
  onChange?: (type: 'hover' | 'selected', ids: string[]) => void;

  showLoading?: boolean;
  globalStyle?: React.CSSProperties; // Custom global style.

  afterImgOnLoad?: TAfterImgOnLoad;
  zoomInfo?: {
    min: number;
    max: number;
    ratio: number;
  };
  staticMode?: boolean;
  measureVisible?: boolean;
  onRightClick?: (e: { event: MouseEvent; targetId: string }) => void;
  pointCloudBoxList?: IPointCloudBoxList;
  hiddenText?: boolean;
  renderToolName?: EPointCloudName.PointCloud | undefined;
}

const DEFAULT_SIZE = {
  width: 455,
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
    fallbackSrc,
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
    measureVisible,
    onRightClick,
    pointCloudBoxList = [],
    hiddenText = false,
    renderToolName,
  } = props;
  const size = sizeInitialized(props.size);
  const [loading, setLoading] = useState(false);
  const annotationRef = useRef<HTMLDivElement>(null);
  const viewOperation = useRef<ViewOperation>();
  const afterImgOnLoadRef = useRefCache<TAfterImgOnLoad | undefined>(afterImgOnLoad);
  const annotationListCacheRef = useRef<TAnnotationViewData[][]>([]);
  const canUpdateRef = useRef(true); // Judge if rending is Possible.

  const { setSelectedIDs } = useContext(PointCloudContext);

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
        zoomInfo: props.zoomInfo,
        staticMode: props.staticMode,
        renderToolName,
      });

      viewOperation.current.init();
      onRightClick && viewOperation.current.on('onRightClick', onRightClick);
    }

    return () => {
      onRightClick && viewOperation.current?.unbind('onRightClick', onRightClick);
      viewOperation.current?.destroy();
    };
  }, [measureVisible]);

  const loadAndSetImage = useCallback(async (imageSrc: string) => {
    try {
      const imgNode = await ImgUtils.load(imageSrc);
      viewOperation.current?.setImgNode(imgNode);
      afterImgOnLoadRef.current?.(imgNode);
      return null;
    } catch (error) {
      console.error('Error loading image:', error);
      return error;
    }
  }, []);

  const loadImage = useCallback(
    async (imageSrc: string) => {
      setLoading(true);
      viewOperation.current?.setLoading(true);

      const error = await loadAndSetImage(imageSrc);
      if (error && fallbackSrc) {
        const fallbackError = await loadAndSetImage(fallbackSrc);
        if (fallbackError) {
          console.error('Error loading fallback image:', fallbackError);
        }
      }

      viewOperation.current?.setLoading(false);
      setLoading(false);
    },
    [loadAndSetImage, fallbackSrc],
  );

  useEffect(() => {
    if (viewOperation.current) {
      loadImage(src);
    }
  }, [src, measureVisible, fallbackSrc, loadImage]);

  useEffect(() => {
    if (viewOperation?.current) {
      viewOperation.current.setPointCloudBoxList(pointCloudBoxList);
    }
  }, [pointCloudBoxList]);

  useEffect(() => {
    if (viewOperation?.current) {
      viewOperation.current?.setHiddenText(hiddenText);
    }
  }, [hiddenText]);

  /**
   * 基础数据绘制监听
   *
   * 1. 设置更新缓存列表，若发现当前渲染未完成，则不进行更新，等上一次的渲染结束再进行最终更新列表的数据。
   */
  useEffect(() => {
    if (canUpdateRef.current === false) {
      annotationListCacheRef.current.push(annotations);
      return;
    }

    const clearAllStatus = () => {
      canUpdateRef.current = true;
      annotationListCacheRef.current = [];
    };

    const updateData = () => {
      // 1. Check the list.
      const len = annotationListCacheRef.current.length;
      if (len > 0) {
        // 2. Update the last data.
        const lastAnnotations = annotationListCacheRef.current[len - 1];
        annotationListCacheRef.current = [];
        viewOperation.current?.updateData(lastAnnotations).then(updateData).catch(clearAllStatus);
      } else {
        // 3. Allow to render.
        canUpdateRef.current = true;
      }
    };

    if (viewOperation.current) {
      canUpdateRef.current = false;
      viewOperation.current.updateData(annotations).then(updateData).catch(clearAllStatus);
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
  const { imgNode, zoom, currentPos } = viewOperation.current || {};
  return (
    <Spin spinning={showLoading || loading} delay={300} style={globalStyle}>
      {measureVisible && imgNode ? (
        <MeasureCanvas size={size} imgNode={imgNode} zoom={zoom} currentPos={currentPos} />
      ) : (
        mainRender
      )}
    </Spin>
  );

  // return mainRender;
};

export default React.forwardRef(AnnotationView);
