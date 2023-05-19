import classNames from 'classnames';
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import { AppState } from '@/store';
import {
  BatchUpdateImgListResultByPredictResult,
  SetPointCloudLoading,
  SetPredictResult,
  SetPredictResultVisible,
} from '@/store/annotation/actionCreators';
import { IPointCloudBoxWithIndex } from '@/store/annotation/types';
import { LabelBeeContext, useDispatch } from '@/store/ctx';
import { IFileItem } from '@/types/data';
import { getClassName } from '@/utils/dom';
import { PointCloud } from '@labelbee/lb-annotation';
import { toolStyleConverter } from '@labelbee/lb-utils';

import { getViewsDataUrl, IBox, sleep, views } from './util';

interface IProps {
  imgList: IFileItem[];
  predictionResultVisible: boolean;
  predictionResult: IPointCloudBoxWithIndex[];
}

const PreviewResult = (props: IProps) => {
  const { predictionResult, predictionResultVisible, imgList } = props;

  const [list, setList] = useState<IBox[]>([]);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const close = () => {
    SetPredictResultVisible(dispatch, false);
    SetPredictResult(dispatch, []);
    setList([]);
  };

  const apply = async () => {
    SetPointCloudLoading(dispatch, true);
    await dispatch(BatchUpdateImgListResultByPredictResult());
    SetPointCloudLoading(dispatch, false);
    close();
  };

  return predictionResultVisible ? (
    <>
      {list.length > 0 && (
        <div className={getClassName('point-cloud-predict-tracking-container')}>
          <div className={getClassName('point-cloud-predict-tracking-container', 'bar')}>
            <div className={getClassName('point-cloud-predict-tracking-container', 'title')}>
              <div>
                {t('ComplementaryTrackingPrediction')}
                {list.length > 0 ? `（${list.length}）` : ''}
              </div>
              <div className={getClassName('point-cloud-predict-tracking-container', 'option')}>
                <div
                  className={classNames([
                    getClassName('point-cloud-predict-tracking-container', 'cancelOption'),
                    getClassName('point-cloud-predict-tracking-container', 'button'),
                  ])}
                  onClick={close}
                >
                  {t('Cancel')}
                </div>

                <div
                  className={classNames([
                    getClassName('point-cloud-predict-tracking-container', 'okOption'),
                    getClassName('point-cloud-predict-tracking-container', 'button'),
                  ])}
                  onClick={apply}
                >
                  {t('Apply')}
                </div>
              </div>
            </div>

            <div className={getClassName('point-cloud-predict-tracking-container', 'content')}>
              <Result list={list} />
            </div>
          </div>
        </div>
      )}
      {predictionResult.length > 0 && (
        <GenerateViewsDataUrl result={predictionResult} imgList={imgList} setList={setList} />
      )}
    </>
  ) : null;
};

const Result = (props: { list: IBox[] }) => {
  const { list } = props;
  const { t } = useTranslation();
  const viewsTitle = [t('TopView'), t('SideView'), t('BackView')];

  return (
    <>
      <div className={getClassName('point-cloud-predict-tracking-container', 'left')}>
        {viewsTitle.map((i) => (
          <div className={getClassName('point-cloud-predict-tracking-container', 'title')} key={i}>
            {i}
          </div>
        ))}
      </div>
      <div className={getClassName('point-cloud-predict-tracking-container', 'right')}>
        {list.map((i) => {
          return (
            <div
              className={getClassName('point-cloud-predict-tracking-container', 'item')}
              key={i.id}
            >
              {views.map((view) => {
                const url = i[view];
                return (
                  <div
                    className={getClassName('point-cloud-predict-tracking-container', 'view')}
                    key={`${i.id}-${view}`}
                  >
                    <img src={url} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
};

const GenerateViewsDataUrl = (props: {
  result: IPointCloudBoxWithIndex[];
  imgList: IFileItem[];
  setList: (list: IBox[]) => void;
}) => {
  const ptCtx = React.useContext(PointCloudContext);
  const dispatch = useDispatch();

  const { result, imgList, setList } = props;

  const ref = useRef<HTMLDivElement>(null);

  const size = {
    width: 600,
    height: 600,
  };

  useEffect(() => {
    const generate = async () => {
      const config = ptCtx.mainViewInstance?.config;

      if (config && ref.current) {
        const orthographicParams = {
          left: -size.width / 2,
          right: size.width / 2,
          top: size.height / 2,
          bottom: -size.height / 2,
          near: 200,
          far: -200,
        };

        const pointCloud = new PointCloud({
          container: ref.current,
          isOrthographicCamera: true,
          orthographicParams,
          config,
        });

        pointCloud.setShowDirection(false);

        for (const item of result) {
          const { index } = item;

          const url = imgList[index].url
            ? imgList[index].url
            : // @ts-ignore
              imgList[index]?.webPointCloudFile?.lidar?.url ?? '';

          await pointCloud.loadPCDFileByBox(url, item, {
            width: 2,
            height: 2,
            depth: 2,
          });

          await pointCloud.updateCameraZoom(ptCtx.zoom);

          const fill = toolStyleConverter.getColorFromConfig(
            { attribute: item.attribute },
            { ...config, attributeConfigurable: true },
            {},
          )?.fill;

          pointCloud.generateBox(item, fill);
          // TODO
          // getViewsDataUrl requires pointCloud to finish loading the 3D view, otherwise it will not capture the correct image
          await sleep(500);
          await getViewsDataUrl(pointCloud, item, ptCtx.zoom);
          await pointCloud.removeObjectByName(item.id);
          await pointCloud.clearPointCloudAndRender();
        }

        setList(result);
        SetPointCloudLoading(dispatch, false);
      }
    };

    generate();
  }, []);

  return <div style={size} ref={ref} className='generate-view' />;
};

const mapStateToProps = (state: AppState) => ({
  predictionResult: state.annotation.predictionResult,
  predictionResultVisible: state.annotation.predictionResultVisible,
  imgList: state.annotation.imgList,
});

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(PreviewResult);
