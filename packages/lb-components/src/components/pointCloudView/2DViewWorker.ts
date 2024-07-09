import type { IAnnotationData2dView, IAnnotationDataTemporarily } from './PointCloud2DView';
import { IMappingImg, IFileItem } from '@/types/data';
import {
  IPointCloudBox,
  toolStyleConverter,
  ICoordinate,
  IPointCloudBoxList,
  ISize,
  IPolygonData,
} from '@labelbee/lb-utils';
import { pointCloudLidar2image, pointListLidar2Img } from '@labelbee/lb-annotation';
import { getBoundingRect, isBoundingRectInImage } from '@/utils';
import { isNumber } from 'lodash';

interface ITransferViewData {
  type: string;
  pointList: {
    id: string;
    x: number;
    y: number;
  }[];
}

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

interface IParams {
  currentData: IFileItem;
  displayPointCloudList: IPointCloudBoxList;
  selectedID: number | string;
  highlightAttribute: string;
  imageSizes: {
    [key: string]: ISize;
  };
  config: any;
  polygonList: IPolygonData[];
  selectedIDs: string[];
}

function annotations2dHandler(params: IParams) {
  const {
    currentData,
    displayPointCloudList,
    selectedID,
    highlightAttribute,
    imageSizes,
    config,
    polygonList,
    selectedIDs,
  } = params;
  const defaultViewStyle = {
    fill: 'transparent',
    color: 'green',
  };
  let newAnnotations2dList: IAnnotationData2dView[] = [];
  currentData?.mappingImgList?.forEach((mappingData: IMappingImg) => {
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
        // eslint-disable-next-line max-nested-callbacks
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
      fallbackUrl: mappingData?.fallbackUrl ?? '',
      calName: mappingData?.calib?.calName,
      calib: mappingData?.calib,
      path: mappingData?.path,
    });
  });
  return newAnnotations2dList;
}

onmessage = (e) => {
  const {
    currentData,
    displayPointCloudList,
    selectedID,
    highlightAttribute,
    imageSizes,
    config,
    polygonList,
    selectedIDs,
  } = e.data;

  const newAnnotations2dList = annotations2dHandler({
    currentData,
    displayPointCloudList,
    selectedID,
    highlightAttribute,
    imageSizes,
    config,
    polygonList,
    selectedIDs,
  });
  postMessage(newAnnotations2dList);
};
