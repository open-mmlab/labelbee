import { EPageTurningOperation } from '../data/enums/AnnotationSize';
import _ from 'lodash';
import { jsonParser } from '.';

interface IPageInfo {
  fileIndex: number;
  basicIndex: number;
  basicList: any[];
  fileList: any[];
  step: number;
  stepList: any[];
}

class PageOperator {
  public static getPageInfo(annotationStore: any) {
    const {
      imgIndex: fileIndex,
      imgList: fileList,
      basicResultList: basicList,
      basicIndex,
      step,
      stepList,
    } = annotationStore;

    return {
      fileIndex,
      basicIndex,
      basicList,
      fileList,
      step,
      stepList,
    };
  }

  /**
   *
   * @param pageTurningOperation
   * @param nextIndex
   */
  public static getNextPageInfo(
    pageTurningOperation: EPageTurningOperation,
    annotationStore: any,
    nextIndex?: number,
  ) {
    const pageInfo: IPageInfo = PageOperator.getPageInfo(annotationStore);
    const { fileIndex: currentFileIndex } = PageOperator.getPageInfo(annotationStore);

    const nextFileIndex = PageOperator.getNextFileIndex(pageTurningOperation, pageInfo, nextIndex);
    const nextBasicIndex = PageOperator.getNextBasicIndex(
      pageTurningOperation,
      pageInfo.basicIndex,
    );
    const fileIndexChanged = nextFileIndex !== currentFileIndex;

    const hasNextBasicIndex = PageOperator.hasNextBasicIndex(pageTurningOperation, pageInfo);

    const pageChangedInfo = {
      fileIndex: nextFileIndex,
      basicIndex: nextBasicIndex,
      fileIndexChanged,
      basicIndexChanged: hasNextBasicIndex,
    };

    if (hasNextBasicIndex) {
      pageChangedInfo.fileIndexChanged = false;
      pageChangedInfo.fileIndex = currentFileIndex;
      return pageChangedInfo;
    }

    pageChangedInfo.basicIndex =
      pageTurningOperation === EPageTurningOperation.Backward
        ? PageOperator.getBasicResultIndexForNextFile(pageInfo, pageChangedInfo.fileIndex)
        : 0;

    return pageChangedInfo;
  }

  /**
   * 获取下一个依赖索引
   * @param pageTurningOperation
   */
  public static getNextBasicIndex = (
    pageTurningOperation: EPageTurningOperation,
    basicIndex: number,
  ) => {
    return basicIndex + (pageTurningOperation === EPageTurningOperation.Forward ? 1 : -1);
  };

  /**
   * 存在下一个依赖数据
   * @param pageTurningOperation
   */
  public static hasNextBasicIndex = (
    pageTurningOperation: EPageTurningOperation,
    pageInfo: IPageInfo,
  ) => {
    const { basicList } = pageInfo;
    if (basicList?.length > 0) {
      const nextBasicIndex = PageOperator.getNextBasicIndex(
        pageTurningOperation,
        pageInfo.basicIndex,
      );

      return nextBasicIndex >= 0 && basicList.length > nextBasicIndex;
    }

    return false;
  };

  public static getBasicResultIndexForNextFile = (pageInfo: IPageInfo, fileIndex: number) => {
    const { stepList, step, fileList } = pageInfo;
    const stepConfig = stepList.find((i) => i.step === step);
    const dataSourceStep = stepConfig?.dataSourceStep;

    if (dataSourceStep) {
      const fileResult = jsonParser(fileList[fileIndex].result);
      const stepResult = fileResult[`step_${dataSourceStep}`]?.result;

      if (!stepResult || !stepResult?.length) {
        return 0;
      }

      return stepResult?.length - 1;
    }

    return 0;
  };

  /**
   * 计算下一个文件的索引
   * @param pageTurningOperation
   * @param fileIndex
   */
  public static getNextFileIndex = (
    pageTurningOperation: EPageTurningOperation,
    pageInfo: IPageInfo,
    fileIndex?: number,
  ) => {
    const { fileIndex: currentFileIndex, fileList } = pageInfo;

    let newIndex = fileIndex !== undefined ? fileIndex : currentFileIndex;
    switch (pageTurningOperation) {
      case EPageTurningOperation.Forward:
        newIndex += 1;
        break;
      case EPageTurningOperation.Backward:
        newIndex -= 1;
        break;
      case EPageTurningOperation.Jump:
        break;
    }

    if (_.inRange(newIndex, 0, fileList.length)) {
      return newIndex;
    }

    return currentFileIndex;
  };
}

export default PageOperator;
