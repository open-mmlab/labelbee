import type { ICoordinate } from './common';
import type { ECuboidDirection } from '@/constant/cuboid';

export interface IPlanePoints {
  bl: ICoordinate; // Bottom Left Point;
  tl: ICoordinate; // Top Left Point;
  br: ICoordinate; // Bottom Right Point;
  tr: ICoordinate; // Top Right Point;
}

export interface IBasicAnnotationInfo {
  // Basic
  id: string;
  sourceID: string;
  valid: boolean;
  attribute: string;
  textAttribute: string;
  order: number;
}

export interface IDrawingCuboid extends IBasicAnnotationInfo {
  // Front Plane;
  frontPoints: IPlanePoints;
  // Direction of cuboid
  direction?: ECuboidDirection;
  // Back Plane;
  backPoints?: IPlanePoints;
}
