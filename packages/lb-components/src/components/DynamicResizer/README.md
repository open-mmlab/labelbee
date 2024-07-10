# DynamicResizer Component

The `DynamicResizer` component is a React component that allows users to resize two sections (top and bottom) by dragging a divider. This component is useful for creating resizable layouts where the user can adjust the height of the sections.

## Features

- **Resizable Sections**: Allows users to resize the top and bottom sections by dragging a divider.
- **Local Storage**: Stores the height of the sections in local storage to preserve the state between sessions.
- **Reset Height**: Provides methods to reset the height of the top or bottom section to zero.

## Installation

Install the required dependencies using npm or yarn:

```bash
npm install react-draggable
# or
yarn add react-draggable
```

## Usage

```
import React from 'react';
import DynamicResizer from './DynamicResizer';

const App = () => {
  return (
    <DynamicResizer
      minTopSize={50}
      minBottomSize={50}
      localKey='localKey'
      defaultHeight={100}
    >
      <div>Top Section Content</div>
      <div>Bottom Section Content</div>
    </DynamicResizer>
  );
};

export default App;
```

## Props

| Prop               | Type                         | Default                 | Description                                      |
| ------------------ | ---------------------------- | ----------------------- | ------------------------------------------------ |
| `minTopHeight`     | `number`                     | `0`                     | The minimum height of the top section.           |
| `minBottomHeight`  | `number`                     | `0`                     | The minimum height of the bottom section.        |
| `defaultHeight`    | `number`                     | `50`                    | The default height                               |
| `localKey`         | `string`                     | `dynamicResizerHeights` | The height of component cache                    |
| `children`         | `ReactElement[]、 Element[]` |                         | Must have two child elements wrapped around it！ |
| `isShortcutButton` | `boolean`                    | `false`                 | Is the shortcut button enabled                   |
