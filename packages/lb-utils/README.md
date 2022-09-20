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


### ImgConversionUtils

For picture conversion, providing input single channel mask output color picture

#### Quick Start

```ts
import { ImgConversionUtils } from '@labelbee/lb-utils';

const maskSrc = 'http://10.152.32.16:8080/ADE_val_00001993.png';
const basicImgSrc = 'http://10.152.32.16:8080/ADE_val_00001993.jpg';

/**
 * Convert mask to color map
 */
ImgConversionUtils.getColorMapBySingleChannelMask(
  maskSrc,
  basicImgSrc,
  
).then(newImg => {
  // Update your images
});
```

Show by labelbee

```ts
import React, { useEffect, useState } from 'react';
import { AnnotationView } from '@labelbee/lb-components';
import { ImgConversionUtils } from '@labelbee/lb-utils';

const maskSrc = 'http://10.152.32.16:8080/ADE_val_00001993.png';
const basicImgSrc = 'http://10.152.32.16:8080/ADE_val_00001993.jpg';

const App = () => {
  const [imgSrc, setImgSrc] = useState(maskSrc);
  useEffect(() => {
    ImgConversionUtils.getColorMapBySingleChannelMask({
      maskSrc,
      basicImgSrc,
    }).then((newSrc) => {
      setImgSrc(newSrc);
    });
  }, []);

  return (
    <div style={{ height: 1000 }}>
      <AnnotationView
        src={imgSrc}
      />
    </div>
  )
}

```

#### Other Props

```ts
interface ICustomColor {
    channel?: number;
    color?: string;
}

declare class ImgConversionUtils {
    static getColorMapBySingleChannelMask: (params: {
        maskSrc: string;
        basicImgSrc?: string | undefined;
        customColor?: ICustomColor[] | undefined; // You can customize the color of the specified channel value
        opacity?: number | undefined; // You can customize the opacity of your mask.
    }) => Promise<string | undefined>;
}
export default ImgConversionUtils;

```