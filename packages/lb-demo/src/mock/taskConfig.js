import { cTool } from '@labelbee/lb-annotation';
const { EVideoToolName, EToolName, EPointCloudName } = cTool;

const rectToolConfig = {
  showConfirm: false,
  skipWhileNoDependencies: false,
  drawOutsideTarget: false,
  copyBackwardResult: true,
  minWidth: 1,
  minHeight: 1,
  isShowOrder: true,
  filterData: ['valid', 'invalid'],
  attributeConfigurable: true,
  attributeList: [
    { key: '玩偶', value: 'doll' },
    { key: '喷壶', value: 'wateringCan' },
    { key: '脸盆', value: 'washbasin' },
    { key: '保温杯', value: 'vacuumCup' },
    { key: '纸巾', value: 'tissue' },
    { key: '水壶', value: 'kettle' },
  ],
  textConfigurable: true,
  textCheckType: 0,
  customFormat: '',
};

const tagToolConfig = {
  showConfirm: true,
  skipWhileNoDependencies: false,
  inputList: [
    {
      key: '类别1',
      value: 'class1',
      isMulti: false,
      subSelected: [
        { key: '选项1', value: 'option1', isDefault: true },
        { key: '选项2', value: 'option1-2', isDefault: false },
      ],
    },
    {
      key: '类别2',
      value: 'class-AH',
      isMulti: true,
      subSelected: [
        { key: '选项2-1', value: 'option2-1', isDefault: true },
        { key: '选项2-2', value: 'option2-2', isDefault: true },
        { key: '选项2-3', value: 'option2-3', isDefault: false },
      ],
    },
    {
      key: '类别3',
      value: 'class-0P',
      isMulti: false,
      subSelected: [
        { key: '选项3-1', value: 'option3-1', isDefault: false },
        { key: '选项3-2', value: 'option3-2', isDefault: false },
        { key: '选项3-3', value: 'option3-3', isDefault: false },
      ],
    },
    {
      key: '类别4',
      value: 'class-4',
      isMulti: true,
      subSelected: [
        { key: '选项2-1', value: 'option2-1', isDefault: false },
        { key: '选项2-2', value: 'option2-2', isDefault: false },
        { key: '选项2-3', value: 'option2-3', isDefault: false },
      ],
    },
  ],
};

const lineToolConfig = {
  lineType: 0,
  lineColor: 0,
  edgeAdsorption: true,
  outOfTarget: true,
  copyBackwardResult: true,
  isShowOrder: true,
  attributeConfigurable: true,
  attributeList: [
    { key: '类别1', value: '类别1' },
    { key: '类别ao', value: 'class-ao' },
    { key: '类别M1', value: 'class-M1' },
    { key: '类别Cm', value: 'class-Cm' },
    { key: '类别c3', value: 'class-c3' },
    { key: '类别a0', value: 'class-a0' },
    { key: '类别u7', value: 'class-u7' },
    { key: '类别Zb', value: 'class-Zb' },
    { key: '类别zi', value: 'class-zi' },
  ],
  textConfigurable: true,
  textCheckType: 2,
  customFormat: '',
  showConfirm: true,
  lowerLimitPointNum: 2,
  upperLimitPointNum: '',
  preReferenceStep: 0,
  skipWhileNoDependencies: false,
  filterData: ['valid', 'invalid'],
};

const textToolConfig = {
  showConfirm: false,
  skipWhileNoDependencies: false,
  enableTextRecognition: false,
  recognitionMode: 'general',
  configList: [
    { label: '文本', key: 'text', required: false, default: 'default1', maxLength: 1000 },
    { label: '文本2', key: 'text2', required: true, default: 'default2', maxLength: 1000 },
    { label: '文本3', key: 'text3', required: true, default: 'default3', maxLength: 1000 },
  ],
  filterData: ['valid', 'invalid'],
};

const polygonConfig = {
  lineType: 0,
  lineColor: 0,
  edgeAdsorption: true,
  drawOutsideTarget: false,
  copyBackwardResult: false,
  isShowOrder: false,
  attributeConfigurable: true,
  attributeList: [
    { key: '玩偶', value: 'doll' },
    { key: '喷壶', value: 'wateringCan' },
    { key: '脸盆', value: 'washbasin' },
    { key: '保温杯', value: 'vacuumCup' },
    { key: '纸巾', value: 'tissue' },
    { key: '水壶', value: 'kettle' },
  ],
  textConfigurable: true,
  textCheckType: 0,
  customFormat: '',
};

const pointCloudConfig = {
  attributeList: [
    {
      key: '类别1',
      value: '类别1',
      // 点云暂不支持
      sizeLimit: {
        lengthMin: '1',
        lengthMax: '2',
        widthMin: '3',
        widthMax: '4',
        heightMin: '5',
        heightMax: '6',
      },
      default: false,
    },
    { key: '类别Iq', value: 'class-Iq', sizeLimit: { lengthMin: '1' } },
  ],
  radius: 90,
  inputList: [
    {
      key: '类别1',
      value: 'class1',
      isMulti: false,
      subSelected: [
        { key: '选项1-1', value: 'option1', isDefault: false },
        { key: '选项1-2', value: 'option2', isDefault: false },
      ],
    },
    {
      key: '类别v0',
      value: 'class-v0',
      isMulti: false,
      subSelected: [
        { key: '选项2-1', value: 'option2-1', isMulti: false },
        { key: '选项2-2', value: 'option2-2', isMulti: false },
        { key: '选项2-3', value: 'option2-3', isMulti: false },
      ],
    },
    {
      key: '类别Rt',
      value: 'class-Rt',
      isMulti: false,
      subSelected: [{ key: '选项3-1', value: 'option3-1', isMulti: false }],
    },
  ],
  secondaryAttributeConfigurable: true,
  lowerLimitPointsNumInBox: '',
};

export const getConfig = (tool) => {
  if (tool === EToolName.Line) {
    return lineToolConfig;
  }

  if (tool === EToolName.Rect) {
    return rectToolConfig;
  }

  if (tool === EToolName.Tag) {
    return tagToolConfig;
  }

  if (tool === EToolName.Text) {
    return textToolConfig;
  }

  if (tool === EToolName.Polygon) {
    return polygonConfig;
  }

  if (tool === EVideoToolName.VideoTagTool) {
    return tagToolConfig;
  }

  if (tool === EPointCloudName.PointCloud) {
    return pointCloudConfig;
  }

  return rectToolConfig;
};

export const getStepList = (tool, sourceStep, step) => {
  return [getStepConfig(tool)];
};

const getStepConfig = (tool, step, sourceStep) => {
  return {
    step: step ?? 1,
    dataSourceStep: sourceStep || 0,
    tool: tool ?? EToolName.Rect,
    config: JSON.stringify(getConfig(tool)),
  };
};

export const getDependStepList = (toolsArray) =>
  toolsArray.map((tool, index) => getStepConfig(tool, index + 1, index));
