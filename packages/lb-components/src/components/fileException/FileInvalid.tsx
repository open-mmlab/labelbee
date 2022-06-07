/**
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @file File invalid layer, display while isValid equal false
 * @date 2022-06-07
 */

import React from 'react';

export interface IFileInvalidProps {
  fileTypeName?: string;
  isValid: boolean;
}

const FileInvalid: React.FC<IFileInvalidProps> = ({ fileTypeName = '图片', isValid }) => {
  if (isValid) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        fontSize: 30,
        opacity: 0.7,
        background: 'rgba(255, 87, 34, 1)',
        justifyContent: 'center',
      }}
    >
      {`无效${fileTypeName}，请跳过`}
    </div>
  );
};

export default FileInvalid;
