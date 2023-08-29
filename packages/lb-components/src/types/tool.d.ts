export interface IShortcut {
  name: string;
  icon?: any;
  shortCut?: string[];
  noticeInfo?: string;
  linkSymbol?: string;
}

export interface IEntityDetail {
  entityID: number;
  no: string;
  nameZH: string;
  nameEN: string;
  descriptionZH: string;
  descriptionEN: string;
  imgList: Array<{
    key: string;
    url: string;
  }>;
}
