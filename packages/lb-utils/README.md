# `@labelbee/lb-utils`

> TODO: description

## Usage

```
const lbUtils = require('@labelbee/lb-utils');

// TODO: DEMONSTRATE API
```



### ToolStyleConverter
 
```ts
import { toolStyleConverter } from '@labelbee/lb-utils';

interface IToolStyle {
  stroke: string;
  fill: string;
}

const styleConfig = {
  borderOpacity: 1, // range: [0,1]
  fillOpacity: 0.2, // range: [0,1]
  colorIndex: 0, // range: 0 1 2 3 4 
};

// Basic Pattern
const result1 = {};
const rectConfig1 = {};

const data1: IToolStyle = toolStyleConverter.getColorFromConfig(
  result1
  rectConfig1,
  styleConfig,
);

// Attribute
const result2 = {
  attribute: 'value1',
};

const rectConfig2 = {
  attributeConfigurable: true,
  attributeList: [
    { key: 'key1', value: 'value1' },
    { key: 'key2', value: 'value2' },
  ]
};

const data2: IToolStyle = toolStyleConverter.getColorFromConfig(
  result2
  rectConfig2,
  styleConfig,
);

// MultiColor
const result3 = {};

const rectConfig3 = {};

const multiColorIndex = 0; // CurrentResultIndex

const data3: IToolStyle = toolStyleConverter.getColorFromConfig(
  result3
  rectConfig3,
  styleConfig,
  {
    multiColorIndex
  }
);

// invalid
const result4 = {
  valid: false
};
const rectConfig4 = {};

const data4: IToolStyle = toolStyleConverter.getColorFromConfig(
  result4
  rectConfig4,
  styleConfig,
);

// hover / selected
const result4 = {};
const rectConfig4 = {};

const status = {
  hover: true,
  // selected: true,
}

const data4: IToolStyle = toolStyleConverter.getColorFromConfig(
  result4
  rectConfig4,
  styleConfig,
  status
);
```