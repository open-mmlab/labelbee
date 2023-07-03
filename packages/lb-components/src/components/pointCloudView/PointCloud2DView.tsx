import { getClassName } from '@/utils/dom';
import React, { useContext, useEffect, useState } from 'react';
import { PointCloudContainer } from './PointCloudLayout';
import { PointCloudContext } from './PointCloudContext';
import { connect } from 'react-redux';

import { pointCloudLidar2image } from '@labelbee/lb-annotation';
import { LabelBeeContext } from '@/store/ctx';
import { a2MapStateToProps, IA2MapStateProps } from '@/store/annotation/map';
import { toolStyleConverter } from '@labelbee/lb-utils';
import PointCloud2DSingleView from './PointCloud2DSingleView';
import TitleButton from './components/TitleButton';

// TODO, It will be deleted when the exported type of lb-annotation is work.
interface IAnnotationDataTemporarily {
  type: string;
  annotation: any;
}

const PointCloud2DView = ({ currentData, config }: IA2MapStateProps) => {
  const [annotations2d, setAnnotations2d] = useState<IAnnotationDataTemporarily[]>([]);
  const { topViewInstance, displayPointCloudList } = useContext(PointCloudContext);
  const [selectedID, setSelectedID] = useState('');

  useEffect(() => {
    if (topViewInstance && currentData?.mappingImgList && currentData?.mappingImgList?.length > 0) {
      const defaultViewStyle = {
        fill: 'transparent',
        color: 'green',
      };
      let newAnnotations2dList: any = [];
      currentData?.mappingImgList.forEach((mappingData: any) => {
        const newAnnotations2d: IAnnotationDataTemporarily[] = displayPointCloudList.reduce(
          (acc: IAnnotationDataTemporarily[], pointCloudBox) => {
            const { transferViewData: viewDataPointList, viewRangePointList } =
              pointCloudLidar2image(pointCloudBox, mappingData.calib, {
                createRange: pointCloudBox.id === selectedID,
              });

            const stroke = toolStyleConverter.getColorFromConfig(
              { attribute: pointCloudBox.attribute },
              {
                ...config,
                attributeConfigurable: true,
              },
              {},
            )?.stroke;
            const viewDataPointLists = formatViewDataPointList({
              viewDataPointList,
              pointCloudBox,
              defaultViewStyle,
              stroke,
            });
            const newArr = [...acc, ...viewDataPointLists];

            if (pointCloudBox.id === selectedID && viewRangePointList.length > 0) {
              newArr.push({
                type: 'polygon',
                annotation: {
                  id: selectedID,
                  pointList: viewRangePointList,
                  ...defaultViewStyle,
                  stroke,
                  fill: 'rgba(255, 255, 255, 0.6)',
                },
              });
            }

            return newArr;
          },
          [],
        );
        newAnnotations2dList.push({
          newAnnotations2d,
          url: mappingData?.url,
          calName: mappingData.calib?.calName,
        });
      });
      setAnnotations2d(newAnnotations2dList);
    }
  }, [displayPointCloudList, currentData?.mappingImgList, selectedID]);

  const formatViewDataPointList = ({
    viewDataPointList,
    pointCloudBox,
    defaultViewStyle,
    stroke,
  }: any) => {
    return viewDataPointList!.map((v: any) => {
      return {
        type: v.type,
        annotation: {
          id: pointCloudBox.id,
          pointList: v.pointList,
          ...defaultViewStyle,
          stroke,
        },
      };
    });
  };
  const hiddenData =
    !currentData || !currentData?.mappingImgList || !(currentData?.mappingImgList?.length > 0);

  if (annotations2d?.length > 0) {
    return (
      <>
        {annotations2d.map((item: any, index: number) => (
          <PointCloudContainer
            className={getClassName('point-cloud-2d-container')}
            title={
              <TitleButton
                title={item?.calName}
                onClick={() => {}}
                style={{ background: 'rgba(0, 0, 0, 0.74)', color: '#FFFFFF' }}
              />
            }
            titleOnSurface={true}
            style={hiddenData ? { display: 'none' } : { display: 'flex' }}
            key={index}
          >
            {item?.newAnnotations2d && item?.url && (
              <PointCloud2DSingleView mappingData={item} setSelectedID={setSelectedID} />
            )}
          </PointCloudContainer>
        ))}
      </>
    );
  }
  return null;
};

export default connect(a2MapStateToProps, null, null, { context: LabelBeeContext })(
  PointCloud2DView,
);
