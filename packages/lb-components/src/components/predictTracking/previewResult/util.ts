import { IPointCloudBoxWithIndex } from '@/store/annotation/types';
import { IFileItem } from '@/types/data';
import { jsonParser } from '@/utils';
import { PointCloud, uuid } from '@labelbee/lb-annotation';
import { EPerspectiveView, IPointCloudBox } from '@labelbee/lb-utils';

const EXAMPLE_IMAGE_SIZE = {
  width: 160,
  height: 110,
} as const;

/**
 * Returns a data URL for an image of the rendered point cloud.
 * @param renderer - The PointCloud renderer to use.
 * @param zoom - The zoom level of the image. Defaults to 2.
 * @returns A Promise resolving to a string data URL of the rendered image.
 */
const getDataUrl = async (renderer: PointCloud['renderer'], zoom = 2) => {
  return cropAndEnlarge(
    renderer.domElement,
    EXAMPLE_IMAGE_SIZE.width,
    EXAMPLE_IMAGE_SIZE.height,
    zoom,
  );
};

/**
 * Returns a Promise that resolves after the specified duration.
 * @param ms - The duration to sleep, in milliseconds.
 * @returns A Promise that resolves after `ms` milliseconds.
 */
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

/**
 * Generates data URLs for each view of a given point cloud object using the provided box and zoom level.
 *
 * @param {PointCloud} pointCloud - The point cloud object to generate data URLs for.
 * @param {IBox} box - An object representing the bounding box to use for calculating camera position.
 * @param {number} zoom - The zoom level to use when generating data URLs.
 * @returns {Promise<void>} - A promise that resolves once all data URLs have been generated.
 */
export const getViewsDataUrl = async (pointCloud: PointCloud, box: IBox, zoom: number) => {
  for (const view of views) {
    await pointCloud.updateCameraByBox(box, view);
    box[view] = await getDataUrl(pointCloud.renderer, zoom);
  }
};

/**
 * Creates a new canvas, crops and enlarges an existing canvas, draws the cropped and enlarged image onto the new canvas,
 * and returns the data URL of the new canvas.
 *
 * @param {HTMLCanvasElement} canvas - The original canvas to be cropped and enlarged
 * @param {number} width - The width of the area to be cropped from the center of the original canvas
 * @param {number} height - The height of the area to be cropped from the center of the original canvas
 * @param {number} scale - The amount by which to enlarge the cropped area
 * @returns {string} - A data URL of the cropped and enlarged image
 */
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

/**
 * Retrieve boxes with a specific trackID from an array of file items.
 *
 * @param {Array} imageList - An array of file items to search through.
 * @param {Number} targetStep - The step number within the result object to retrieve boxes from.
 * @param {Number} selectedBoxTrackID - The trackID to match when searching for boxes.
 * @param {string} selectedBoxID - The selected BoxID.
 * @return {Array} An array of point cloud boxes that match the provided trackID, along with their index in the original array.
 */
export const getBoxesByTrackID = (
  imageList: IFileItem[],
  targetStep: number,
  selectedBoxTrackID: number,
  selectedBoxID: string,
) => {
  const matchingBoxes: IPointCloudBoxWithIndex[] = [];
  imageList.some((element, index) => {
    const fileResult = jsonParser(element?.result);
    const stepResult = fileResult?.[`step_${targetStep}`]?.result;
    const box = stepResult?.find((item: IPointCloudBox) => item.trackID === selectedBoxTrackID);
    if (box) {
      matchingBoxes.push({ ...box, index });
    }
    return box?.id === selectedBoxID;
  });

  return matchingBoxes;
};

/**
 * Calculate predicted values for each field in between the start and end points.
 * @param {IPointCloudBoxWithIndex} start - The starting point, should have the same properties as IPointCloudBoxWithIndex.
 * @param {IPointCloudBoxWithIndex} end - The ending point, should have the same properties as IPointCloudBoxWithIndex.
 * @returns {IPointCloudBox[]} An array of objects with the same properties as IPointCloudBox, containing interpolated values between the start and end points for each field.
 */
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
      { ...end, id: uuid(), center: nextCenter },
    );

    result.push(nextValue);
  }

  return result;
};

/**
 * Calculate an array of numbers between the start and end values.
 * @param {number} [start=0] - The starting value. Defaults to 0 if not specified.
 * @param {number} [end=0] - The ending value. Defaults to 0 if not specified.
 * @param {number} [length=0] - The number of values to calculate between the start and end points. Defaults to 0 if not specified.
 * @returns {number[]} An array of numbers, containing interpolated values between the start and end points.
 */
const getInteriorNumbersByStartAndEnd = (start = 0, end = 0, length = 0): number[] => {
  const step = (end - start) / (length + 1);
  const resultArr = new Array(length);
  for (let i = 0; i < length; i++) {
    resultArr[i] = start + step * (i + 1);
  }
  return resultArr;
};
