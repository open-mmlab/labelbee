import { EToolName } from './tool';

const rectToolConfig = {
  showConfirm: false,
  skipWhileNoDependencies: false,
  drawOutsideTarget: false,
  copyBackwardResult: false,
  minWidth: 1,
  minHeight: 1,
  isShowOrder: false,
  filterData: ['valid', 'invalid'],
  attributeConfigurable: false,
  attributeList: [],
  textConfigurable: false,
  textCheckType: 0,
  customFormat: '',
};

const tagToolConfig = {
  showConfirm: false,
  skipWhileNoDependencies: false,
  inputList: [
    {
      key: '类别1',
      value: 'class1',
      isMulti: false,
      subSelected: [
        { key: '选项1', value: 'option1', isDefault: false },
        { key: '选项2', value: 'option1-2', isDefault: false },
      ],
    },
    {
      key: '类别2',
      value: 'class-AH',
      isMulti: true,
      subSelected: [
        { key: '选项2-1', value: 'option2-1', isDefault: false },
        { key: '选项2-2', value: 'option2-2', isDefault: false },
        { key: '选项2-3', value: 'option2-3', isDefault: false },
      ],
    },
    {
      key: '类别3',
      value: 'class-0P',
      isMulti: false,
      subSelected: [
        { key: '选项3-1', value: 'option3-1', isMulti: false },
        { key: '选项3-2', value: 'option3-2', isDefault: false },
        { key: '选项3-3', value: 'option3-3', isDefault: false },
      ],
    },
  ],
};

const lineToolConfig = {
  lineType: 0,
  lineColor: 0,
  edgeAdsorption: false,
  outOfTarget: true,
  copyBackwardResult: false,
  isShowOrder: false,
  attributeConfigurable: false,
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
  textConfigurable: false,
  textCheckType: 2,
  customFormat: '',
  showConfirm: false,
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
  configList: [{ label: '文本', key: 'text', required: false, default: '', maxLength: 1000 }],
  filterData: ['valid', 'invalid'],
};

const polygonConfig = {
  lineType: 0,
  lineColor: 0,
  lowerLimitPointNum: 3,
  edgeAdsorption: false,
  drawOutsideTarget: false,
  copyBackwardResult: false,
  isShowOrder: false,
  attributeConfigurable: false,
  attributeList: [],
  textConfigurable: true,
  textCheckType: 0,
  customFormat: '',
};

export const getConfig = (tool: EToolName) => {
  if (tool === 'lineTool') {
    return lineToolConfig;
  }

  if (tool === 'rectTool') {
    return rectToolConfig;
  }

  if (tool === 'tagTool') {
    return tagToolConfig;
  }

  if (tool === 'textTool') {
    return textToolConfig;
  }

  if (tool === 'polygonTool') {
    return polygonConfig;
  }

  return rectToolConfig;
};

export const getStepList = (tool: EToolName) => {
  return [
    {
      step: 1,
      dataSourceStep: 0,
      tool: tool ?? 'rectTool',
      config: JSON.stringify(getConfig(tool)),
    },
  ];
};

export const styleDefaultConfig = {
  toolColor: {
    1: {
      valid: { stroke: 'rgba(0,0,255,0.50)', fill: 'rgba(0,0,255,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.80)' },
      validSelected: { stroke: 'rgba(0,15,255,1.00)', fill: 'rgba(0,15,255,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,0.60)', fill: 'rgba(255,0,0,0.24)' },
      validHover: { stroke: 'rgba(0,15,255,0.80)', fill: 'rgba(0,15,255,0.64)' },
      invalidHover: { stroke: 'rgba(255,0,0,0.50)', fill: 'rgba(255,0,0,0.40)' },
    },
    3: {
      valid: { stroke: 'rgba(0,255,255,0.50)', fill: 'rgba(0,255,255,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.80)' },
      validSelected: { stroke: 'rgba(0,212,255,1.00)', fill: 'rgba(0,212,255,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,0.60)', fill: 'rgba(255,0,0,0.24)' },
      validHover: { stroke: 'rgba(0,212,255,0.80)', fill: 'rgba(0,212,255,0.64)' },
      invalidHover: { stroke: 'rgba(255,0,0,0.50)', fill: 'rgba(255,0,0,0.40)' },
    },
    5: {
      valid: { stroke: 'rgba(0,255,0,0.50)', fill: 'rgba(0,255,0,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.80)' },
      validSelected: { stroke: 'rgba(149,255,1.00)', fill: 'rgba(149,255,0,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,0.60)', fill: 'rgba(255,0,0,0.24)' },
      validHover: { stroke: 'rgba(149,255,0,0.80)', fill: 'rgba(149,255,0,0.64)' },
      invalidHover: { stroke: 'rgba(255,0,0,0.50)', fill: 'rgba(255,0,0,0.40)' },
    },
    7: {
      valid: { stroke: 'rgba(255,255,0,0.50)', fill: 'rgba(255,255,0,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.80)' },
      validSelected: { stroke: 'rgba(255,230,102,1.00)', fill: 'rgba(255,213,0,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,0.60)', fill: 'rgba(255,0,0,0.24)' },
      validHover: { stroke: 'rgba(255,230,102,0.80)', fill: 'rgba(255,230,102,0.64)' },
      invalidHover: { stroke: 'rgba(255,0,0,0.50)', fill: 'rgba(255,0,0,0.40)' },
    },
    9: {
      valid: { stroke: 'rgba(255,0,255,0.50)', fill: 'rgba(255,0,255,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.80)' },
      validSelected: { stroke: 'rgba(230,102,255,1.00)', fill: 'rgba(213,0,255,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,0.60)', fill: 'rgba(255,0,0,0.24)' },
      validHover: { stroke: 'rgba(230,102,255,0.80)', fill: 'rgba(230,102,255,0.64)' },
      invalidHover: { stroke: 'rgba(255,0,0,0.50)', fill: 'rgba(255,0,0,0.40)' },
    },
  },
  attributeColor: [
    {
      valid: { stroke: 'rgba(204,204,204,1.00)', fill: 'rgba(204,204,204,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.40)' },
      validSelected: { stroke: 'rgba(204,204,204,1.00)', fill: 'rgba(204,204,204,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
      validHover: { stroke: 'rgba(204,204,204,1.00)', fill: 'rgba(204,204,204,0.80)' },
      invalidHover: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
    },
    {
      valid: { stroke: 'rgba(153,51,255,1.00)', fill: 'rgba(153,51,255,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.40)' },
      validSelected: { stroke: 'rgba(153,51,255,1.00)', fill: 'rgba(153,51,255,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
      validHover: { stroke: 'rgba(153,51,255,1.00)', fill: 'rgba(153,51,255,0.80)' },
      invalidHover: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
    },
    {
      valid: { stroke: 'rgba(51,254,51,1.00)', fill: 'rgba(51,254,51,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.40)' },
      validSelected: { stroke: 'rgba(51,254,51,1.00)', fill: 'rgba(51,254,51,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
      validHover: { stroke: 'rgba(51,254,51,1.00)', fill: 'rgba(51,254,51,0.80)' },
      invalidHover: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
    },
    {
      valid: { stroke: 'rgba(255,51,255,1.00)', fill: 'rgba(255,51,255,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.40)' },
      validSelected: { stroke: 'rgba(255,51,255,1.00)', fill: 'rgba(255,51,255,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
      validHover: { stroke: 'rgba(255,51,255,1.00)', fill: 'rgba(255,51,255,0.80)' },
      invalidHover: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
    },
    {
      valid: { stroke: 'rgba(204,255,51,1.00)', fill: 'rgba(204,255,51,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.40)' },
      validSelected: { stroke: 'rgba(204,255,51,1.00)', fill: 'rgba(204,255,51,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
      validHover: { stroke: 'rgba(204,255,51,1.00)', fill: 'rgba(204,255,51,0.80)' },
      invalidHover: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
    },
    {
      valid: { stroke: 'rgba(51,153,255,1.00)', fill: 'rgba(51,153,255,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.40)' },
      validSelected: { stroke: 'rgba(51,153,255,1.00)', fill: 'rgba(51,153,255,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
      validHover: { stroke: 'rgba(51,153,255,1.00)', fill: 'rgba(51,153,255,0.80)' },
      invalidHover: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
    },
    {
      valid: { stroke: 'rgba(255,153,51,1.00)', fill: 'rgba(255,153,51,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.40)' },
      validSelected: { stroke: 'rgba(255,153,51,1.00)', fill: 'rgba(255,153,51,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
      validHover: { stroke: 'rgba(255,153,51,1.00)', fill: 'rgba(255,153,51,0.80)' },
      invalidHover: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
    },
    {
      valid: { stroke: 'rgba(51,255,238,1.00)', fill: 'rgba(51,255,238,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.40)' },
      validSelected: { stroke: 'rgba(51,255,238,1.00)', fill: 'rgba(51,255,238,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
      validHover: { stroke: 'rgba(51,255,238,1.00)', fill: 'rgba(51,255,238,0.80)' },
      invalidHover: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
    },
    {
      valid: { stroke: 'rgba(255,221,51,1.00)', fill: 'rgba(255,221,51,0.40)' },
      invalid: { stroke: 'rgba(255,153,102,1.00)', fill: 'rgba(255,153,102,0.40)' },
      validSelected: { stroke: 'rgba(255,221,51,1.00)', fill: 'rgba(255,221,51,0.80)' },
      invalidSelected: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
      validHover: { stroke: 'rgba(255,221,51,1.00)', fill: 'rgba(255,221,51,0.80)' },
      invalidHover: { stroke: 'rgba(255,0,0,1.00)', fill: 'rgba(255,0,0,0.80)' },
    },
  ],
  lineColor: {
    1: 'rgba(102, 111, 255, 1 )',
    3: 'rgba(102, 230, 255, 1)',
    5: 'rgba(191, 255, 102, 1)',
    7: 'rgba(255, 230, 102, 1)',
    9: 'rgba(230, 102, 255, 1)',
  },
  attributeLineColor: [
    'rgba(204, 204, 204, 1)',
    'rgba(153, 51, 255, 1)',
    'rgba(51, 254, 51, 1)',
    'rgba(255, 51, 255, 1)',
    'rgba(204, 255, 51, 1)',
    'rgba(51, 153, 255, 1)',
    'rgba(255, 153, 51, 1)',
    'rgba(51, 255, 238, 1)',
    'rgba(255, 221, 51, 1)',
  ],
  color: 1,
  width: 2,
  opacity: 9,
};
