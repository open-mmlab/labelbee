const MOCK_URL = 'http://bee-sdk-demo.sensebee.xyz/images/';
export const fileList = ['10', '19', '20', '66'].map((i) => `${MOCK_URL}${i}.jpg`);

export const rectDefaultResult = JSON.stringify({
  height: 200,
  width: 100,
  rotate: 0,
  step_1: {
    dataSource: 0,
    tool: 'rectTool',
    result: [
      {
        id: 'xs23da23a',
        sourceID: '0',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        valid: true,
        order: 1,
        attribute: '',
        textAttribute: '',
      },
    ],
  },
});

export const tagDefaultResult = JSON.stringify({
  height: 200,
  width: 100,
  rotate: 0,
  step_1: {
    dataSource: 0,
    tool: 'tagTool',
    result: [],
  },
});

export const getMockResult = (tool) => {
  if (tool === 'rectTool') {
    return rectDefaultResult;
  }
  if (tool === 'tagTool') {
    return tagDefaultResult;
  }

  return '';
};
