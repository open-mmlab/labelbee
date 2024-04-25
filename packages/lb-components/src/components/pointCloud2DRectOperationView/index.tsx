import { useLatest } from 'ahooks';
import { Spin } from 'antd/es';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import { usePointCloudViews } from '@/components/pointCloudView/hooks/usePointCloudViews';
import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import { a2MapStateToProps } from '@/store/annotation/map';
import { LabelBeeContext } from '@/store/ctx';
import { IMappingImg } from '@/types/data';
import { ImgUtils, PointCloud2DRectOperation } from '@labelbee/lb-annotation';
import { IBasicRect } from '@labelbee/lb-utils';

import { TAfterImgOnLoad } from '../AnnotationView';
import _ from 'lodash';

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
  const {
    pointCloudBoxList,
    setPointCloudResult,
    defaultAttribute,
    rectList,
    addRectIn2DView,
    updateRectIn2DView,
    removeRectIn2DView,
  } = useContext(PointCloudContext);

  const { update2DViewRect } = usePointCloudViews();
  const ref = React.useRef(null);
  const operation = useRef<any>(null);
  const update2DViewRectFn = useLatest<any>(update2DViewRect);
  const newPointCloudResult = useRef(null);

  const [loading, setLoading] = useState(true);

  const rectListInImage = rectList?.filter((item) => item.imageName === mappingData?.path);
  const mappingDataPath = useLatest<any>(mappingData?.path);

  const handleUpdateDragResult = (rect: IPointCloud2DRectOperationViewRect) => {
    const { boxID } = rect;
    if (boxID) {
      const result = update2DViewRectFn.current?.(rect);
      newPointCloudResult.current = result;
      setPointCloudResult(result);
      return;
    }
    updateRectIn2DView(rect);
  };

  const handleAddRect = (rect: IPointCloud2DRectOperationViewRect) => {
    addRectIn2DView({ ...rect, imageName: mappingDataPath.current });
  };

  const handleRemoveRect = (rect: IPointCloud2DRectOperationViewRect) => {
    const { boxID } = rect;
    if (boxID) {
      // 投射框不允许删除
      return;
    }
    removeRectIn2DView(rect.id);
  };

  const getRectListByBoxList = useCallback(() => {
    let allRects: IPointCloud2DRectOperationViewRect[] = [];
    pointCloudBoxList.forEach((pointCloudBox) => {
      const { rects = [], id, attribute, trackID } = pointCloudBox;
      const rect = rects.find((rect) => rect.imageName === mappingDataPath.current);
      const rectID = id + '_' + mappingDataPath.current;
      if (rect) {
        allRects = [...allRects, { ...rect, boxID: id, id: rectID, attribute, order: trackID }];
      }
    });
    return allRects;
  }, [pointCloudBoxList]);

  const updateRectList = () => {
    const rectListByBoxList = getRectListByBoxList();
    const selectedRectID = operation.current?.selectedRectID;
    operation.current?.setResult([...rectListByBoxList, ...rectListInImage]);
    if (selectedRectID) {
      operation.current?.setSelectedRectID(selectedRectID);
    }
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
      operation.current.on('afterAddingDrawingRect', handleAddRect);
      operation.current.on('deleteSelectedRect', handleRemoveRect);

      return () => {
        operation.current?.unbind('updateDragResult', handleUpdateDragResult);
        operation.current?.unbind('afterAddingDrawingRect', handleAddRect);
        operation.current?.unbind('deleteSelectedRect', handleRemoveRect);
        operation.current?.destroy();
      };
    }
  }, []);

  useEffect(() => {
    setLoading(true);
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
      updateRectList();
    }
  }, [pointCloudBoxList]);

  useEffect(() => {
    operation.current?.setDefaultAttribute?.(defaultAttribute);
  }, [defaultAttribute]);

  useEffect(() => {
    updateRectList();
  }, [rectListInImage]);

  return (
    <Spin spinning={loading}>
      <div ref={ref} style={{ position: 'relative', ...size }} />
    </Spin>
  );
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloud2DRectOperationView,
);
