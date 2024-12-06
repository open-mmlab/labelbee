/*
 * Created Date: Thursday, June 20th 2024, 5:35:38 pm
 * Author: hexing<hexing@senseauto.com>
 * @param {IPointCloudBox[]} newList
 * @param {IPointCloudBox[]} oldList
 * return { resetAreas: ICoordinate[][], modifiedBoxIds: string[]  }
 * background info:
 * The origin of the point cloud coordinate is the center, up is the positive direction of x, left is the positive direction of y, and z is the height
 * rotation is a decimal, which represents some π, firstly get the remainder with π, clockwise,
 * if it is 360 degrees in a circle: 0 degrees is π, 90 degrees is 0.5 π, 180 degrees is 0, 270 degrees is -0.5 π
 */
import { ICoordinate, IPointCloudBox } from '@labelbee/lb-utils';
import { getCuboidFromPointCloudBox } from '@labelbee/lb-annotation';
import { isEqual } from 'lodash';

export enum EPointCloudBoxRenderTrigger {
  Default = 'Default',
  UndoRedo = 'UndoRedo',
  ClearAll = 'ClearAll',
  Single = 'Single',
  SingleDelete = 'SingleDelete',
  SingleToggleValid = 'SingleToggleValid',
  SingleRotate = 'SingleRotate',
  MultiPaste = 'MultiPaste',
  MultiMove = 'MultiMove',
  MulitSelect = 'MulitSelect',
}

export enum EPointCloudBoxSingleModifiedType {
  ChangeAttribute = 'ChangeAttribute', // Do not calculate oldBox intersection
  Move = 'Move',
  ChangeDepth = 'ChangeDepth', // Do not calculate oldBox intersection
  ChangeSize = 'ChangeSize',
  ToggleValid = 'ToggleValid', // Do not calculate oldBox intersection
}

const checkRectanglesIntersect = (
  rect1: { x: number; y: number }[],
  rect2: { x: number; y: number }[],
): boolean => {
  const axes = getAxes(rect1).concat(getAxes(rect2));
  for (const axis of axes) {
    const projection1 = projectRectangle(rect1, axis);
    const projection2 = projectRectangle(rect2, axis);
    if (!projectionsOverlap(projection1, projection2)) {
      return false; // Found a separating axis, so rectangles do not intersect
    }
  }
  return true; // Projections on all axes overlap, rectangles intersect
};

const getAxes = (rect: { x: number; y: number }[]): { x: number; y: number }[] => {
  const axes: any = [];
  for (let i = 0; i < rect.length; i++) {
    const p1 = rect[i];
    const p2 = rect[(i + 1) % rect.length];
    const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
    const normal = { x: -edge.y, y: edge.x };
    axes.push(normal);
  }
  return axes;
};

const projectRectangle = (
  rect: { x: number; y: number }[],
  axis: { x: number; y: number },
): { min: number; max: number } => {
  let min = dotProduct(rect[0], axis);
  let max = min;
  for (const point of rect) {
    const projection = dotProduct(point, axis);
    if (projection < min) min = projection;
    if (projection > max) max = projection;
  }
  return { min, max };
};

const projectionsOverlap = (
  projection1: { min: number; max: number },
  projection2: { min: number; max: number },
): boolean => {
  return !(projection1.max < projection2.min || projection2.max < projection1.min);
};

const dotProduct = (point: { x: number; y: number }, axis: { x: number; y: number }): number => {
  return point.x * axis.x + point.y * axis.y;
};

/**
 * Given an IPointCloudBox and an array of other IPointCloudBox[],
 * returns the ids of IPointCloudBox[] that intersect with the IPointCloudBox,
 * based on their center.x, center.y, width, height, and rotation to draw rectangles.
 */
const getIntersectingBoxIds = (rect: ICoordinate[], boxList: IPointCloudBox[]): string[] => {
  const res: string[] = [];
  boxList.forEach((item) => {
    const { polygonPointList } = getCuboidFromPointCloudBox(item);
    if (checkRectanglesIntersect(rect, polygonPointList)) {
      res.push(item.id);
    }
  });
  return res;
};

const getAddBoxId = (newList: IPointCloudBox[], oldList: IPointCloudBox[]): string => {
  const newIds = newList.map((item) => item.id);
  const oldIds = oldList.map((item) => item.id);
  return newIds.find((id) => !oldIds.includes(id)) || '';
};

const getDeletedBox = (
  newList: IPointCloudBox[],
  oldList: IPointCloudBox[],
): IPointCloudBox | undefined => {
  const newIds = newList.map((item) => item.id);
  return oldList.find((item) => !newIds.includes(item.id));
};

const getValidChangedBox = (
  newList: IPointCloudBox[],
  oldList: IPointCloudBox[],
): IPointCloudBox | undefined => {
  const changedBox = newList.find((newBox) => {
    const oldBox = oldList.find((box) => box.id === newBox.id);
    return oldBox && oldBox.valid !== newBox.valid;
  });
  return changedBox;
};

const getRotationChangedBox = (
  newList: IPointCloudBox[],
  oldList: IPointCloudBox[],
): IPointCloudBox | undefined => {
  const changedBox = newList.find((newBox) => {
    const oldBox = oldList.find((box) => box.id === newBox.id);
    return oldBox && oldBox.rotation !== newBox.rotation;
  });
  return changedBox;
};

const getIntersectingBoxIdsOfBox = (
  box: IPointCloudBox,
  boxList: IPointCloudBox[],
): { ids: string[]; rect: ICoordinate[] } => {
  const { polygonPointList } = getCuboidFromPointCloudBox(box);
  const intersectingBoxIds = getIntersectingBoxIds(
    polygonPointList,
    boxList.filter((item) => item.id !== box.id),
  );
  return {
    ids: intersectingBoxIds,
    rect: polygonPointList,
  };
};

/**
 * Gets the modified point cloud box and its type of modification
 * @param newList The new list of point cloud boxes
 * @param oldList The old list of point cloud boxes
 * @returns The type of modification and the point cloud box; returns undefined if there are no modifications
 */
const getModifiedBox = (
  newList: IPointCloudBox[],
  oldList: IPointCloudBox[],
): { modifiedType: EPointCloudBoxSingleModifiedType; box: IPointCloudBox } | undefined => {
  // Check if the two boxes are equal
  const areBoxesEqual = (box1: IPointCloudBox, box2: IPointCloudBox): boolean => {
    return (
      box1.attribute === box2.attribute &&
      box1.center.x === box2.center.x &&
      box1.center.y === box2.center.y &&
      box1.depth === box2.depth &&
      box1.width === box2.width &&
      box1.height === box2.height
    );
  };

  // Traverse the new list, find the modified box
  for (const newBox of newList) {
    const oldBox = oldList.find((box) => box.id === newBox.id);
    if (oldBox && !areBoxesEqual(newBox, oldBox)) {
      // Confirm Modification Type
      let modifiedType;

      if (oldBox.attribute !== newBox.attribute) {
        modifiedType = EPointCloudBoxSingleModifiedType.ChangeAttribute;
      } else if (oldBox.center.x !== newBox.center.x || oldBox.center.y !== newBox.center.y) {
        modifiedType = EPointCloudBoxSingleModifiedType.Move;
      } else if (oldBox.depth !== newBox.depth) {
        modifiedType = EPointCloudBoxSingleModifiedType.ChangeDepth;
      } else if (oldBox.width !== newBox.width || oldBox.height !== newBox.height) {
        modifiedType = EPointCloudBoxSingleModifiedType.ChangeSize;
      }

      if (modifiedType !== undefined) {
        return { modifiedType, box: newBox };
      }
    }
  }

  // If no changes are found，return undefined
  return undefined;
};

// I originally wanted to identify the TriggerType by recording history inside the method,
// but because of UndoRedo operations, it can only be passed through parameters
export const calcResetAreasAndBoxIds = (
  trigger: EPointCloudBoxRenderTrigger,
  newList: IPointCloudBox[],
  oldList: IPointCloudBox[],
): {
  modifiedBoxIds: string[];
  resetAreas: ICoordinate[][];
} => {
  try {
    switch (trigger) {
      case EPointCloudBoxRenderTrigger.Single:
        if (newList.length > oldList.length) {
          const addBoxId = getAddBoxId(newList, oldList);
          if (addBoxId) {
            // Adding a new box does not require resetting areas, only render the new box
            return { modifiedBoxIds: [addBoxId], resetAreas: [] };
          }
          return { modifiedBoxIds: [], resetAreas: [] };
        } else {
          const modifiedBoxIds: string[] = [];
          const resetAreas: ICoordinate[][] = [];
          const modifiedBox = getModifiedBox(newList, oldList);
          if (modifiedBox) {
            // Modifying attributes and depth only requires the boxId
            modifiedBoxIds.push(modifiedBox.box.id);
            if (
              modifiedBox.modifiedType === EPointCloudBoxSingleModifiedType.ChangeSize ||
              modifiedBox.modifiedType === EPointCloudBoxSingleModifiedType.Move ||
              modifiedBox.modifiedType === EPointCloudBoxSingleModifiedType.ChangeDepth
            ) {
              // Use the oldBox box here to calculate intersection
              const oldBox = oldList.find((item) => item.id === modifiedBox.box.id)!;
              const { ids: intersectingBoxIds, rect: resetArea } = getIntersectingBoxIdsOfBox(
                oldBox,
                newList,
              );

              modifiedBoxIds.push(...intersectingBoxIds);
              resetAreas.push(resetArea);
            }
          }
          return { modifiedBoxIds, resetAreas };
        }
      case EPointCloudBoxRenderTrigger.SingleDelete:
        if (newList.length < oldList.length) {
          const deletedBox = getDeletedBox(newList, oldList);
          if (deletedBox) {
            const deletedBoxCuboid = getCuboidFromPointCloudBox(deletedBox);
            // For deletion, restoring the original box is necessary
            const resetAreas = [deletedBoxCuboid.polygonPointList];
            const modifiedBoxIds = [];
            if (newList.length > 1) {
              // If newList has more than one box, then check for intersecting boxes
              const { ids: intersectingBoxIds } = getIntersectingBoxIdsOfBox(deletedBox, newList);
              intersectingBoxIds.length && modifiedBoxIds.push(...intersectingBoxIds);
            }
            return { modifiedBoxIds, resetAreas };
          }
          return { modifiedBoxIds: [], resetAreas: [] };
        }
        return { modifiedBoxIds: [], resetAreas: [] };
      case EPointCloudBoxRenderTrigger.SingleRotate:
        if (getRotationChangedBox(newList, oldList)) {
          const changedBox = getRotationChangedBox(newList, oldList);
          if (changedBox) {
            const oldBox = oldList.find((item) => item.id === changedBox.id);
            const { ids: intersectingBoxIds, rect: resetArea } = getIntersectingBoxIdsOfBox(
              oldBox!,
              newList,
            );
            return {
              modifiedBoxIds: [changedBox.id, ...intersectingBoxIds],
              resetAreas: [resetArea],
            };
          }
        }
        return { modifiedBoxIds: [], resetAreas: [] };
      case EPointCloudBoxRenderTrigger.SingleToggleValid:
        // In both cases, only one box needs to be re-rendered
        if (getValidChangedBox(newList, oldList)) {
          const changedBox = getValidChangedBox(newList, oldList);
          if (changedBox) {
            return { modifiedBoxIds: [changedBox.id], resetAreas: [] };
          }
          return { modifiedBoxIds: [], resetAreas: [] };
        }
        return { modifiedBoxIds: [], resetAreas: [] };
      case EPointCloudBoxRenderTrigger.MulitSelect:
        // By optimizing the comparison algorithm and combining it with difference With and isEqual from lodash, performance can be improved by 5-12 times!
        return {
          modifiedBoxIds: getDifference(newList, oldList),
          resetAreas: [],
        };
      case EPointCloudBoxRenderTrigger.MultiPaste:
      case EPointCloudBoxRenderTrigger.MultiMove:
      case EPointCloudBoxRenderTrigger.Default:
      case EPointCloudBoxRenderTrigger.UndoRedo:
      case EPointCloudBoxRenderTrigger.ClearAll:
      default:
        return { modifiedBoxIds: [], resetAreas: [] };
    }
  } catch (error) {
    console.error('calcResetAreasAndBoxIds error:', error);
    return { modifiedBoxIds: [], resetAreas: [] };
  }
};

/**
 * Through HashMap's ideas
 * Deeply compare different items of two arrays, find different items and return
 * A comparison algorithm combining differenceWith and isEqual to replace lodash
 */
const getDifference = (newList: any[], oldList: any[]): any[] => {
  const oldListMap = new Map();

  // Store the objects of the oldList in a hash table
  for (const item of oldList) {
    oldListMap.set(item.id, item);
  }

  // Compare objects in the new and oldList, and return the IDs of objects that are not exactly the same
  return newList
    .filter((item) => {
      const oldItem = oldListMap.get(item.id);
      return !oldItem || !isEqual(item, oldItem);
    })
    .map((item) => item.id);
};
