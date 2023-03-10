export interface IAttributeForPointCloud {
  key: string;
  value: string;
  color?: string; // 可选属性
  children?: IAttributeForPointCloud[];
}

export type IAttributeListForPointCloud = Array<IAttributeForPointCloud>

interface DataNode {
  attribute: string;
  //   [key: string]: string;
}

export interface AttrDataNode extends DataNode {
  color?: string;
  children?: AttrDataNode[];
}
