/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-22 11:08:31
 * @LastEditors: Laoluo luozefeng@sensetime.com
 */
import { getClassName } from '@/utils/dom';
import { FooterDivider } from '@/views/MainView/toolFooter';
import { ZoomController } from '@/views/MainView/toolFooter/ZoomController';
import { DownSquareOutlined, UpSquareOutlined } from '@ant-design/icons';
import { cTool, PointCloud, PointCloudAnnotation } from '@labelbee/lb-annotation';
import React, { useEffect, useRef, useState } from 'react';
import { PointCloudContext } from './PointCloudContext';
import { useRotate } from "./hooks/useRotate";
import { useSingleBox } from "./hooks/useSingleBox";
import { PointCloudContainer } from './PointCloudLayout';
import { BoxInfos, PointCloudValidity } from './PointCloudInfos';
import { Slider } from 'antd';
import { aMapStateToProps, IAnnotationStateProps } from '@/store/annotation/map';
import { connect } from 'react-redux';
import { usePointCloudViews } from './hooks/usePointCloudViews';

const { EPolygonPattern } = cTool;
const DEFAULT_SCOPE = 5;

/**
 * Get the offset from canvas2d-coordinate to world coordinate (Top View)
 * @param currentPos
 * @param size
 * @param zoom
 * @returns
 */
const TransferCanvas2WorldOffset = (
  currentPos: { x: number; y: number },
  size: { width: number; height: number },
  zoom = 1,
) => {
  const { width: w, height: h } = size;

  const canvasCenterPoint = {
    x: currentPos.x + (w * zoom) / 2,
    y: currentPos.y + (h * zoom) / 2,
  };

  const worldCenterPoint = {
    x: size.width / 2,
    y: size.height / 2,
  };

  return {
    offsetX: (worldCenterPoint.x - canvasCenterPoint.x) / zoom,
    offsetY: -(worldCenterPoint.y - canvasCenterPoint.y) / zoom,
  };
};

const TopViewToolbar = ({ currentData }: IAnnotationStateProps) => {
  const { selectNextBox, selectPrevBox } = useSingleBox();
  const { updateRotate } = useRotate({ currentData });
  const ratio = 2;

  const clockwiseRotate = () => {
    updateRotate(-ratio);
  };
  const anticlockwiseRotate = () => {
    updateRotate(ratio);
  };

  const reverseRotate = () => {
    updateRotate(180);
  };

  return (
    <>
      <span
        onClick={anticlockwiseRotate}
        className={getClassName('point-cloud', 'rotate-reserve')}
      />
      <span onClick={clockwiseRotate} className={getClassName('point-cloud', 'rotate')} />
      <span onClick={reverseRotate} className={getClassName('point-cloud', 'rotate-180')} />
      <FooterDivider />
      <UpSquareOutlined
        onClick={() => {
          selectPrevBox();
        }}
        className={getClassName('point-cloud', 'prev')}
      />
      <DownSquareOutlined
        onClick={() => {
          selectNextBox();
        }}
        className={getClassName('point-cloud', 'next')}
      />
      <FooterDivider />
      <ZoomController />
    </>
  );
};

/**
 * Slider for filtering Z-axis points
 */
const ZAxisSlider = ({
  setZAxisLimit,
  zAxisLimit,
}: {
  setZAxisLimit: (value: number) => void;
  zAxisLimit: number;
}) => {
  return (
    <div style={{ position: 'absolute', top: 128, right: 8, height: '50%', zIndex: 20 }}>
      <Slider
        vertical
        step={0.5}
        max={10}
        min={0.5}
        defaultValue={zAxisLimit}
        onAfterChange={(v) => {
          setZAxisLimit(v);
        }}
      />
    </div>
  );
};

const PointCloudTopView: React.FC<IAnnotationStateProps> = ({ currentData }) => {
  const ref = useRef<HTMLDivElement>(null);
  const ptCtx = React.useContext(PointCloudContext);
  const pointCloudRef = useRef<PointCloud | null>();

  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const pointCloudViews = usePointCloudViews();

  useEffect(() => {
    if (ref.current && currentData?.url && currentData?.result) {
      const size = {
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
      };

      if (ptCtx.topViewInstance) {
        /**
         * Listen to flip
         * 1. Init
         * 2. Reload PointCloud
         * 3. Clear Polygon
         */
        ptCtx.topViewInstance.updateData(currentData.url, currentData.result);
        return;
      }

      const pointCloudAnnotation = new PointCloudAnnotation({
        container: ref.current,
        size,
        pcdPath: currentData.url,
      });
      pointCloudAnnotation.addPolygonListOnTopView(currentData.result);

      ptCtx.setTopViewInstance(pointCloudAnnotation);

      const pointCloud = pointCloudAnnotation.pointCloudInstance;
      const polygonOperation = pointCloudAnnotation.pointCloud2dOperation;

      pointCloudRef.current = pointCloud;

      /**
       * Synchronized 3d point cloud view displacement operations
       *
       * Change Orthographic Camera size
       */
      polygonOperation.singleOn('renderZoom', (zoom: number, currentPos: any) => {
        const { offsetX, offsetY } = TransferCanvas2WorldOffset(currentPos, size, zoom);
        pointCloud.camera.zoom = zoom;
        if (currentPos) {
          const { x, y, z } = pointCloud.initCameraPosition;
          pointCloud.camera.position.set(x + offsetY, y - offsetX, z);
        }

        pointCloud.camera.updateProjectionMatrix();
        pointCloud.render();
      });

      // Synchronized 3d point cloud view displacement operations
      polygonOperation.singleOn('dragMove', ({ currentPos, zoom }) => {
        const { offsetX, offsetY } = TransferCanvas2WorldOffset(currentPos, size, zoom);
        pointCloud.camera.zoom = zoom;
        const { x, y, z } = pointCloud.initCameraPosition;
        pointCloud.camera.position.set(x + offsetY, y - offsetX, z);
        pointCloud.render();
      });

      setSize(size);
    }
  }, [currentData]);

  useEffect(() => {
    if (!size || !ptCtx.topViewInstance || !ptCtx.sideViewInstance) {
      return;
    }

    const { pointCloud2dOperation: TopView2dOperation } = ptCtx.topViewInstance;

    TopView2dOperation.singleOn('polygonCreated', (polygon: any) => {
      if (TopView2dOperation.pattern === EPolygonPattern.Normal || !currentData?.url) {
        return;
      }

      pointCloudViews.topViewAddBox(polygon, size);
    });

    TopView2dOperation.singleOn('deleteSelectedIDs', () => {
      ptCtx.setSelectedIDs([]);
    });

    TopView2dOperation.singleOn('addSelectedIDs', (selectedID: string) => {
      ptCtx.addSelectedID(selectedID);
    });

    TopView2dOperation.singleOn('setSelectedIDs', (selectedIDs: string[]) => {
      ptCtx.setSelectedIDs(selectedIDs);
    });

    TopView2dOperation.singleOn('updatePolygonByDrag', ({ newPolygon }: any) => {
      pointCloudViews.topViewUpdateBox?.(newPolygon, size);
    });
  }, [ptCtx, size, currentData, pointCloudViews]);

  useEffect(() => {
    if (pointCloudRef.current) {
      pointCloudRef.current.applyZAxisPoints(zAxisLimit);
    }
  }, [zAxisLimit]);

  useEffect(() => {
    pointCloudViews.topViewSelectedChanged();
  }, [ptCtx.selectedIDs]);

  return (
    <PointCloudContainer
      className={getClassName('point-cloud-container', 'top-view')}
      title='俯视图'
      toolbar={<TopViewToolbar currentData={currentData} />}
    >
      <div style={{ position: 'relative', flex: 1 }}>
        <div style={{ width: '100%', height: '100%' }} ref={ref} />

        <BoxInfos />
        <ZAxisSlider zAxisLimit={ptCtx.zAxisLimit} setZAxisLimit={ptCtx.setZAxisLimit} />
        <PointCloudValidity />
      </div>
    </PointCloudContainer>
  );
};

export default connect(aMapStateToProps)(PointCloudTopView);
