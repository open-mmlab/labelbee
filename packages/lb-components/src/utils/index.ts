import _ from 'lodash';

import { pointCloudLidar2image } from '@labelbee/lb-annotation';
import { IBasicRect, ICoordinate, IPointCloudBox, ISize } from '@labelbee/lb-utils';
import { IMappingImg } from '@/types/data';

export const jsonParser = (content: any, defaultValue: any = {}) => {
  try {
    if (typeof content === 'string') {
      return JSON.parse(content);
    }
    return _.isObject(content) ? content : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export const getNewNode = <T>(newNode: T, oldNode: T): T => {
  return newNode || _.isNull(newNode) ? newNode : oldNode;
};

export const classnames = (className: { [key: string]: boolean } | (string | undefined)[]) => {
  if (Array.isArray(className)) {
    return className.filter((i) => i).join(' ');
  }

  if (_.isObject(className)) {
    const classArray: string[] = [];
    Object.keys(className).forEach((key) => {
      if (className[key]) {
        classArray.push(key);
      }
    });

    return classArray.join(' ');
  }

  return '';
};

export const getBoundingRect = (points: ICoordinate[]) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const isBoundingRectInImage = (() => {
  type IRect = Omit<IBasicRect, 'id'>;

  const getIntersection = (rect1: IRect, rect2: IRect) => {
    const left = Math.max(rect1.x, rect2.x);
    const top = Math.max(rect1.y, rect2.y);
    const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
    const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);
    const width = right - left;
    const height = bottom - top;
    return width >= 0 && height >= 0 ? { x: left, y: top, width, height } : null;
  };

  return (
    boundingRect: IRect,
    path: string,
    imageSizes: {
      [key: string]: ISize;
    },
  ) => {
    if (imageSizes[path]) {
      const imgWidth = imageSizes[path].width;
      const imgHeight = imageSizes[path].height;
      const imgRect = { x: 0, y: 0, width: imgWidth, height: imgHeight };
      const intersection = getIntersection(boundingRect, imgRect);
      return intersection !== null;
    }
    return false;
  };
})();

interface IGetRectPointCloudBoxParams {
  pointCloudBox: IPointCloudBox;
  mappingData: IMappingImg;
  imageSizes: {
    [key: string]: ISize;
  };
}

export const getRectPointCloudBox = (params: IGetRectPointCloudBoxParams) => {
  const { pointCloudBox, mappingData, imageSizes } = params;
  // 需要新建一个Rect
  const { transferViewData: viewDataPointList } =
    pointCloudLidar2image(pointCloudBox, mappingData.calib) ?? {};

  if (!viewDataPointList) {
    return;
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

  if (isRectInImage) return boundingRect;
};
