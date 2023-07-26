import React, { useContext, useEffect, useRef } from 'react';
import { connect } from 'react-redux';

import { a2MapStateToProps } from '@/store/annotation/map';
import { LabelBeeContext } from '@/store/ctx';
import { ImgUtils, Rect2DOperation, uuid } from '@labelbee/lb-annotation';
import { IBasicRect } from '@labelbee/lb-utils';

import { usePointCloudViews } from '../pointCloudView/hooks/usePointCloudViews';
import { PointCloudContext } from '../pointCloudView/PointCloudContext';

interface IRect2DOperationViewProps {
  mappingData?: any;
  size: {
    width: number;
    height: number;
  };
  config: any;
  checkMode?: boolean;
}

interface IRect2DOperationViewRect extends IBasicRect {
  boxID: string;
  id: string;
  attribute: any;
  order?: number;
}

const Rect2DOperationView = (props: IRect2DOperationViewProps) => {
  const { mappingData = {}, size, config, checkMode } = props;
  const { url } = mappingData;
  const { pointCloudBoxList, setPointCloudResult, selectedID, setCuboidBoxIn2DView } =
    useContext(PointCloudContext);

  const { update2DViewRect } = usePointCloudViews();
  const ref = React.useRef(null);
  const operation = useRef<any>(null);
  const currentFn = useRef<any>(null);

  const handleUpdateDragResult = (rect: IRect2DOperationViewRect) => {
    const results = currentFn.current?.(rect);
    setPointCloudResult(results);
  };

  useEffect(() => {
    currentFn.current = update2DViewRect;
  }, [update2DViewRect]);

  const setRects = () => {
    let allRects: IRect2DOperationViewRect[] = [];
    pointCloudBoxList.forEach((pointCloudBox) => {
      const { rects = [], id, attribute, trackID } = pointCloudBox;
      const rect = rects.find((rect) => rect.imageName === mappingData.url);
      if (rect) {
        allRects = [...allRects, { ...rect, boxID: id, id: uuid(), attribute, order: trackID }];
      }
    });
    operation.current?.setResult(allRects);
  };

  useEffect(() => {
    setCuboidBoxIn2DView?.(false);
    if (ref.current) {
      const toolInstance = new Rect2DOperation({
        container: ref.current,
        size,
        config: { ...config, isShowOrder: true, attributeConfigurable: true },
        checkMode,
      });

      operation.current = toolInstance;
      operation.current.init();
      operation.current.on('updateDragResult', handleUpdateDragResult);

      return () => {
        operation.current?.unbindAll('updateDragResult');
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
        (rect: IRect2DOperationViewRect) => rect.boxID === selectedID,
      );
      if (rect) {
        operation.current?.setSelectedID(rect.id);
      }
    }
  }, [pointCloudBoxList, selectedID]);

  return <div ref={ref} style={{ position: 'relative' }} />;
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(
  Rect2DOperationView,
);
