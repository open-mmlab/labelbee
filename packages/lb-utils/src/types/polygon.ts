/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-03-24 15:28:13
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-07-08 10:41:40
 */

export interface IPolygonData {
  sourceID: string;
  id: string;
  pointList: IPolygonPoint[];
  valid: boolean;
  order: number;
  textAttribute: string;
  attribute: string;
  isRect?: boolean; // 用于判断当前多边形矩形模式生成
}

export interface IPolygonPoint {
  x: number;
  y: number;
  specialPoint?: boolean; // 顶点是否特殊点
  specialEdge?: boolean; // 顶点与其下一个顶点连成的边是否为特殊边
}
