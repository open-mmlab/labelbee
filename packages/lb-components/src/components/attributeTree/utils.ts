import { IAttributeListForPointCloud } from './type';

interface Node {
  children?: Node[];
  [key: number | string]: any;
}

// 深度优先遍历数组 对数组中的每一项执行callback 会修改传入的参数data
export const traverseDF = <T extends { children?: T[] }>(
  data: T[],
  callback: (item: T, index: number, arr: T[]) => void,
) => {
  data.forEach((item, index, arr) => {
    callback(item, index, arr);
    if (item.children) {
      traverseDF(item.children, callback);
    }
  });
};

export const getParents = (treeData: IAttributeListForPointCloud) => {
  const valueMapParents: { [key: string]: string[] } = {};
  const myData = JSON.parse(JSON.stringify(treeData));
  let queue = myData;
  let currentNode = queue.shift();
  while (currentNode) {
    if (currentNode.children) {
      currentNode.children.forEach((item: Node) => {
        if (valueMapParents[currentNode.value]?.length) {
          valueMapParents[item.value] = valueMapParents[currentNode.value].concat(
            currentNode.value,
          );
        } else {
          valueMapParents[item.value] = [currentNode.value];
        }

        queue.push(item);
      });
    }
    currentNode = queue.shift();
  }
  return valueMapParents;
};

export const isParentNode = (node: Node) => {
  return Boolean(node.children && node.children?.length > 0);
};

export const countChildren = (node: Node) => {
  let count = 0;
  node.children?.forEach((child) => {
    if (isParentNode(child)) {
      count += countChildren(child);
      return;
    }
    count++;
  });
  return count;
};
