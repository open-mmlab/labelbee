import { Tooltip } from 'antd';
import React, { useState } from 'react';

// 图片调整的刷子
import clearSmall from '@/assets/annotation/common/icon_clearSmall.svg';
// import clearSmallA from '@//assets/annotation/common/icon_clearSmall_a.svg';
import { InitImgAttribute } from '@/store/imgAttribute/actionCreators';
import { store } from '@/index';
import clearSmallA from '@//assets/annotation/common/icon_clearSmall_a.svg';

const clearIcon = () => {
  const [hoverDelete, setHoverDelete] = useState(false);

  const clearAttribute = () => {
    store.dispatch(InitImgAttribute());
  };
  return (
    <Tooltip placement="bottom" title="还原图片属性">
      <img
        onMouseEnter={() => setHoverDelete(true)}
        onMouseLeave={() => setHoverDelete(false)}
        style={{ marginLeft: 6 }}
        src={hoverDelete ? clearSmallA : clearSmall}
        onClick={(e) => {
          e.stopPropagation();
          clearAttribute();
        }}
      />
    </Tooltip>
  );
};

export default clearIcon;
