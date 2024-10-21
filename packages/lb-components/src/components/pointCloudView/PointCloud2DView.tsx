import { getClassName } from '@/utils/dom';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { PointCloudContainer } from './PointCloudLayout';
import { PointCloudContext } from './PointCloudContext';
import { connect } from 'react-redux';

import { cKeyCode, EventBus } from '@labelbee/lb-annotation';
import { LabelBeeContext } from '@/store/ctx';
import { a2MapStateToProps, IA2MapStateProps } from '@/store/annotation/map';
import {
  ICalib,
  IPolygonPoint,
} from '@labelbee/lb-utils';
import PointCloud2DSingleView from './PointCloud2DSingleView';
import TitleButton from './components/TitleButton';
import { LeftOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import EscSvg from '@/assets/annotation/common/icon_esc.svg';
import LeftSquareOutlined from '@/assets/annotation/common/icon_left_squareOutlined.svg';
import RightSquareOutlined from '@/assets/annotation/common/icon_right_squareOutlined.svg';
import PointCloud2DViewWorker from 'web-worker:./2DViewWorker.ts';
import { useLatest } from 'ahooks';

// TODO, It will be deleted when the exported type of lb-annotation is work.
export interface IAnnotationDataTemporarily {
  type: string;
  annotation: {
    id: number | string;
    pointList: IPolygonPoint[];
    color: string;
    stroke: string;
    fill: string;
  };
}

export interface IAnnotationData2dView {
  annotations: IAnnotationDataTemporarily[];
  url: string;
  fallbackUrl?: string;
  calName?: string;
  calib?: ICalib;
  path: string;
}

const EKeyCode = cKeyCode.default;

interface IProps extends IA2MapStateProps {
  thumbnailWidth?: number;
  isEnlargeTopView?: boolean;
  checkMode?: boolean;
  measureVisible?: boolean;
}

const ContainerTitle = ({
  showEnlarge,
  isEnlargeTopView,
  data,
  setIsEnlarge,
  setCurIndex,
  curIndex = 0,
  index,
  annotations2d,
}: {
  showEnlarge: boolean;
  isEnlargeTopView?: boolean;
  data: IAnnotationData2dView;
  setIsEnlarge: (v: boolean) => void;
  setCurIndex: (v: number | undefined) => void;
  curIndex: number | undefined;
  index: number;
  annotations2d: IAnnotationData2dView[];
}) => {
  if (isEnlargeTopView) {
    return (
      <TitleButton
        title={data?.calName}
        style={{ background: 'rgba(0, 0, 0, 0.74)', color: '#FFFFFF' }}
      />
    );
  }
  if (showEnlarge) {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <LeftOutlined
          style={{ cursor: 'pointer', marginRight: '12px' }}
          onClick={() => {
            setIsEnlarge(false);
            setCurIndex(undefined);
          }}
        />
        <span>{data?.calName}</span>
        <span style={{ marginLeft: '8px' }}>
          {curIndex + 1}/{annotations2d?.length}
        </span>
      </div>
    );
  }
  return (
    <TitleButton
      title={data?.calName}
      onClick={() => {
        setIsEnlarge(true);
        setCurIndex(index);
      }}
      style={{ background: 'rgba(0, 0, 0, 0.74)', color: '#FFFFFF' }}
    />
  );
};

const PointCloud2DView = ({
  currentData,
  config,
  thumbnailWidth,
  isEnlargeTopView,
  highlightAttribute,
  loadPCDFileLoading,
  checkMode,
  measureVisible,
}: IProps) => {
  const [annotations2d, setAnnotations2d] = useState<IAnnotationData2dView[]>([]);
  const {
    topViewInstance,
    displayPointCloudList,
    polygonList,
    imageSizes,
    selectedIDs,
    windowKeydownListenerHook,
  } = useContext(PointCloudContext);
  const [selectedID, setSelectedID] = useState<number | string>('');
  const [isEnlarge, setIsEnlarge_] = useState<boolean>(false);
  const [curIndex, setCurIndex] = useState<number | undefined>(undefined);

  const setIsEnlarge = useCallback((isEnlarge: boolean) => {
    setIsEnlarge_(isEnlarge)
    EventBus.emit('2d-image:enlarge', isEnlarge)
  }, [])

  const worker = useRef<Worker>()

  useEffect(() => {
    if (
      !loadPCDFileLoading &&
      topViewInstance &&
      currentData?.mappingImgList &&
      currentData?.mappingImgList?.length > 0
    ) {
      if (worker.current) {
        worker.current.terminate()
      }
      worker.current = new PointCloud2DViewWorker() as Worker;
      worker.current.onmessage = (e: any) => {
        const newAnnotations2dList = e.data;
        setAnnotations2d(newAnnotations2dList);
        worker.current?.terminate();
      };
      worker.current.postMessage({
        currentData,
        displayPointCloudList,
        selectedID,
        highlightAttribute,
        imageSizes,
        config,
        polygonList,
        selectedIDs,
      });
      return () => {
        worker.current?.terminate();
      };
    }
  }, [
    displayPointCloudList,
    currentData?.mappingImgList,
    selectedID,
    highlightAttribute,
    loadPCDFileLoading,
    polygonList,
    imageSizes,
    selectedIDs,
  ]);


  /** Keydown events only for `isEnlarge: true` scene  */
  const onKeyDown = useLatest((event: KeyboardEvent) => {
    if (!isEnlarge) {
      return;
    }

    // Abort the sibling and the ancestor events propagation
    const abortSiblingAndAncestorPropagation = () => {
      event.stopImmediatePropagation();
    }

    switch (event.keyCode) {
      case EKeyCode.Esc: {
        setIsEnlarge(false);
        break;
      }

      case EKeyCode.Left: {
        lastPage();
        break;
      }

      case EKeyCode.Right: {
        nextPage();
        break;
      }
    }

    // First, do the switch, then stop sibling and ancestor elements hotkey event
    abortSiblingAndAncestorPropagation();
  });

  const lastPage = () => {
    if (curIndex === undefined || !isEnlarge) {
      return;
    }
    if (Number(curIndex) > 0) {
      setCurIndex(curIndex - 1);
    }
  };

  const nextPage = () => {
    if (curIndex === undefined || !isEnlarge) {
      return;
    }
    if (Number(curIndex) < annotations2d?.length - 1) {
      setCurIndex(curIndex + 1);
    }
  };

  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKeyDown.current(event);
    const dispose = windowKeydownListenerHook.preappendEventListener(listener);
    return dispose;
  }, [windowKeydownListenerHook, windowKeydownListenerHook.preappendEventListener]);

  const hiddenData =
    !currentData || !currentData?.mappingImgList || !(currentData?.mappingImgList?.length > 0);

  const PointCloud2DTitle = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
      }}
    >
      <img
        src={LeftSquareOutlined}
        style={{ height: '24px', marginRight: '8px', cursor: 'pointer' }}
        onClick={() => lastPage()}
      />
      <span style={{ marginRight: '12px' }}>键盘左键上一张</span>
      <span style={{ margin: '0px 8px 0px 12px' }}>键盘右键上一张</span>
      <img
        src={RightSquareOutlined}
        style={{ height: '24px', marginRight: '12px', cursor: 'pointer' }}
        onClick={() => nextPage()}
      />
      <img
        src={EscSvg}
        style={{ height: '24px', margin: '0px 8px 0px 12px', cursor: 'pointer' }}
        onClick={() => {
          setIsEnlarge(false);
          setCurIndex(undefined);
        }}
      />
      <span>键退出</span>
    </div>
  );

  if (annotations2d?.length > 0) {
    return (
      <>
        {annotations2d.map((item: IAnnotationData2dView, index: number) => {
          const showEnlarge = isEnlarge && index === curIndex;
          return (
            <PointCloudContainer
              className={classNames({
                [getClassName('point-cloud-2d-container')]: true,
                [getClassName('point-cloud-container', 'zoom')]: showEnlarge,
              })}
              title={
                <ContainerTitle
                  showEnlarge={showEnlarge}
                  isEnlargeTopView={isEnlargeTopView}
                  data={item}
                  setIsEnlarge={setIsEnlarge}
                  setCurIndex={setCurIndex}
                  curIndex={curIndex}
                  index={index}
                  annotations2d={annotations2d}
                />
              }
              titleOnSurface={!showEnlarge}
              style={{
                display: hiddenData ? 'none' : 'flex',
                width: showEnlarge ? '100%' : thumbnailWidth,
              }}
              key={index}
              toolbar={PointCloud2DTitle}
            >
              {item?.annotations && item?.url && (
                <PointCloud2DSingleView
                  key={item.url}
                  currentData={currentData}
                  view2dData={item}
                  setSelectedID={setSelectedID}
                  showEnlarge={showEnlarge}
                  checkMode={checkMode}
                  measureVisible={measureVisible}
                />
              )}
            </PointCloudContainer>
          );
        })}
      </>
    );
  }
  return null;
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloud2DView,
);