import type { ECuboidDirection, ECuboidPlain, ECuboidPosition } from '@/constant/annotation';

import type { ICoordinate, IToolConfig } from './common';
import type { IInputList } from './tagTool';

declare interface IPlanePoints {
  bl: ICoordinate; // Bottom Left Point;
  tl: ICoordinate; // Top Left Point;
  br: ICoordinate; // Bottom Right Point;
  tr: ICoordinate; // Top Right Point;
}

declare interface ICuboidPosition {
  plain: ECuboidPlain;
  position: ECuboidPosition;
}
declare interface IBasicAnnotationInfo {
  // Basic
  id: string;
  sourceID: string;
  valid: boolean;
  attribute: string;
  textAttribute: string;
  order: number;
}

declare interface IDrawingCuboid extends IBasicAnnotationInfo {
  // Front Plane;
  frontPoints: IPlanePoints;
  // Direction of cuboid
  direction?: ECuboidDirection;
  // Back Plane;
  backPoints?: IPlanePoints;
}

declare interface ICuboid extends IBasicAnnotationInfo {
  // Direction of cuboid
  direction: ECuboidDirection;

  // Front Plane;
  frontPoints: IPlanePoints;

  // Back Plane;
  backPoints: IPlanePoints;
}

declare interface ICuboidConfig extends IToolConfig {
  attributeList: IInputList[];
  attributeConfigurable: boolean;
  textConfigurable: boolean;
  textCheckType: number;
  copyBackwardResult: boolean;

  isShowOrder?: boolean;

  minWidth: number;
  minHeight: number;
}
