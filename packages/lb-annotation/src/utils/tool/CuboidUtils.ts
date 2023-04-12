import { cloneDeep } from 'lodash';
import {
  CUBOID_COLUMN,
  CUBOID_ROW,
  DIAGONAL_POINT,
  ECuboidLineDirection,
  ECuboidPlain,
  ECuboidPosition,
  EDragTarget,
  ECuboidDirection,
} from '@/constant/annotation';
import type { ICuboid, ICuboidConfig, ICuboidPosition, IDrawingCuboid, IPlanePoints } from '@/types/tool/cuboid';
import AxisUtils from '@/utils/tool/AxisUtils';

import Vector from '../VectorUtils';
import LineToolUtils from './LineToolUtils';

/**
 * Get the basicInfo of cuboid-frontPoints.
 * @param param0
 * @returns
 */
export function getPlanePointsBasicInfo({ tr, tl, br }: IPlanePoints) {
  return {
    width: Math.abs(tr.x - tl.x),
    height: Math.abs(br.y - tr.y),
    centerPoints: {
      x: (tl.x + br.x) / 2,
      y: (tl.y + br.y) / 2,
    },
  };
}

export function getCuboidBasicInfo({
  frontPoints,
  backPoints,
}: {
  frontPoints: IPlanePoints;
  backPoints: IPlanePoints;
}) {
  const { width: frontWidth, height: frontHeight, centerPoints: frontCenter } = getPlanePointsBasicInfo(frontPoints);
  const { width: backWidth, height: backHeight, centerPoints: backCenter } = getPlanePointsBasicInfo(backPoints);
  return {
    frontCenter,
    backCenter,
    frontWidth,
    frontHeight,
    backWidth,
    backHeight,
    isLeftSide: backCenter.x < frontCenter.x,
  };
}

/**
 * Use two diagonalPoints to create Regular Rect(Plain)
 * @param p1
 * @param p2
 * @returns
 */
export function getPlainPointsByDiagonalPoints(p1: ICoordinate, p2: ICoordinate): IPlanePoints {
  return {
    tl: {
      x: Math.min(p1.x, p2.x),
      y: Math.min(p1.y, p2.y),
    },
    tr: {
      x: Math.max(p1.x, p2.x),
      y: Math.min(p1.y, p2.y),
    },
    bl: {
      x: Math.min(p1.x, p2.x),
      y: Math.max(p1.y, p2.y),
    },
    br: {
      x: Math.max(p1.x, p2.x),
      y: Math.max(p1.y, p2.y),
    },
  };
}

/**
 * Get the max external quadrilateral by points.
 * @param points
 * @returns
 */
export function getMaxExternalQuadrilateral(points: IPlanePoints) {
  const minX = Object.values(points).reduce((acc, coord) => (coord.x < acc ? coord.x : acc), Number.MAX_SAFE_INTEGER);
  const maxX = Object.values(points).reduce((acc, coord) => (coord.x > acc ? coord.x : acc), 0);
  const minY = Object.values(points).reduce((acc, coord) => (coord.y < acc ? coord.y : acc), Number.MAX_SAFE_INTEGER);
  const maxY = Object.values(points).reduce((acc, coord) => (coord.y > acc ? coord.y : acc), 0);

  return {
    tl: {
      x: minX,
      y: minY,
    },
    tr: {
      x: maxX,
      y: minY,
    },
    bl: {
      x: minX,
      y: maxY,
    },
    br: {
      x: maxX,
      y: maxY,
    },
  };
}

export function judgeCuboidLineIsRowOrColumn(pointList: [ICuboidPosition, ICuboidPosition]) {
  const [firstPosition, secondPosition] = pointList;

  if (CUBOID_ROW[firstPosition.position] === secondPosition.position) {
    return ECuboidLineDirection.Row;
  }

  if (CUBOID_COLUMN[firstPosition.position] === secondPosition.position) {
    return ECuboidLineDirection.Column;
  }
}

/**
 * Copy the plain through points and new bottomRightPoint.
 * @param param0
 * @returns
 */
export function getPointsByBottomRightPoint({
  coord,
  points,
}: {
  coord: ICoordinate;
  points: IPlanePoints;
}): IPlanePoints {
  const { width, height } = getPlanePointsBasicInfo(points);
  return {
    br: coord,
    tr: {
      x: coord.x,
      y: coord.y - height,
    },
    tl: {
      x: coord.x - width,
      y: coord.y - height,
    },
    bl: {
      x: coord.x - width,
      y: coord.y,
    },
  };
}

/**
 * Copy the plain through points and new bottomLeftPoint.
 *
 * Notice: currentPoints is just regular rectangle.
 *
 * @param param0
 * @returns
 */
export function getPointsByBottomLeftPoint({
  coord,
  points,
}: {
  coord: ICoordinate;
  points: IPlanePoints;
}): IPlanePoints {
  const { width, height } = getPlanePointsBasicInfo(points);
  return {
    bl: coord,
    tr: {
      x: coord.x + width,
      y: coord.y - height,
    },
    tl: {
      x: coord.x,
      y: coord.y - height,
    },
    br: {
      x: coord.x + width,
      y: coord.y,
    },
  };
}

/**
 * The showing sideline is line that connects the front and back planes.
 * @param param0
 * @returns
 */
export function getCuboidShowingSideLine({
  frontPoints,
  backPoints,
}: {
  frontPoints: IPlanePoints;
  backPoints: IPlanePoints;
}) {
  const { isLeftSide } = getCuboidBasicInfo({ frontPoints, backPoints });

  if (isLeftSide) {
    return {
      top: {
        p1: frontPoints.tl,
        p2: backPoints.tl,
      },
      bottom: {
        p1: frontPoints.bl,
        p2: backPoints.bl,
      },
    };
  }
  return {
    top: {
      p1: frontPoints.tr,
      p2: backPoints.tr,
    },
    bottom: {
      p1: frontPoints.br,
      p2: backPoints.br,
    },
  };
}

/**
 *
 * @param param0
 * @returns
 */
export function getPointsByIntersection({
  frontPoints,
  backPoints,
}: {
  frontPoints: IPlanePoints;
  backPoints: IPlanePoints;
}) {
  const { isLeftSide } = getCuboidBasicInfo({ frontPoints, backPoints });

  let newBackPoints = { ...backPoints };

  const sideLine = getCuboidShowingSideLine({ frontPoints, backPoints });
  const intersectionPoint = LineToolUtils.lineIntersection(
    { pointA: sideLine.bottom.p1, pointB: sideLine.bottom.p2 },
    { pointA: sideLine.top.p1, pointB: sideLine.top.p2 },
  ) as ICoordinate;

  if (isLeftSide) {
    const newBRPoint = LineToolUtils.lineIntersection(
      { pointA: backPoints.bl, pointB: backPoints.br },
      { pointA: frontPoints.br, pointB: intersectionPoint },
    );

    if (newBRPoint) {
      newBackPoints = {
        ...backPoints,
        br: newBRPoint,
        tr: {
          x: newBRPoint.x,
          y: backPoints.tl.y,
        },
      };
    }
  } else {
    const newBLPoint = LineToolUtils.lineIntersection(
      { pointA: backPoints.bl, pointB: backPoints.br },
      { pointA: frontPoints.bl, pointB: intersectionPoint },
    );

    if (newBLPoint) {
      newBackPoints = {
        ...backPoints,
        bl: newBLPoint,
        tl: {
          x: newBLPoint.x,
          y: backPoints.tr.y,
        },
      };
    }
  }

  return {
    backPoints: newBackPoints,
  };
}

/**
 * When the point
 * @param frontPoints
 * @param backPoints
 */
export function getBackPointsByFrontPoints({
  frontPoints,
  backPoints,
}: {
  frontPoints: IPlanePoints;
  backPoints: IPlanePoints;
}) {
  const { isLeftSide, frontHeight, backHeight } = getCuboidBasicInfo({ frontPoints, backPoints });

  // 1. Create the Following BackPoints by frontPoints.
  let newBackPoints = { ...backPoints };
  if (isLeftSide) {
    newBackPoints = getPointsByBottomLeftPoint({ coord: backPoints.bl, points: frontPoints });
  } else {
    newBackPoints = getPointsByBottomRightPoint({ coord: backPoints.br, points: frontPoints });
  }

  // 2 . If frontPoints height is higher than origin-backPoints, Need to update the backPoints through 6 points.(Fronts points 4 + backPoints 2)
  if (frontHeight > backHeight) {
    newBackPoints = getPointsByIntersection({ frontPoints, backPoints }).backPoints;
  }

  return { frontPoints, backPoints: newBackPoints };
}

export function getFrontPointsByBackPoints({
  frontPoints,
  backPoints,
}: {
  frontPoints: IPlanePoints;
  backPoints: IPlanePoints;
}) {
  const { isLeftSide, frontHeight, backHeight, frontWidth, backWidth } = getCuboidBasicInfo({
    frontPoints,
    backPoints,
  });

  // 1. Create the Following BackPoints by frontPoints.
  let newFrontPoints = { ...frontPoints };
  let newBackPoints = backPoints;

  /**
   * Create New FrontPoints.
   * 1. leftSide
   * 2. If the update backWidth > frontWidth.
   */
  if (isLeftSide || backWidth > frontWidth) {
    newFrontPoints = getPointsByBottomLeftPoint({ coord: frontPoints.bl, points: backPoints });
  } else {
    newFrontPoints = getPointsByBottomRightPoint({ coord: frontPoints.br, points: backPoints });
  }

  // 2 . If frontPoints height is higher than origin-backPoints, Need to sync tl & tr in frontPoints
  if (frontHeight > backHeight) {
    newFrontPoints.tl.y = frontPoints.tl.y;
    newFrontPoints.tr.y = frontPoints.tr.y;
    newBackPoints = getPointsByIntersection({ backPoints, frontPoints }).backPoints;
  }

  if (frontWidth >= backWidth) {
    Object.keys(newFrontPoints).forEach((key) => {
      // @ts-ignore
      newFrontPoints[key].x = frontPoints[key].x;
    });
  }

  return {
    frontPoints: newFrontPoints,
    backPoints: newBackPoints,
  };
}
/**
 * Get SideLine By FrontPoints & BackPoints
 * @param param0
 * @returns
 */
export function getCuboidAllSideLine({ frontPoints, backPoints }: ICuboid) {
  return [
    {
      p1: frontPoints.bl,
      p2: backPoints.bl,
    },
    {
      p1: frontPoints.tl,
      p2: backPoints.tl,
    },
    {
      p1: frontPoints.tr,
      p2: backPoints.tr,
    },
    {
      p1: frontPoints.br,
      p2: backPoints.br,
    },
  ];
}

export function getHighlightLines(cuboid: ICuboid) {
  const { frontPoints, backPoints } = cuboid;
  const { isLeftSide } = getCuboidBasicInfo(cuboid);

  // 1. FrontPlaneLine
  const frontLine = [
    {
      p1: frontPoints.tl,
      p2: frontPoints.tr,
      positions: [
        {
          plain: ECuboidPlain.Front,
          position: ECuboidPosition.TL,
        },
        {
          plain: ECuboidPlain.Front,
          position: ECuboidPosition.TR,
        },
      ],
    },
    {
      p1: frontPoints.tr,
      p2: frontPoints.br,
      plain: ECuboidPlain.Front,
      positions: [
        {
          plain: ECuboidPlain.Front,
          position: ECuboidPosition.TR,
        },
        {
          plain: ECuboidPlain.Front,
          position: ECuboidPosition.BR,
        },
      ],
    },
    {
      p1: frontPoints.br,
      p2: frontPoints.bl,
      plain: ECuboidPlain.Front,
      positions: [
        {
          plain: ECuboidPlain.Front,
          position: ECuboidPosition.BR,
        },
        {
          plain: ECuboidPlain.Front,
          position: ECuboidPosition.BL,
        },
      ],
    },
    {
      p1: frontPoints.bl,
      p2: frontPoints.tl,
      plain: ECuboidPlain.Front,
      positions: [
        {
          plain: ECuboidPlain.Front,
          position: ECuboidPosition.BL,
        },
        {
          plain: ECuboidPlain.Front,
          position: ECuboidPosition.TL,
        },
      ],
    },
  ];

  // 2. BackColumnLine
  if (isLeftSide) {
    return [
      ...frontLine,
      {
        p1: backPoints.tl,
        p2: backPoints.bl,
        positions: [
          {
            plain: ECuboidPlain.Back,
            position: ECuboidPosition.TL,
          },
          {
            plain: ECuboidPlain.Back,
            position: ECuboidPosition.BL,
          },
        ],
      },
    ];
  }

  return [
    ...frontLine,
    {
      p1: backPoints.tr,
      p2: backPoints.br,
      positions: [
        {
          plain: ECuboidPlain.Back,
          position: ECuboidPosition.TR,
        },
        {
          plain: ECuboidPlain.Back,
          position: ECuboidPosition.BR,
        },
      ],
    },
  ];
}

/**
 * Just showing the points which can be adjusted
 * @param cuboid
 * @returns
 */
export function getHighlightPoints(cuboid: ICuboid): { point: ICoordinate; positions: ICuboidPosition[] }[] {
  const { backPoints } = cuboid;
  const { isLeftSide } = getCuboidBasicInfo(cuboid);

  const frontPointsData = Object.entries(cuboid.frontPoints).map(([position, point]) => ({
    positions: [
      {
        plain: ECuboidPlain.Front,
        position,
      },
    ],
    point,
  })) as { point: ICoordinate; positions: ICuboidPosition[] }[];

  if (isLeftSide) {
    return [
      { point: backPoints.tl, positions: [{ position: ECuboidPosition.TL, plain: ECuboidPlain.Back }] },
      { point: backPoints.bl, positions: [{ position: ECuboidPosition.BL, plain: ECuboidPlain.Back }] },
      ...frontPointsData,
    ];
  }
  return [
    { point: backPoints.tr, positions: [{ position: ECuboidPosition.TR, plain: ECuboidPlain.Back }] },
    { point: backPoints.br, positions: [{ position: ECuboidPosition.BR, plain: ECuboidPlain.Back }] },
    ...frontPointsData,
  ];
}

/**
 * Get the range of Cuboid in 2D.
 *
 *
 * @param param0
 * @returns
 */
export function getCuboidHoverRange(cuboid: ICuboid): ICoordinate[] {
  const { frontPoints, backPoints } = cuboid;
  const { backCenter, frontCenter, frontHeight, frontWidth, backHeight, backWidth, isLeftSide } =
    getCuboidBasicInfo(cuboid);

  const diffWidth = Math.abs(frontWidth - backWidth);
  const diffHeight = Math.abs(frontHeight - backHeight);
  const diffCenterX = Math.abs(frontCenter.x - backCenter.x);
  const diffCenterY = Math.abs(frontCenter.y - backCenter.y);
  const isOverX = diffCenterX > diffWidth; // is BackPlane outside of the FrontPlane in X-Axis.
  const isOverY = diffCenterY > diffHeight; // is BackPlane outside of the FrontPlane in Y-Axis.

  const isNested = !(isOverX || isOverY);

  // 1. Is nested?
  if (isNested) {
    // Just front plane.
    return [frontPoints.tl, frontPoints.tr, frontPoints.br, frontPoints.bl];
  }

  /**
   * Default: FrontPoints is front to BackPoints.
   */

  // 2. leftSide - BackPlane is to the left of FrontPlane.
  // 2-1. Just Y is Over.
  if (isOverY && !isOverX) {
    return [frontPoints.tl, backPoints.tl, backPoints.tr, frontPoints.tr, frontPoints.br, frontPoints.bl];
  }

  // 2-2. JustX is Over
  if (isOverX && !isOverY) {
    if (isLeftSide) {
      return [frontPoints.tl, frontPoints.tr, frontPoints.br, frontPoints.bl, backPoints.bl, backPoints.tl];
    }
    return [frontPoints.tl, frontPoints.tr, backPoints.tr, backPoints.br, frontPoints.br, frontPoints.bl];
  }

  // 2-3. Both over in X & Y Axis.
  if (isOverX && isOverY) {
    if (isLeftSide) {
      return [backPoints.tl, backPoints.tr, frontPoints.tr, frontPoints.br, frontPoints.bl, backPoints.bl];
    }

    return [frontPoints.tl, backPoints.tl, backPoints.tr, backPoints.br, frontPoints.br, frontPoints.bl];
  }

  return [];
}

/**
 * Notice: positions just support point and line moving.
 * @param param0
 */
export function getNewPointsAfterOffset({
  offset,
  frontPoints,
  backPoints,
  positions,
}: {
  frontPoints: IPlanePoints;
  backPoints: IPlanePoints;
  offset: ICoordinate;
  positions?: ICuboidPosition[];
}) {
  let newFrontPoints = cloneDeep(frontPoints);
  let newBackPoints = cloneDeep(backPoints);

  // Line Move
  if (positions?.length === 2) {
    const isFrontPlain = positions.every((v) => v.plain === ECuboidPlain.Front);
    const isBackPlain = !isFrontPlain;

    const lineDirection = judgeCuboidLineIsRowOrColumn([positions[0], positions[1]]);
    const forbidX = lineDirection === ECuboidLineDirection.Row;
    const forbidY = lineDirection === ECuboidLineDirection.Column;
    let newOffset = offset;

    // Allows movement only in vertical direction of the line.
    if (forbidX) {
      newOffset = {
        x: 0,
        y: offset.y,
      };
    }
    if (forbidY) {
      newOffset = {
        y: 0,
        x: offset.x,
      };
    }

    // Just Update the Positions.
    if (isFrontPlain) {
      positions?.forEach(({ position }) => {
        const points = newFrontPoints;

        const movePoint = points[position];
        points[position] = {
          x: movePoint.x + newOffset.x,
          y: movePoint.y + newOffset.y,
        };
      });
      newFrontPoints = getMaxExternalQuadrilateral(newFrontPoints);
      newBackPoints = getMaxExternalQuadrilateral(newBackPoints);
    }

    // If the backLine is moved. Need to keep backPoints size.
    if (isBackPlain) {
      Object.keys(newBackPoints).forEach((key) => {
        //@ts-ignore
        newBackPoints[key] = {
          //@ts-ignore
          x: newBackPoints[key].x + newOffset.x,
          //@ts-ignore
          y: newBackPoints[key].y + newOffset.y,
        };
      });
    }

    // Perspective
    const getNewPlainPoints = isFrontPlain ? getBackPointsByFrontPoints : getFrontPointsByBackPoints;
    const { frontPoints: newFrontPoints2, backPoints: newBackPoints2 } = getNewPlainPoints({
      frontPoints: newFrontPoints,
      backPoints: newBackPoints,
    });

    newFrontPoints = newFrontPoints2;
    newBackPoints = newBackPoints2;
  }

  return {
    frontPoints: newFrontPoints,
    backPoints: newBackPoints,
  };
}

/**
 * Update cuboid when dragging.
 * @param param0
 * @returns
 */
export function getCuboidDragMove({
  offset,
  cuboid,
  dragTarget,
  positions,
}: {
  offset: ICoordinate;
  cuboid: ICuboid;
  dragTarget: EDragTarget;
  positions?: ICuboidPosition[];
}): ICuboid | undefined {
  const { frontPoints, backPoints } = cuboid;

  switch (dragTarget) {
    case EDragTarget.Cuboid: {
      const newFrontPoints = Object.entries(frontPoints).reduce((acc, [key, point]) => {
        return {
          ...acc,
          [key]: {
            x: point.x + offset.x,
            y: point.y + offset.y,
          },
        };
      }, {}) as IPlanePoints;

      const newBackPoints = Object.entries(backPoints).reduce((acc, [key, point]) => {
        return {
          ...acc,
          [key]: {
            x: point.x + offset.x,
            y: point.y + offset.y,
          },
        };
      }, {}) as IPlanePoints;

      return {
        ...cuboid,
        frontPoints: newFrontPoints,
        backPoints: newBackPoints,
      };
    }
    case EDragTarget.Line: {
      //
      const { frontPoints: newFrontPoints, backPoints: newBackPoints } = getNewPointsAfterOffset({
        offset,
        frontPoints,
        backPoints,
        positions,
      });

      return {
        ...cuboid,
        frontPoints: newFrontPoints,
        backPoints: newBackPoints,
      };
    }

    case EDragTarget.Point: {
      if (!positions?.[0]) {
        return;
      }
      const pointPosition = positions[0];

      const isFrontPlain = pointPosition.plain === ECuboidPlain.Front;

      // Notice: The following solution involves only the front and back plains.
      const movePoints = isFrontPlain ? frontPoints : backPoints;

      // 1. Get the NewPlain by pointPosition.plain.
      let movePoint = movePoints[pointPosition.position];
      const diagonalPoint = movePoints[DIAGONAL_POINT[pointPosition.position] as ECuboidPosition];

      if (!movePoint || !diagonalPoint) {
        return;
      }

      movePoint = Vector.add(movePoint, offset);

      const newPlainsPoints = getPlainPointsByDiagonalPoints(movePoint, diagonalPoint);

      const getNewPlainPoints = isFrontPlain ? getBackPointsByFrontPoints : getFrontPointsByBackPoints;

      let payload = {
        frontPoints,
        backPoints: newPlainsPoints,
      };

      if (isFrontPlain) {
        payload = {
          frontPoints: newPlainsPoints,
          backPoints,
        };
      }

      const { frontPoints: newFrontPoints, backPoints: newBackPoints } = getNewPlainPoints(payload);

      // Calculate New Points by Diagonal Point (对角点)
      return {
        ...cuboid,
        frontPoints: newFrontPoints,
        backPoints: newBackPoints,
      };
    }

    default: {
      console.error('No DragTarget');
      break;
    }
  }
}

/**
 * Get the points of the corresponding faces by direction
 * @param cuboid
 * @returns
 */
export function getPointListsByDirection({
  direction,
  frontPoints,
  backPoints,
}: {
  direction: ECuboidDirection;
  frontPoints: IPlanePoints;
  backPoints: IPlanePoints;
}) {
  if (direction && frontPoints && backPoints) {
    let points: IPlanePoints = frontPoints;
    switch (direction) {
      case ECuboidDirection.Back:
        points = backPoints;
        break;
      case ECuboidDirection.Left:
        points = {
          bl: backPoints.bl,
          br: frontPoints.bl,
          tl: backPoints.tl,
          tr: frontPoints.tl,
        };
        break;
      case ECuboidDirection.Right:
        points = {
          bl: backPoints.br,
          br: frontPoints.br,
          tl: backPoints.tr,
          tr: frontPoints.tr,
        };
        break;
      case ECuboidDirection.Top:
        points = {
          bl: backPoints.tl,
          br: frontPoints.tl,
          tl: backPoints.tr,
          tr: frontPoints.tr,
        };
        break;
      default:
        points = frontPoints;
        break;
    }
    return AxisUtils.transformPlain2PointList(points);
  }
}

/**
 * Get the offset of toggleDirection Dom.
 *
 * Calculation
 * 1. FrontPoints left centerPoints.
 * 2. Offset the size of toggleDom.
 * @param param0
 * @returns
 */
export function getToggleDirectionButtonOffset({
  cuboid,
  currentPos,
  zoom,
}: {
  cuboid: ICuboid;
  currentPos: ICoordinate;
  zoom: number;
}) {
  const { frontPoints } = cuboid;

  const toggleSize = {
    width: 40,
    height: 74,
  };

  const frontPointsCenter = {
    x: (frontPoints.bl.x + frontPoints.tl.x) / 2,
    y: (frontPoints.bl.y + frontPoints.tl.y) / 2,
  };

  const leftOffset = toggleSize.width + 10;
  const topOffset = toggleSize.height / 2;

  // Move Coordinate.
  const moveCoordinate = {
    x: frontPointsCenter.x,
    y: frontPointsCenter.y,
  };

  const coordinate = AxisUtils.getOffsetCoordinate(moveCoordinate, currentPos, zoom);

  return {
    left: coordinate.x - leftOffset,
    top: coordinate.y - topOffset,
  };
}

/**
 * The default offset is base on iconSvg.
 *
 * @param param0
 * @returns
 */
export function getCuboidTextAttributeOffset({
  cuboid,
  currentPos,
  zoom,
  leftOffset = 16,
  topOffset = 2,
}: {
  cuboid: ICuboid | IDrawingCuboid;
  currentPos: ICoordinate;
  zoom: number;
  leftOffset?: number;
  topOffset?: number;
}) {
  const { frontPoints } = cuboid;

  // Move Coordinate.
  const moveCoordinate = {
    x: frontPoints.bl.x,
    y: frontPoints.bl.y,
  };

  const coordinate = AxisUtils.getOffsetCoordinate(moveCoordinate, currentPos, zoom);

  return {
    left: coordinate.x + leftOffset,
    top: coordinate.y + topOffset,
  };
}

/**
 * Judgement of minWidth & minHeight
 * @param param0
 * @returns
 */
export function isCuboidWithInLimits({ cuboid, config }: { cuboid: ICuboid | IDrawingCuboid; config: ICuboidConfig }) {
  const { minHeight, minWidth } = config;

  const { width, height } = getPlanePointsBasicInfo(cuboid.frontPoints);

  return width >= minWidth && height >= minHeight;
}
