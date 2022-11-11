declare interface IPointCloudConfig extends IToolConfig {
  // 多边形持有
  attributeList: IInputList[];
  radius: number;
  secondaryAttributeConfigurable: boolean;
  inputList: IInputList[];

  lowerLimitPointsNumInBox: number;
  trackConfigurable: boolean;
}
