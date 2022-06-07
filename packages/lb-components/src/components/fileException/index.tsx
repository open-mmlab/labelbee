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
  fileTypeName: string;
}

const FileException: React.FC<IFileExceptionProps> = ({
  invalidProps,
  errorProps,
  fileTypeName,
}) => {
  if (!invalidProps.isValid) {
    return <FileInvalid {...{ fileTypeName, ...invalidProps }} />;
  }

  if (errorProps.isError) {
    return <FileError {...{ fileTypeName, ...errorProps }} />;
  }
  return null;
};

export default FileException;
