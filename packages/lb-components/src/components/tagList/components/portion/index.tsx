/*
 * @file Used for tools to add overall label selections
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2024-02-22
 */

import React from 'react';
import TagList from '../../index';
import { IInputList, ITagListProps } from '../../types';

export default (props: ITagListProps) => {
  const inputList: IInputList[] = props?.inputList?.filter((i: IInputList) => !i?.isOverall) || [];
  return <TagList {...props} inputList={inputList} />;
};
