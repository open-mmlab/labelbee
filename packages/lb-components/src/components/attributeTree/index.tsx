/**
 * @file 点云 - 多层级属性的展示与交互
 * @date 2023年3月10日
 */

import { Radio } from 'antd/es';
import React, { useEffect, useState } from 'react';

import { ColorTag } from '@/components/colorTag';
import { NULL_COLOR } from '@/data/Style';
import { classnames } from '@/utils';
import { sidebarCls } from '@/views/MainView/sidebar';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';

import { IAttributeForPointCloud, IAttributeListForPointCloud } from './type';
import { countChildren, getParents, isParentNode, traverseDF } from './utils';

interface IProps {
  /** 多层级属性列表 */
  attributeListForPointCloud: IAttributeListForPointCloud;
  /** 选中属性 */
  selectedAttribute?: string;
  /** 更改属性方法 */
  attributeChanged: (v: string) => void;
}

const initialList = [{ key: '无属性', value: '', color: NULL_COLOR }];

const AttributeTree = (props: IProps) => {
  const { attributeListForPointCloud, selectedAttribute = '', attributeChanged } = props;
  /** 每个父节点有多少个叶子节点的映射 */
  const [valueMapCount, setValueMapCount] = useState<{ [key: string]: number }>({});
  /** 每个叶子节点的父节点映射 */
  const [valueMapParents, setValueMapParents] = useState<{ [key: string]: string[] }>({});
  /** 将整个tree数据平铺渲染 */
  const [list, setList] = useState<IAttributeListForPointCloud>(initialList);
  /** 展开的父节点value */
  const [expendValues, setExpendValues] = useState<string[]>([]);

  useEffect(() => {
    const nextValueMapCount: typeof valueMapCount = {};
    const nextExpendValues: typeof expendValues = [];
    const nextList: typeof list = [...initialList];

    traverseDF(attributeListForPointCloud, (node: IAttributeForPointCloud) => {
      if (isParentNode(node)) {
        nextExpendValues.push(node.value);
      }
      nextValueMapCount[node.value] = countChildren(node);
      nextList.push(node);
    });

    setList(nextList);
    setExpendValues(nextExpendValues);
    setValueMapCount(nextValueMapCount);
    setValueMapParents(getParents(attributeListForPointCloud));
  }, [attributeListForPointCloud]);

  const needRender = (parents: string[]) => {
    if (!parents) {
      return true;
    }

    return parents.every((item) => expendValues.includes(item));
  };

  const renderParentNode = (node: IAttributeForPointCloud) => {
    return (
      <>
        {expendValues.includes(node.value) ? (
          <CaretDownOutlined
            onClick={() => {
              setExpendValues((prev) => {
                return prev.filter((v) => v !== node.value);
              });
            }}
          />
        ) : (
          <CaretRightOutlined
            onClick={() => {
              setExpendValues((prev) => {
                return prev.concat(node.value);
              });
            }}
          />
        )}

        <div className={`${sidebarCls}__attributeTree__title`}>{node.key}</div>
        <div className={`${sidebarCls}__attributeTree__count`}>
          ({valueMapCount[node.value] ?? 0})
        </div>
      </>
    );
  };

  const renderLeafNode = (node: IAttributeForPointCloud) => {
    return (
      <Radio
        onChange={(e) => {
          attributeChanged(e.target.value);
        }}
        value={node.value}
        key={node.value}
        checked={node.value === selectedAttribute}
        className={`${sidebarCls}__attributeTree__listItem__radio-wrapper`}
      >
        <span className='sensebee-radio-label' title={node.value}>
          <ColorTag color={node.color} style={{ marginRight: '8px' }} />
          {node.key}
        </span>
      </Radio>
    );
  };

  return (
    <div className={`${sidebarCls}__attributeTree`}>
      {list.map((item, index) => {
        const parents = valueMapParents[item.value];

        if (!needRender(parents)) {
          return null;
        }

        const parentsLength = parents?.length ?? 0;

        const isParent = isParentNode(item);

        return (
          <div
            style={{
              paddingLeft: parentsLength * 16,
            }}
            key={index}
            className={classnames({
              [`${sidebarCls}__attributeTree__listItem`]: true,
            })}
          >
            {isParent ? renderParentNode(item) : renderLeafNode(item)}
          </div>
        );
      })}
    </div>
  );
};

export default AttributeTree;
