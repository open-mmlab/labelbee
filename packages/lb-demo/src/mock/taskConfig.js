import { cTool } from '@labelbee/lb-annotation';
const { EVideoToolName, EToolName, EPointCloudName, EAudioToolName } = cTool;

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

const scribbleToolConfig = {
  attributeList: [
    { key: '类别1', value: '类别1', color: 'rgba(128, 12, 249, 1)' },
    { key: '类别bm', value: 'class-bm', color: 'rgba(0, 255, 48, 1)' },
    { key: '类别eg', value: 'class-eg', color: 'rgba(255, 136, 247, 1)' },
    { key: '类别vj', value: 'class-vj', color: 'rgba(255, 226, 50, 1)' },
    { key: '类别0x', value: 'class-0x', color: 'rgba(153, 66, 23, 1)' },
    { key: '类别GR', value: 'class-GR', color: 'rgba(2, 130, 250, 1)' },
    { key: '类别2c', value: 'class-2c', color: 'rgba(220,94,94,1)' },
    { key: '类别Bj', value: 'class-Bj', color: 'rgba(0, 255, 234, 1)' },
  ],
  showConfirm: true,
  showDirection: false,
  skipWhileNoDependencies: false,
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

const textToolConfig = {
  "showConfirm": true,
  "showDirection": false,
  "skipWhileNoDependencies": false,
  "configList": [
    {
      "label": "文本",
      "key": "text",
      "required": false,
      "default": "",
      "maxLength": 1000
    },
    {
      "label": "文本2",
      "key": "text2",
      "required": false,
      "default": "",
      "maxLength": 1000
    },
    {
      "label": "文本3",
      "key": "text3",
      "required": false,
      "default": "",
      "maxLength": 1000
    }
  ],
  "filterData": [
    "valid",
    "invalid"
  ]
}

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

  showLineLength: true,
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
  // 主属性
  attributeList: [
    {
      key: '类别1',
      value: '类别1',
    },
    {
      key: '类别8f',
      value: 'class-8f',
    },
    {
      key: '类别My',
      value: 'class-My',
    },
    {
      key: '类别cN',
      value: 'class-cN',
    },
    {
      key: '类别4H',
      value: 'class-4H',
    },
  ],
  // 标注半径范围
  radius: 90,
  // 副属性配置开关
  secondaryAttributeConfigurable: true,
  // 副属性
  inputList: [
    {
      key: '类别1',
      value: 'class1',
      subSelected: [
        { key: '选项1-1', value: 'option1' },
        { key: '选项1-2', value: 'option2' },
      ],
    },
    {
      key: '类别v0',
      value: 'class-v0',
      subSelected: [
        { key: '选项2-1', value: 'option2-1' },
        { key: '选项2-2', value: 'option2-2' },
        { key: '选项2-3', value: 'option2-3' },
        { key: '选项2-4', value: 'option2-4' },
        { key: '选项2-5', value: 'option2-5' },
        { key: '选项2-6', value: 'option2-6' },
      ],
    },
    {
      key: '类别Rt',
      value: 'class-Rt',
      subSelected: [{ key: '选项3-1', value: 'option3-1' }],
    },
  ],
  // 框内点数下限
  lowerLimitPointsNumInBox: 5,
  // attributeConfigurable: true,
  trackConfigurable: true,
};

const cuboidToolConfig = {
  isShowCursor: false,
  showConfirm: false,
  skipWhileNoDependencies: false,
  drawOutsideTarget: false,
  copyBackwardResult: true,
  minWidth: 1,
  attributeConfigurable: true,
  textConfigurable: true,
  textCheckType: 0,
  customFormat: '',
  attributeList: [
    {
      key: '跑车',
      value: 'sports car',
    },

    {
      key: '吉普车',
      value: 'jeep',
    },
    {
      key: '紧凑车型',
      value: 'single',
    },
    {
      key: 'SUV等车型',
      value: 'suv',
    },
    {
      key: '货车',
      value: 'trucks',
    },
  ],
};

const LLMToolConfig = {
  enableSort: true, // 开启答案排序
  enableTextAttribute: true, // 文本标注
  score: 7, // 答案评分
  indicatorScore: [
    { label: '可读性', value: 'readability', text: '阅读起来是否顺畅', score: 10 },
    { label: '不可读性', value: 'unReadability', text: '偶是基督教精神', score: 10 },
  ], // 指标评分
  indicatorDetermine: [
    { label: '包含敏感信息', value: 'sensitiveInfo' },
    { label: '包含敏感信息2', value: 'sensitiveInfo2' },
  ], // 指标判断
  dataType: {
    prompt: 'picture',
    response: 'text',
  },
  isTextEdit: true, // 是否打开文本编辑
  textEdit: [
    {
      title: 1,
      min: 11,
      max: 1000,
      isFillAnswer: true, // 是否填充答案
      isLaText: true, // 是否打开LaTex编辑
      textControl: true // 文本对照
    },
    {
      title: 2,
      min: 10,
      isFillAnswer: false, // 是否填充答案
      textControl: true // 文本对照
    },
    {
      title: 3,
      max: 100,
      isFillAnswer: true, // 是否填充答案
      textControl: false // 文本对照
    },
    {
      title: 4,
      isFillAnswer: false, // 是否填充答案
      textControl: false // 文本对照
    },
  ],
};

const audioToolConfig = {
  "showConfirm": true,
  "showDirection": false,
  "skipWhileNoDependencies": false,
  "configList": [
    {
      "label": "测试文本",
      "key": "text",
      "required": false,
      "default": "",
      "maxLength": 1000
    }
  ],
  "inputList": [
    {
      "key": "类别1",
      "value": "class1",
      "isMulti": false,
      "subSelected": [
        {
          "key": "选项1",
          "value": "option1",
          "isDefault": false
        }
      ]
    },
    {
      "key": "类别xl",
      "value": "class-xl",
      "isMulti": false,
      "subSelected": [
        {
          "key": "选项2-1",
          "value": "option2-1",
          "isMulti": false
        }
      ]
    },
    {
      "key": "类别dg",
      "value": "class-dg",
      "isMulti": false,
      "subSelected": [
        {
          "key": "选项3-1",
          "value": "option3-1",
          "isMulti": false
        }
      ]
    }
  ],
  "tagConfigurable": true,
  "textConfigurable": true,
  "filterData": [
    "valid",
    "invalid"
  ],
  "clipConfigurable": true,
  "clipTextConfigurable": true,
  "clipAttributeList": [
    {
      "key": "类别1",
      "value": "类别1"
    },
    {
      "key": "类别Jy",
      "value": "class-Jy"
    },
    {
      "key": "类别JU",
      "value": "class-JU"
    },
    {
      "key": "类别EZ",
      "value": "class-EZ"
    },
    {
      "key": "类别4E",
      "value": "class-4E"
    }
  ],
  "clipAttributeConfigurable": true
}


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

  if (tool === EVideoToolName.VideoTextTool) {
    return textToolConfig;
  }

  if (tool === EPointCloudName.PointCloud) {
    return pointCloudConfig;
  }

  if (tool === EToolName.ScribbleTool) {
    return scribbleToolConfig;
  }

  if (tool === EToolName.Cuboid) {
    return cuboidToolConfig;
  }

  if (tool === EToolName.LLM) {
    return LLMToolConfig;
  }

  if (tool === EAudioToolName.AudioTextTool) {
    return audioToolConfig
  }

  return rectToolConfig;
};

export const getStepList = (tool, sourceStep, step) => {
  return [getStepConfig(tool)];
};

const getStepConfig = (tool, step, sourceStep) => {
  let toolList = tool ?? EToolName.Rect;
  let toolName = tool;

  const splitChar = ' ';
  if (toolList.indexOf(splitChar) > -1) {
    toolList = tool.split(splitChar);
    toolName = toolList[toolList.length - 1];
  }

  return {
    step: step ?? 1,
    dataSourceStep: sourceStep || 0,
    tool: toolList,
    config: JSON.stringify(getConfig(toolName)),
  };
};

export const getDependStepList = (toolsArray) =>
  toolsArray.map((tool, index) => getStepConfig(tool, index + 1, index));
