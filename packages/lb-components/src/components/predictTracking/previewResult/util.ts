import { IPointCloudBoxWithIndex } from '@/store/annotation/types';
import { IFileItem } from '@/types/data';
import { jsonParser } from '@/utils';
import { PointCloud, uuid } from '@labelbee/lb-annotation';
import { EPerspectiveView, IPointCloudBox } from '@labelbee/lb-utils';

const getDataUrl = async (renderer: PointCloud['renderer'], zoom = 2) => {
  return cropAndEnlarge(renderer.domElement, 160, 110, zoom);
};

export const sleep = (time = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('');
    }, time);
  });
};

export const views = [EPerspectiveView.Top, EPerspectiveView.Left, EPerspectiveView.Back] as const;

interface viewDataUrl {
  [EPerspectiveView.Top]?: string;
  [EPerspectiveView.Left]?: string;
  [EPerspectiveView.Back]?: string;
}

export type IBox = IPointCloudBoxWithIndex & viewDataUrl;

export const getViewsDataUrl = async (pointCloud: PointCloud, box: IBox, zoom: number) => {
  for (const view of views) {
    await pointCloud.updateCameraByBox(box, view);
    box[view] = await getDataUrl(pointCloud.renderer, zoom);
  }
};

const cropAndEnlarge = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  scale: number,
): string => {
  if (!canvas) {
    return '';
  }
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  // Calculate starting coordinates for cropping
  const sx = centerX - width / 2;
  const sy = centerY - height / 2;

  // Create a new canvas for the cropped and enlarged image
  const newCanvas = document.createElement('canvas');
  newCanvas.width = width * scale;
  newCanvas.height = height * scale;

  // Draw the cropped and enlarged image onto the new canvas
  const newCtx = newCanvas.getContext('2d');
  newCtx?.drawImage(canvas, sx, sy, width, height, 0, 0, width * scale, height * scale);

  // Convert the new canvas to a data URL and return it
  return newCanvas.toDataURL();
};

export const getBoxesByTrackID = (
  imageList: IFileItem[],
  targetStep: number,
  selectedBoxTrackID: number,
) => {
  const matchingBoxes: IPointCloudBoxWithIndex[] = [];
  imageList.forEach((element, index) => {
    const fileResult = jsonParser(element?.result);
    const stepResult = fileResult?.[`step_${targetStep}`]?.result;
    const box = stepResult?.find((item: IPointCloudBox) => item.trackID === selectedBoxTrackID);
    if (box) {
      matchingBoxes.push({ ...box, index });
    }
  });

  return matchingBoxes;
};

export const predict = (start: IPointCloudBoxWithIndex, end: IPointCloudBoxWithIndex) => {
  const diff = end.index - start.index;
  const len = diff - 1;
  const result: IPointCloudBox[] = [];
  const map: { [key: string]: number[] } = {};
  const centerKeys = ['x', 'y', 'z'] as const;
  const predictKeys = ['center', 'depth', 'height', 'index', 'rotation', 'width'] as const;

  centerKeys.forEach((key) => {
    map[key] = getInteriorNumbersByStartAndEnd(start.center[key], end.center[key], len);
  });

  predictKeys.forEach((key) => {
    if (key === 'center') {
      return;
    }
    map[key] = getInteriorNumbersByStartAndEnd(start[key], end[key], len);
  });

  for (let i = 0; i < len; i++) {
    const nextCenter = centerKeys.reduce(
      (acc, key) => {
        acc[key] = map[key][i];
        return acc;
      },
      { x: 0, y: 0, z: 0 },
    );

    const nextValue = predictKeys.reduce(
      (acc, key) => {
        if (key === 'center') {
          return acc;
        }
        acc[key] = map[key][i];
        return acc;
      },
      { ...start, id: uuid(), center: nextCenter },
    );

    result.push(nextValue);
  }

  return result;
};

const getInteriorNumbersByStartAndEnd = (start = 0, end = 0, length = 0): number[] => {
  const step = (end - start) / (length + 1);
  const resultArr = new Array(length);
  for (let i = 0; i < length; i++) {
    resultArr[i] = start + step * (i + 1);
  }
  return resultArr;
};
