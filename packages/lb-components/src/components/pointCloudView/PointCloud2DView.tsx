import { getClassName } from '@/utils/dom';
import React, { useContext, useEffect, useState } from 'react';
import { PointCloudContainer } from './PointCloudLayout';
import { PointCloudContext } from './PointCloudContext';
import { connect } from 'react-redux';

import { pointCloudLidar2image, cKeyCode, pointListLidar2Img } from '@labelbee/lb-annotation';
import { LabelBeeContext } from '@/store/ctx';
import { a2MapStateToProps, IA2MapStateProps } from '@/store/annotation/map';
import {
  ICalib,
  IPointCloudBox,
  IPolygonPoint,
  toolStyleConverter,
  ICoordinate,
} from '@labelbee/lb-utils';
import PointCloud2DSingleView from './PointCloud2DSingleView';
import TitleButton from './components/TitleButton';
import { LeftOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import EscSvg from '@/assets/annotation/common/icon_esc.svg';
import LeftSquareOutlined from '@/assets/annotation/common/icon_left_squareOutlined.svg';
import RightSquareOutlined from '@/assets/annotation/common/icon_right_squareOutlined.svg';
import { IMappingImg } from '@/types/data';
import { isNumber } from 'lodash';
import { getBoundingRect, isBoundingRectInImage } from '@/utils';

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

interface ITransferViewData {
  type: string;
  pointList: {
    id: string;
    x: number;
    y: number;
  }[];
}

export interface IAnnotationData2dView {
  annotations: IAnnotationDataTemporarily[];
  url: string;
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
  const { topViewInstance, displayPointCloudList, polygonList, imageSizes, selectedIDs } =
    useContext(PointCloudContext);
  const [selectedID, setSelectedID] = useState<number | string>('');
  const [isEnlarge, setIsEnlarge] = useState<boolean>(false);
  const [curIndex, setCurIndex] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (
      !loadPCDFileLoading &&
      topViewInstance &&
      currentData?.mappingImgList &&
      currentData?.mappingImgList?.length > 0
    ) {
      const defaultViewStyle = {
        fill: 'transparent',
        color: 'green',
      };
      let newAnnotations2dList: IAnnotationData2dView[] = [];
      currentData?.mappingImgList.forEach((mappingData: IMappingImg) => {
        const newAnnotations2d: IAnnotationDataTemporarily[] = displayPointCloudList.reduce(
          (acc: IAnnotationDataTemporarily[], pointCloudBox: IPointCloudBox) => {
            /**
             * Is need to create range.
             * 1. pointCloudBox is selected;
             * 2. HighlightAttribute is same with pointCloudBox's attribute.
             */
            const createRange =
              pointCloudBox.id === selectedID || highlightAttribute === pointCloudBox.attribute;
            const { transferViewData: viewDataPointList, viewRangePointList } =
              pointCloudLidar2image(pointCloudBox, mappingData.calib, {
                createRange,
              }) ?? {};

            if (!viewDataPointList || !viewRangePointList) {
              return [];
            }

            const tmpPoints = viewDataPointList.reduce((acc: ICoordinate[], v) => {
              if (v.type === 'line') {
                return [...acc, ...v.pointList];
              }
              return acc;
            }, []);

            const boundingRect = {
              ...getBoundingRect(tmpPoints),
              imageName: mappingData.path,
            };

            const isRectInImage = isBoundingRectInImage(boundingRect, mappingData.path, imageSizes);

            if (!isRectInImage) {
              return acc;
            }

            const stroke = toolStyleConverter.getColorFromConfig(
              { attribute: pointCloudBox.attribute },
              {
                ...config,
                attributeConfigurable: true,
              },
              {},
            )?.stroke;
            const viewDataPointLists = formatViewDataPointList({
              viewDataPointList,
              pointCloudBox,
              defaultViewStyle,
              stroke,
            });
            const newArr = [...acc, ...viewDataPointLists];

            if (viewRangePointList?.length > 0) {
              newArr.unshift({
                type: 'polygon',
                annotation: {
                  id: selectedID,
                  pointList: viewRangePointList,
                  ...defaultViewStyle,
                  stroke,
                  fill: 'rgba(255, 255, 255, 0.6)',
                },
              });
            }

            return newArr;
          },
          [],
        );

        const imageSize = imageSizes[mappingData?.path ?? ''];

        if (imageSize && isNumber(mappingData?.calib?.groundHeight)) {
          polygonList.forEach((polygon) => {
            // eslint-disable-next-line
            const polygonPoints = polygon.pointList.map((v) => ({
              ...v,
              z: mappingData?.calib?.groundHeight,
            }));
            // 上面用isNumber确保z的值是number，但是ts还是报错，所以这里用//@ts-ignore忽略
            // @ts-ignore
            const result = pointListLidar2Img(polygonPoints, mappingData?.calib, imageSize);

            if (result) {
              const polygonColor = toolStyleConverter.getColorFromConfig(
                { attribute: polygon.attribute },
                {
                  ...config,
                  attributeConfigurable: true,
                },
                {},
              );

              newAnnotations2d.push({
                type: 'polygon',
                annotation: {
                  id: polygon.id,
                  pointList: result,
                  ...defaultViewStyle,
                  stroke: polygonColor?.stroke,
                  fill: selectedIDs.includes(polygon.id)
                    ? polygonColor?.fill
                    : 'rgba(255, 255, 255, 0.6)',
                },
              });
            }
          });
        }

        newAnnotations2dList.push({
          annotations: newAnnotations2d,
          url: mappingData?.url,
          calName: mappingData?.calib?.calName,
          calib: mappingData?.calib,
          path: mappingData?.path,
        });
      });
      setAnnotations2d(newAnnotations2dList);
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

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [curIndex]);

  const onKeyDown = (event: KeyboardEvent) => {
    const { keyCode } = event;
    switch (keyCode) {
      case EKeyCode.Esc:
        if (isEnlarge) {
          setIsEnlarge(false);
        }
        break;
      case EKeyCode.Left:
        lastPage();
        break;

      case EKeyCode.Right:
        nextPage();
        break;
    }
  };

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

  const formatViewDataPointList = ({
    viewDataPointList,
    pointCloudBox,
    defaultViewStyle,
    stroke,
  }: {
    viewDataPointList: ITransferViewData[];
    pointCloudBox: IPointCloudBox;
    defaultViewStyle: {
      fill: string;
      color: string;
    };
    stroke: string;
  }) => {
    if (!viewDataPointList) {
      return [];
    }
    return viewDataPointList.map((v: ITransferViewData) => {
      return {
        type: v.type,
        annotation: {
          id: pointCloudBox.id,
          pointList: v.pointList,
          ...defaultViewStyle,
          stroke,
        },
      };
    });
  };
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
