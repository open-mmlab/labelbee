import {
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import React from 'react'
import { prefix } from '@/constant';
import { PageInput } from '../Pagination'

const FolderPagination = (props: {
  folderBack: () => void;
  folderSkip?: (folderNum?: string) => void;
  folderIndex: number;
  folderNum: number;
  folderForward: () => void;
}) => {
  const { folderBack, folderSkip, folderIndex, folderNum, folderForward } = props;

  if (folderIndex >= 0 && folderNum >= 0) {
    return (
      <div className={`${prefix}-footer__pagination`}>
        <LeftOutlined className={`${prefix}-footer__highlight`} onClick={folderBack} />
        文件夹{' '}
        {folderSkip ? (
          <PageInput imgIndex={folderIndex} jumpSkip={folderSkip} />
        ) : (
          folderIndex + 1
        )}{' '}
        /<span className={`${prefix}-footer__pageAll`}>{folderNum}</span>
        <RightOutlined className={`${prefix}-footer__highlight`} onClick={folderForward} />
      </div>
    );
  }

  return null;
};

export default FolderPagination
