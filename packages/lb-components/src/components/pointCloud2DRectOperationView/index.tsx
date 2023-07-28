import { useLatest } from 'ahooks';
import React, { useContext, useEffect, useRef } from 'react';
import { connect } from 'react-redux';

import { a2MapStateToProps } from '@/store/annotation/map';
import { LabelBeeContext } from '@/store/ctx';
import { IMappingImg } from '@/types/data';
import { ImgUtils, PointCloud2DRectOperation } from '@labelbee/lb-annotation';
import { IBasicRect } from '@labelbee/lb-utils';

import { usePointCloudViews } from '../pointCloudView/hooks/usePointCloudViews';
import { PointCloudContext } from '../pointCloudView/PointCloudContext';

interface IPointCloud2DRectOperationViewProps {
  mappingData?: IMappingImg;
  size: {
    width: number;
    height: number;
  };
  config: any;
  checkMode?: boolean;
}

interface IPointCloud2DRectOperationViewRect extends IBasicRect {
  boxID: string;
  id: string;
  attribute: any;
  order?: number;
}

const PointCloud2DRectOperationView = (props: IPointCloud2DRectOperationViewProps) => {
  const { mappingData, size, config, checkMode } = props;
  const url = mappingData?.url ?? '';
  const { pointCloudBoxList, setPointCloudResult, selectedID, setCuboidBoxIn2DView } =
    useContext(PointCloudContext);

  const { update2DViewRect } = usePointCloudViews();
  const ref = React.useRef(null);
  const operation = useRef<any>(null);
  const update2DViewRectFn = useLatest<any>(update2DViewRect);

  const handleUpdateDragResult = (rect: IPointCloud2DRectOperationViewRect) => {
    const results = update2DViewRectFn.current?.(rect);
    setPointCloudResult(results);
  };

  const setRects = () => {
    let allRects: IPointCloud2DRectOperationViewRect[] = [];
    pointCloudBoxList.forEach((pointCloudBox) => {
      const { rects = [], id, attribute, trackID } = pointCloudBox;
      const rect = rects.find((rect) => rect.path === mappingData?.path);
      const rectID = id + '_' + mappingData?.path;
      if (rect) {
        allRects = [...allRects, { ...rect, boxID: id, id: rectID, attribute, order: trackID }];
      }
    });
    operation.current?.setResult(allRects);
  };

  useEffect(() => {
    setCuboidBoxIn2DView?.(false);
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
      });
    }
  }, [url]);

  useEffect(() => {
    operation.current?.setSize(size);
  }, [size]);

  useEffect(() => {
    setRects();
    if (selectedID) {
      const rect = operation.current?.rectList.find(
        (rect: IPointCloud2DRectOperationViewRect) => rect.boxID === selectedID,
      );
      if (rect) {
        operation.current?.setSelectedID(rect.id);
      }
    }
  }, [pointCloudBoxList, selectedID]);

  return <div ref={ref} style={{ position: 'relative' }} />;
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloud2DRectOperationView,
);
