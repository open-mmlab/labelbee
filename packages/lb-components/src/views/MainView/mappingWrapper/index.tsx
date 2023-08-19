/**
 * @author lijingchi <lijingchi1@sensetime.com>
 * @file 映射视图的包裹组件，负责A图插槽和B图的数据处理
 * @date 2021-12-15
 */

import React, { useState, useEffect, useRef } from 'react';
import { withinRange } from '@/utils/math';
import { BasicOperationProvider } from '../tools/basicOperation';
import styles from './index.scss';
import { MappingWrapperDivide } from './MappingWrapperDivide';
import { ResizeLayer } from './ResizeLayer';
import { MappingView, IMappingViewGraphicProps } from './GraphicMappingView';
import { EAnnotationMapping, EUnitMark } from '@/constant/task';
import useSize from '@/hooks/useSize';
import { ImageMappingTag } from './ImageMappingTag';
import { getDependPattern } from '@/utils/tool/common';
import { connectComponent } from '@/utils/store';
import { IStyleState } from '@/models/toolStyle';
import { getFishEyesResult } from '@/service/pythonApi';
import { IMappingConfig } from '@/types/task';
import { Dispatch, AnyAction } from 'redux';
import _ from 'lodash';
import { useRequest, usePrevious } from 'ahooks';
import { EDependPattern } from '@/constant/tool';
import EventBus from '@/utils/EventBus';

interface IMappingWrapperProps extends IMappingViewGraphicProps {
  imageBSrc: string;
  imageASrc: string;
  rotate: number;
  mappingConfig: IMappingConfig;
  children?: JSX.Element;
  completeResult: { [key: string]: any };
  basicResult: any[];
  writtingResult: any;
  dependPattern?: EDependPattern;
  isCheckTool?: boolean;
  isAnnotatePage?: boolean;
}

export interface IMappingWrapperRenderProps extends IMappingWrapperProps {
  unitType?: EUnitMark;
}

export const MappingWrapperContext = React.createContext<{
  width: { left: number; right: number };
}>({
  width: {
    left: 0,
    right: 1,
  },
});

type PointList = Array<{ x: number; y: number; pointList?: PointList }>;
type PointArray = ICoordArray[];

const sensebeeRes2NumArray = (result: PointList) => {
  const array: PointArray = [];

  result.forEach((i) => {
    if (!i) {
      return;
    }

    if (i?.pointList) {
      i.pointList.forEach((p) => {
        array.push([p.x.decimalReserved(4), p.y.decimalReserved(4)]);
      });
    }

    if (i?.x !== undefined && i?.y !== undefined) {
      array.push([i.x.decimalReserved(4), i.y.decimalReserved(4)]);
    }
  });

  return array;
};

const fisheyeRes2SensebeeRes = (fishPointList: PointArray, result: any) => {
  let startIdx = 0;
  const res = _.cloneDeep(result);
  const isPositiveNum = (num: number | null) => num !== null && num >= 0;

  res.forEach((i: any, index: number) => {
    if (i?.pointList) {
      const transferedPointList: any[] = [];
      i.pointList.forEach((p: any) => {
        const x = fishPointList[startIdx][0];
        const y = fishPointList[startIdx][1];

        if (isPositiveNum(x) && isPositiveNum(y)) {
          transferedPointList.push({ ...p, x, y });
        }

        startIdx += 1;
      });
      i.pointList = transferedPointList;
    } else {
      const coord = fishPointList[index];
      i.x = coord ? coord[0] : null;
      i.y = coord ? coord[1] : null;
    }
  });

  return res.filter((i: ICoord) =>
    i.x !== undefined && i.y !== undefined ? isPositiveNum(i.x) && isPositiveNum(i.y) : true,
  );
};

const useRequestTransferRes = (
  result: any,
  setFn: (d: any) => void,
  mappingConfig: IMappingConfig,
  imageASize: ISize,
  requet: any,
) => {
  const { mappingType, fisheyeConfig } = mappingConfig;
  if (!result?.length) {
    setFn([]);
    return;
  }

  if (mappingType === EAnnotationMapping.Fisheye) {
    const xyArray = sensebeeRes2NumArray(result);

    if (!fisheyeConfig) {
      return;
    }

    if (xyArray.length > 0) {
      requet({
        point: xyArray,
        config: fisheyeConfig,
        fisheyeHeight: imageASize.height,
        fisheyeWidth: imageASize.width,
      });
    } else {
      setFn(result);
    }
  } else {
    setFn(result ?? []);
  }
};

/** 获取结果的特征值用于比对 */
const getResultArrayUnique = (result?: any[]) =>
  result
    ?.map(
      (i) => `${i.id}${JSON.stringify(i.pointList)}${i.x}${i.y}${i.text}${i.attribute}${i.label}`,
    )
    .join('');
/**
 * 映射包裹组件
 * 1、A图和B图的宽度调整
 * 2、B图的缩放支持
 * 3、B图的渲染数据注入（依赖数据、渲染数据、A图宽高）
 * 4、B图鱼眼映射的计算（原图和依赖信息）
 */
const MappingWrapper = connectComponent(
  ['toolStyle', 'imgAttribute'],
  (
    props: IMappingWrapperProps & {
      toolStyle: IStyleState;
      dispatch: Dispatch<AnyAction>;
      imgAttribute: IImageAttribute;
    },
  ) => {
    const {
      imageBSrc,
      writtingResult,
      stepList,
      step,
      rotate,
      imageASrc,
      children,
      completeResult,
      basicResult,
      toolStyle,
      mappingConfig,
      dispatch,
      imgAttribute,
      isCheckTool,
      isAnnotatePage,
    } = props;

    const { mappingType } = mappingConfig;
    const [left, setLeft] = useState(0.5);
    const [onResize, setOnResize] = useState(false);
    const [imgNode, setImgNode] = useState<HTMLImageElement | null>(null);
    const wraperRef = useRef<HTMLDivElement | null>(null);
    const wrapperSize = useSize(wraperRef);
    const [transferedResult, setTransferedResult] = useState([]);
    const [transferedBasicResult, setTransferedBasicResult] = useState([]);
    const [imageASize, setImageASize] = useState({ width: 0, height: 0 });
    const [imageBSize, setImageBSize] = useState({ width: 0, height: 0 });
    const leftPercentage = left.toPercentage(2);
    const imageBRef = React.useRef<any>(null);
    const [imageACurrentPos, setImageACurrentPos] = useState({ x: 0, y: 0 });
    const [imageACoord, setImageACoord] = useState<ICoord>({ x: 0, y: 0 });
    const [imageAZoom, setImageAZoom] = useState(0);

    const [imageALoaded, setImageALoaded] = useState(false);
    const [imageBLoaded, setImageBLoaded] = useState(false);

    const preWrittingResult = usePrevious(writtingResult);
    const preBasicResult = usePrevious(basicResult);

    const resRequest = useRequest(getFishEyesResult, {
      manual: true,
      onSuccess: (r: any) => {
        setTransferedResult(fisheyeRes2SensebeeRes(r.point_list, writtingResult));
      },
      onError: () => {
        setTransferedResult([]);
      },
      throttleWait: 300,
      throttleTrailing: true,
    });

    const basicResRequest = useRequest(getFishEyesResult, {
      manual: true,
      onSuccess: (r: any) => {
        setTransferedBasicResult(fisheyeRes2SensebeeRes(r.point_list, basicResult));
      },
      onError: () => {
        setTransferedBasicResult([]);
      },
      throttleWait: 300,
      throttleTrailing: true,
    });

    const changeLeftZoom = (zoom: number) => {
      dispatch({
        type: 'toolStyle/setLeftZoom',
        payload: {
          leftZoom: zoom,
        },
      });
    };

    const size = {
      width: wrapperSize?.width ? wrapperSize?.width * left : 0,
      height: wrapperSize?.height ?? 0,
    };

    const right = 1 - left;

    const dependPattern = props.dependPattern ?? getDependPattern(step, stepList, completeResult);

    const changeImageBCurrentPosAndZoom = (
      params: { zoom: number; currentPos: ICoord },
      changeInnerZoom: boolean = false,
    ) => {
      if (imageBRef?.current) {
        changeLeftZoom(params.zoom);
        if (changeInnerZoom) {
          imageBRef.current.innerZoom = params.zoom;
        }
        imageBRef?.current?.updatePosDirectly(params);
      }
    };

    useEffect(() => {
      EventBus.singleOn('imageACurrentPosOrZoomChanged', (params: any) => {
        if (params.zoom) {
          setImageAZoom(params.zoom);
        }

        if (params.currentPos) {
          setImageACurrentPos(params.currentPos);
        }
      });
      EventBus.singleOn('imageACoordChanged', ({ coord }: { coord: ICoord }) => {
        setImageACoord(coord);
      });
    }, []);

    useEffect(() => {
      if (imgAttribute.syncMappingView) {
        changeImageBCurrentPosAndZoom({ currentPos: imageACurrentPos, zoom: imageAZoom }, true);
      }
    }, [imageACurrentPos, imageAZoom, imgAttribute.syncMappingView]);

    useEffect(() => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = imageBSrc;
      setImageBLoaded(false);

      img.onload = () => {
        setImgNode(img);
        setImageBSize({
          width: img.width,
          height: img.height,
        });

        setImageBLoaded(true);
      };
    }, [imageBSrc]);

    useEffect(() => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = imageASrc;
      setImageALoaded(false);

      img.onload = () => {
        setImageASize({
          width: img.width,
          height: img.height,
        });

        setImageALoaded(true);
      };
    }, [imageASrc]);

    useEffect(() => {
      /** 禁止查看模式在步骤节点数据hover时触发更新 */
      if (getResultArrayUnique(writtingResult) === getResultArrayUnique(preWrittingResult)) {
        return;
      }

      useRequestTransferRes(
        writtingResult,
        setTransferedResult,
        mappingConfig,
        imageASize,
        resRequest.run,
      );
    }, [writtingResult]);

    useEffect(() => {
      if (getResultArrayUnique(preBasicResult) !== getResultArrayUnique(basicResult)) {
        useRequestTransferRes(
          basicResult,
          setTransferedBasicResult,
          mappingConfig,
          imageASize,
          basicResRequest.run,
        );
      }
    }, [basicResult]);

    useEffect(() => {
      /** 图片加载后判断宽高是否在误差内，若在开启同步缩放 */
      if (imageALoaded && imageBLoaded && isAnnotatePage) {
        const SYNC_WHILE_DIFF = 0.03;
        const widthInDiff = Math.abs(imageASize.width / imageBSize.width - 1) < SYNC_WHILE_DIFF;
        const heightInDiff = Math.abs(imageASize.height / imageBSize.height - 1) < SYNC_WHILE_DIFF;
        if (widthInDiff && heightInDiff) {
          dispatch({
            type: 'imgAttribute/changeImgAttribute',
            payload: {
              syncMappingView: true,
            },
          });
        }
      }
    }, [imageALoaded, imageBLoaded]);

    return (
      <MappingWrapperContext.Provider value={{ width: { left, right } }}>
        <div className={styles.mappingWrapper} ref={wraperRef}>
          <div style={{ width: leftPercentage, background: '#ccc' }}>
            <ImageMappingTag imageType='B' mappingType={mappingType} />

            <BasicOperationProvider
              size={size}
              rotate={rotate}
              imgNode={imgNode}
              zoom={toolStyle.leftZoom}
              zoomChange={changeLeftZoom}
              imageACoord={imageACoord}
              wrapperStyle={{
                cursor: 'initial',
                overflow: 'hidden',
              }}
              imageType='B'
              basicResult={
                ![EDependPattern.dependOrigin, EDependPattern.noDepend].includes(dependPattern) &&
                transferedBasicResult?.length === 1
                  ? transferedBasicResult[0]
                  : undefined
              }
              dependPattern={dependPattern}
              disableReszieAndMove={imgAttribute?.syncMappingView}
              onRef={(basicOperationRef) => {
                imageBRef.current = basicOperationRef;
              }}
            >
              <MappingView
                transferedResult={transferedResult}
                stepList={stepList}
                step={step}
                completeResult={completeResult}
                basicResult={transferedBasicResult}
                isCheckTool={isCheckTool}
                isAnnotatePage={isAnnotatePage}
              />
            </BasicOperationProvider>
          </div>

          <MappingWrapperDivide
            left={leftPercentage}
            onMouseDown={() => {
              setOnResize(true);
            }}
            onMouseUp={() => {
              setOnResize(false);
            }}
          />
          <div style={{ width: right.toPercentage(), position: 'relative' }}>
            <ImageMappingTag imageType='A' />
            {children}
          </div>
        </div>

        <ResizeLayer
          onResize={onResize}
          cancelResize={() => {
            setOnResize(false);
          }}
          updateOffset={(offsetX: number) => {
            const updatedLeft = (left + offsetX).decimalReserved(2);
            setLeft(withinRange(updatedLeft, [0.2, 0.8]));
          }}
        />
      </MappingWrapperContext.Provider>
    );
  },
);

/**
 * 映射渲染组件，根据unitType判断是否渲染成映射视图
 * @param IMappingWrapperRenderProps
 */
export const MappingWrapperRender = (props: IMappingWrapperRenderProps) => {
  const { unitType, children } = props;
  const isCustomUnit = unitType === EUnitMark.Custom;

  if (!children) {
    return null;
  }

  if (isCustomUnit) {
    return <MappingWrapper {...props}>{children}</MappingWrapper>;
  }

  return children;
};

export default MappingWrapper;
