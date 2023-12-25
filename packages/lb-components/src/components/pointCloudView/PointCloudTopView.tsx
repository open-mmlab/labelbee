/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-22 11:08:31
 * @LastEditors: Laoluo luozefeng@sensetime.com
 */
import { getClassName } from '@/utils/dom';
import { FooterDivider } from '@/views/MainView/toolFooter';
import { ZoomController } from '@/views/MainView/toolFooter/ZoomController';
import { DownSquareOutlined, UpSquareOutlined, LeftOutlined } from '@ant-design/icons';
import {
  cTool,
  cAnnotation,
  PointCloudAnnotation,
  THybridToolName,
  cKeyCode,
} from '@labelbee/lb-annotation';
import {
  IPolygonData,
  PointCloudUtils,
  UpdatePolygonByDragList,
  IPointUnit,
  ILine,
} from '@labelbee/lb-utils';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PointCloudContext } from './PointCloudContext';
import { useRotate } from './hooks/useRotate';
import { useSingleBox } from './hooks/useSingleBox';
import { PointCloudContainer } from './PointCloudLayout';
import { BoxInfos, PointCloudValidity } from './PointCloudInfos';
import { usePolygon } from './hooks/usePolygon';
import { useSphere } from './hooks/useSphere';
import { useZoom } from './hooks/useZoom';
import { Slider } from 'antd';
import { a2MapStateToProps, IA2MapStateProps, IAnnotationStateProps } from '@/store/annotation/map';
import { connect } from 'react-redux';
import { usePointCloudViews } from './hooks/usePointCloudViews';
import useSize from '@/hooks/useSize';
import { useTranslation } from 'react-i18next';
import { LabelBeeContext } from '@/store/ctx';
import { jsonParser } from '@/utils';
import { DrawLayerSlot } from '@/types/main';
import ToolUtils from '@/utils/ToolUtils';
import _ from 'lodash';
import PointCloudSizeSlider from './components/PointCloudSizeSlider';
import { useHistory } from './hooks/useHistory';
import TitleButton from './components/TitleButton';

const { EPolygonPattern, EToolName } = cTool;
const { ESortDirection } = cAnnotation;
const EKeyCode = cKeyCode.default;

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
  const { zoom, zoomIn, zoomOut, initialPosition } = useZoom();
  const { selectNextBox, selectPrevBox } = useSingleBox();
  const { switchToNextSphere } = useSphere();
  const { updateRotate } = useRotate({ currentData });
  const ptCtx = React.useContext(PointCloudContext);
  const { topViewInstance } = ptCtx;

  const currentToolName = ptCtx?.topViewInstance?.toolScheduler?.getCurrentToolName();

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
      <PointCloudSizeSlider
        onChange={(v: number) => {
          topViewInstance?.pointCloudInstance?.updatePointSize({ customSize: v });
        }}
      />
      <span
        onClick={anticlockwiseRotate}
        className={getClassName('point-cloud', 'rotate-reserve')}
      />
      <span onClick={clockwiseRotate} className={getClassName('point-cloud', 'rotate')} />
      <span onClick={reverseRotate} className={getClassName('point-cloud', 'rotate-180')} />
      <FooterDivider />
      <UpSquareOutlined
        onClick={() => {
          if (currentToolName === EToolName.Point) {
            switchToNextSphere(ESortDirection.descend);
            return;
          }
          selectPrevBox(true);
        }}
        className={getClassName('point-cloud', 'prev')}
      />
      <DownSquareOutlined
        onClick={() => {
          if (currentToolName === EToolName.Point) {
            switchToNextSphere(ESortDirection.ascend);
            return;
          }
          selectNextBox(true);
        }}
        className={getClassName('point-cloud', 'next')}
      />
      <FooterDivider />
      <ZoomController
        initialPosition={initialPosition}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        zoom={zoom}
      />
    </>
  );
};

/**
 * Slider for filtering Z-axis points
 */
const ZAxisSlider = ({
  setZAxisLimit,
  zAxisLimit,
  checkMode,
}: {
  setZAxisLimit: (value: number) => void;
  zAxisLimit: number;
  checkMode?: boolean;
}) => {
  if (checkMode) {
    return null;
  }

  return (
    <div style={{ position: 'absolute', top: 128, right: 8, height: '50%', zIndex: 20 }}>
      <Slider
        vertical
        step={0.5}
        max={10}
        min={0.5}
        defaultValue={zAxisLimit}
        onAfterChange={(v: number) => {
          setZAxisLimit(v);
        }}
      />
    </div>
  );
};

interface IProps extends IA2MapStateProps {
  drawLayerSlot?: DrawLayerSlot;
  checkMode?: boolean;
  intelligentFit?: boolean;
  setIsEnlargeTopView: (value: boolean) => void;
  isEnlargeTopView: boolean;
  onExitZoom: () => void;
}

const PointCloudTopView: React.FC<IProps> = ({
  currentData,
  imgList,
  stepInfo,
  drawLayerSlot,
  checkMode,
  intelligentFit,
  setIsEnlargeTopView,
  isEnlargeTopView,
  onExitZoom,
  highlightAttribute,
}) => {
  const [annotationPos, setAnnotationPos] = useState({ zoom: 1, currentPos: { x: 0, y: 0 } });
  const ref = useRef<HTMLDivElement>(null);
  const ptCtx = React.useContext(PointCloudContext);
  const size = useSize(ref);
  const config = jsonParser(stepInfo.config);
  const { setZoom, syncTopviewToolZoom } = useZoom();
  const { hideAttributes } = ptCtx;

  const { addPolygon, deletePolygon } = usePolygon();
  const { deletePointCloudSphere } = useSphere();
  const { deletePointCloudBox, changeValidByID } = useSingleBox();
  const [zAxisLimit, setZAxisLimit] = useState<number>(10);
  const { t } = useTranslation();
  const pointCloudViews = usePointCloudViews();
  const { pushHistoryWithList } = useHistory();

  useLayoutEffect(() => {
    if (ptCtx.topViewInstance) {
      return;
    }

    if (ref.current && currentData?.url && currentData?.result) {
      const size = {
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
      };

      const pointCloudAnnotation = new PointCloudAnnotation({
        container: ref.current,
        size,
        pcdPath: currentData.url,
        config: { ...config, pointCloudPattern: ptCtx.pointCloudPattern },
        checkMode,
        toolName: ToolUtils.getPointCloudToolList() as THybridToolName,
        proxyMode: checkMode,
      });
      ptCtx.setTopViewInstance(pointCloudAnnotation);
    }
  }, [currentData]);

  useEffect(() => {
    if (!size || !ptCtx.topViewInstance || !ptCtx.sideViewInstance) {
      return;
    }

    const { toolInstance: TopView2dOperation } = ptCtx.topViewInstance;

    // line register
    TopView2dOperation.singleOn('dataUpdated', (updateLine: ILine[], selectedIDs: string[]) => {
      const transferLine = _.cloneDeep(updateLine).map((i) => {
        return {
          ...i,
          pointList: PointCloudUtils.pointListTransferCanvas2World(i.pointList, size),
        };
      });
      ptCtx.setSelectedIDs(selectedIDs);
      ptCtx.setLineList(transferLine);
      pushHistoryWithList({ lineList: transferLine });
    });

    // point tool events
    TopView2dOperation.singleOn('pointCreated', (point: IPointUnit, zoom: number) => {
      // addPoint(point)
      pointCloudViews.topViewAddSphere({
        newPoint: point,
        size,
        trackConfigurable: config.trackConfigurable,
        zoom,
      });
    });

    TopView2dOperation.singleOn('pointDeleted', (selectedID: string) => {
      deletePointCloudSphere(selectedID);
    });
    TopView2dOperation.singleOn('pointSelected', (selectedID: string) => {
      ptCtx.setSelectedIDs([selectedID]);
    });
    TopView2dOperation.singleOn(
      'updatePointByDrag',
      (updatePoint: IPointUnit, oldList: IPointUnit[]) => {
        pointCloudViews.topViewUpdatePoint?.(updatePoint, size);
      },
    );

    TopView2dOperation.singleOn('polygonCreated', (polygon: IPolygonData, zoom: number) => {
      if (TopView2dOperation.pattern === EPolygonPattern.Normal || !currentData?.url) {
        /**
         * Notice. The Polygon need to be converted to pointCloud coordinate system for storage.
         */
        const newPolygon = {
          ...polygon,
          pointList: polygon.pointList.map((v) => PointCloudUtils.transferCanvas2World(v, size)),
        };

        addPolygon(newPolygon);
        ptCtx.setSelectedIDs(hideAttributes.includes(polygon.attribute) ? '' : polygon.id);
        return;
      }

      pointCloudViews.topViewAddBox({
        polygon,
        size,
        imgList,
        trackConfigurable: config.trackConfigurable,
        zoom,
        intelligentFit,
      });
    });

    TopView2dOperation.singleOn('deletedObject', ({ id }: { id: any }) => {
      deletePointCloudBox(id);
      deletePolygon(id);
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

    TopView2dOperation.singleOn('updatePolygonByDrag', (updateList: UpdatePolygonByDragList) => {
      pointCloudViews.topViewUpdateBox?.(updateList, size);
    });

    const validUpdate = (id: string) => {
      // UpdateData.
      const newPointCloudList = changeValidByID(id);

      // HighLight
      if (newPointCloudList) {
        ptCtx.syncAllViewPointCloudColor(newPointCloudList);
      }
      if (ptCtx.polygonList.find((v) => v.id === id)) {
        ptCtx.topViewInstance?.toolInstance.setPolygonValidAndRender(id, true);
      }
    };

    TopView2dOperation.on('validUpdate', validUpdate);

    return () => {
      TopView2dOperation.unbind('validUpdate', validUpdate);
    };
  }, [
    ptCtx,
    size,
    currentData,
    pointCloudViews,
    ptCtx.polygonList,
    ptCtx.lineList,
    ptCtx.topViewInstance?.toolInstance,
  ]);

  useEffect(() => {
    if (!size?.width || !ptCtx.topViewInstance) {
      return;
    }
    /**
     * Init Config
     *
     * 1. Update defaultAttribute by first attribute;
     *  */
    const defaultAttribute = config?.attributeList?.[0]?.value;
    if (defaultAttribute) {
      ptCtx.topViewInstance.toolInstance.setDefaultAttribute(defaultAttribute);
    }

    // 1. Update Size
    ptCtx.topViewInstance.initSize(size);
    ptCtx.topViewInstance.updatePolygonList(ptCtx.displayPointCloudList, ptCtx.polygonList);
    ptCtx.topViewInstance.updatePointList(ptCtx.displaySphereList);
    ptCtx.topViewInstance.updateLineList(ptCtx.displayLineList);

    const {
      topViewInstance: { pointCloudInstance: pointCloud, toolInstance },
    } = ptCtx;

    /**
     * Synchronized 3d point cloud view displacement operations
     *
     * Change Orthographic Camera size
     */
    toolInstance.singleOn('renderZoom', (zoom: number, currentPos: any) => {
      const { offsetX, offsetY } = TransferCanvas2WorldOffset(currentPos, size, zoom);
      pointCloud.camera.zoom = zoom;
      if (currentPos) {
        const { x, y, z } = pointCloud.initCameraPosition;
        pointCloud.camera.position.set(x + offsetY, y - offsetX, z);
      }

      pointCloud.camera.updateProjectionMatrix();
      pointCloud.render();

      setZoom(zoom);
      syncTopviewToolZoom(currentPos, zoom, size);
      setAnnotationPos({ zoom, currentPos });
    });

    // Synchronized 3d point cloud view displacement operations
    toolInstance.singleOn('dragMove', ({ currentPos, zoom }: any) => {
      const { offsetX, offsetY } = TransferCanvas2WorldOffset(currentPos, size, zoom);
      pointCloud.camera.zoom = zoom;
      const { x, y, z } = pointCloud.initCameraPosition;
      pointCloud.camera.position.set(x + offsetY, y - offsetX, z);
      pointCloud.render();
      syncTopviewToolZoom(currentPos, zoom, size);
      setAnnotationPos({ zoom, currentPos });
    });
  }, [size, ptCtx.topViewInstance, ptCtx.topViewInstance?.toolInstance]);

  useEffect(() => {
    ptCtx.topViewInstance?.pointCloudInstance?.applyZAxisPoints(zAxisLimit);
  }, [zAxisLimit]);

  useEffect(() => {
    pointCloudViews.topViewSelectedChanged({});
  }, [ptCtx.selectedIDs]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const onKeyDown = (event: KeyboardEvent) => {
    const { keyCode } = event;
    if (keyCode === EKeyCode.Esc) {
      onExitZoom();
    }
  };
  // Highlight TopView Box when `hightAttribute` updated.
  useEffect(() => {
    ptCtx.topViewInstance?.pointCloud2dOperation?.setHighlightAttribute?.(highlightAttribute);
  }, [ptCtx.topViewInstance, highlightAttribute]);

  return (
    <PointCloudContainer
      className={getClassName('point-cloud-container', 'top-view')}
      title={
        isEnlargeTopView ? (
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <LeftOutlined
              style={{ cursor: 'pointer', marginRight: '12px' }}
              onClick={() => {
                onExitZoom();
              }}
            />
            <span>{t('TopView')}</span>

            <BoxInfos
              checkMode={checkMode}
              config={config}
              style={{ display: 'flex', position: 'initial', margin: '0px 20px' }}
            />
          </div>
        ) : (
          <TitleButton
            title={t('TopView')}
            onClick={() => {
              setIsEnlargeTopView(true);
            }}
          />
        )
      }
      toolbar={<TopViewToolbar currentData={currentData} />}
    >
      <div style={{ position: 'relative', flex: 1 }}>
        <div style={{ width: '100%', height: '100%' }} ref={ref}>
          {drawLayerSlot?.(annotationPos)}
        </div>

        {!isEnlargeTopView && <BoxInfos checkMode={checkMode} config={config} />}
        <ZAxisSlider checkMode={checkMode} zAxisLimit={zAxisLimit} setZAxisLimit={setZAxisLimit} />
        <PointCloudValidity />
      </div>
    </PointCloudContainer>
  );
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloudTopView,
);
