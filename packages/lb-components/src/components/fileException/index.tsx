/**
 * @author Glenfiddish <edwinlee0927@hotmail.com>
 * @file File exception layer, determine whether to render FileInvalid or FileError
 * @date 2022-06-07
 */

import React from 'react';
import FileError, { IFileErrorProps } from './FileError';
import FileInvalid, { IFileInvalidProps } from './FileInvalid';

interface IFileExceptionProps {
  errorProps: IFileErrorProps & { isError: boolean };
  invalidProps: IFileInvalidProps;
  fileType: string;
}

const FileException: React.FC<IFileExceptionProps> = ({ invalidProps, errorProps, fileType }) => {
  if (!invalidProps.isValid) {
    return <FileInvalid {...{ fileType, ...invalidProps }} />;
  }

  if (errorProps.isError) {
    return <FileError {...{ fileType, ...errorProps }} />;
  }
  return null;
};

export default FileException;
