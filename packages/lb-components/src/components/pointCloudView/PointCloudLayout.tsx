import React from 'react';

export const PointCloudBlock = ({ title, toolbar, children }) => {
  return (
    <div>
      <div>
        <span>{title}</span>
        <span>{toolbar}</span>
      </div>

      <div>{children}</div>
    </div>
  );
};

export const PointCloudConteiner = ({ title, toolbar, children }) => {
  return (
    <div>
      <div>
        <span>{title}</span>
        <span>{toolbar}</span>
      </div>

      <div>{children}</div>
    </div>
  );
};
