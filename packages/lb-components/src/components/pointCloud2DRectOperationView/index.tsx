import { useLatest } from 'ahooks';
import { Spin } from 'antd/es';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import { usePointCloudViews } from '@/components/pointCloudView/hooks/usePointCloudViews';
import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import { a2MapStateToProps } from '@/store/annotation/map';
import { LabelBeeContext } from '@/store/ctx';
import { IMappingImg } from '@/types/data';
import { ImgUtils, PointCloud2DRectOperation } from '@labelbee/lb-annotation';
import { IBasicRect } from '@labelbee/lb-utils';

import { TAfterImgOnLoad } from '../AnnotationView';

interface IPointCloud2DRectOperationViewProps {
  mappingData?: IMappingImg;
  size: {
    width: number;
    height: number;
  };
  config: any;
  checkMode?: boolean;
  afterImgOnLoad: TAfterImgOnLoad;
}

interface IPointCloud2DRectOperationViewRect extends IBasicRect {
  boxID: string;
  id: string;
  attribute: any;
  order?: number;
}

const PointCloud2DRectOperationView = (props: IPointCloud2DRectOperationViewProps) => {
  const { mappingData, size, config, checkMode, afterImgOnLoad } = props;
  const url = mappingData?.url ?? '';
  const { pointCloudBoxList, setPointCloudResult } = useContext(PointCloudContext);

  const { update2DViewRect } = usePointCloudViews();
  const ref = React.useRef(null);
  const operation = useRef<any>(null);
  const update2DViewRectFn = useLatest<any>(update2DViewRect);
  const newPointCloudResult = useRef(null);

  const [loading, setLoading] = useState(true);

  const handleUpdateDragResult = (rect: IPointCloud2DRectOperationViewRect) => {
    const result = update2DViewRectFn.current?.(rect);
    newPointCloudResult.current = result;
    setPointCloudResult(result);
  };

  const setRects = () => {
    let allRects: IPointCloud2DRectOperationViewRect[] = [];
    pointCloudBoxList.forEach((pointCloudBox) => {
      const { rects = [], id, attribute, trackID } = pointCloudBox;
      const rect = rects.find((rect) => rect.imageName === mappingData?.path);
      const rectID = id + '_' + mappingData?.path;
      if (rect) {
        allRects = [...allRects, { ...rect, boxID: id, id: rectID, attribute, order: trackID }];
      }
    });
    operation.current?.setResult(allRects);
  };

  useEffect(() => {
    if (ref.current) {
      const toolInstance = new PointCloud2DRectOperation({
        container: ref.current,
        size,
        config: { ...config, isShowOrder: true, attributeConfigurable: true },
        checkMode,
      });

      operation.current = toolInstance;
      operation.current.init();
      operation.current.on('updateDragResult', handleUpdateDragResult);

      return () => {
        operation.current?.unbind('updateDragResult', handleUpdateDragResult);
        operation.current?.destroy();
      };
    }
  }, []);

  useEffect(() => {
    if (operation.current && url) {
      ImgUtils.load(url).then((imgNode: HTMLImageElement) => {
        operation.current.setImgNode(imgNode);
        afterImgOnLoad(imgNode);
        setLoading(false);
      });
    }
  }, [url]);

  useEffect(() => {
    operation.current?.setSize(size);
  }, [size]);

  useEffect(() => {
    // Avoid repeated rendering
    if (pointCloudBoxList !== newPointCloudResult.current) {
      setRects();
    }
  }, [pointCloudBoxList, url]);

  return (
    <Spin spinning={loading}>
      <div ref={ref} style={{ position: 'relative', ...size }} />
    </Spin>
  );
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloud2DRectOperationView,
);
