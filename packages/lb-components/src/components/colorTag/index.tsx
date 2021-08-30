import React from 'react';

export const ColorTag = ({ color, style }: any) => (
  <div
    style={{
      display: 'inline-block',
      height: 14,
      width: 14,
      backgroundColor: color,
      verticalAlign: 'middle',
      ...style,
    }}
  />
);
