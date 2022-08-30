import { prefix } from '@/constant';
import { AppState } from '@/store';
import { PageBackward, PageForward, PageJump } from '@/store/annotation/actionCreators';
import { getTotalPage } from '@/store/annotation/reducer';
import { RenderFooter } from '@/types/main';
import { IStepInfo } from '@/types/step';
import { Divider } from 'antd/es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect, useDispatch } from 'react-redux';
import FooterTips from './FooterTips';
import HiddenTips from './HiddenTips';
import PageNumber from './PageNumber';
import ZoomController from './ZoomController';
import { Pagination } from './Pagination';
import { cTool } from '@labelbee/lb-annotation';

const { EPointCloudName } = cTool;

export type FooterTheme = 'light' | 'dark';
interface IProps {
  totalPage: number;
  imgIndex: number;
  style?: { [key: string]: any };
  stepList: IStepInfo[];
  step: number;
  basicResultList: any[];
  basicIndex: number;
  mode?: FooterTheme; // 后面通过 context 的形式进行编写
  footer?: RenderFooter;
}

export const footerCls = `${prefix}-footer`;

export const FooterDivider = () => (
  <Divider type='vertical' style={{ background: 'rgba(153, 153, 153, 1)', height: '16px' }} />
);

/**
 * default footer renderer
 * @param param0
 * @returns
 */
const renderFooter: RenderFooter = ({
  footerTips,
  hiddenTips,
  pageNumber,
  pagination,
  zoomController,
  curItems,
  footerDivider,
}) => {
  return (
    <>
      {footerTips}
      <div style={{ flex: 1 }} />
      {hiddenTips}
      {pageNumber}
      {pagination}
      {curItems}
      {footerDivider}
      {zoomController}
    </>
  );
};

const ToolFooter: React.FC<IProps> = (props: IProps) => {
  const {
    stepList,
    step,
    basicResultList,
    basicIndex,
    mode = 'light',
    footer = renderFooter,
  } = props;

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const stepInfo = stepList[step - 1] ?? {};
  const hasSourceStep = !!stepInfo.dataSourceStep;

  const pageBackward = () => {
    dispatch(PageBackward());
  };

  const pageForward = () => {
    dispatch(PageForward());
  };

  const toPageNumber = (page: string) => {
    const imgIndex = ~~page - 1;
    dispatch(PageJump(imgIndex));
  };

  const pagination = (
    <Pagination
      imgIndex={props.imgIndex}
      totalPage={props.totalPage}
      pageJump={toPageNumber}
      pageBackward={pageBackward}
      pageForward={pageForward}
      footerCls={footerCls}
    />
  );

  const curItems =
    hasSourceStep && basicResultList.length > 0 ? (
      <span>{t('curItems', { current: basicIndex + 1, total: basicResultList.length })}</span>
    ) : null;

  if (typeof footer === 'function') {
    if (footer === renderFooter && stepInfo.tool === EPointCloudName.PointCloud) {
      return (
        <div className={`${footerCls}`} style={props.style}>
          <FooterTips />
          <div style={{ flex: 1 }} />
          {pagination}
        </div>
      );
    }

    return (
      <div className={`${footerCls}`} style={props.style}>
        {footer({
          footerTips: <FooterTips />,
          hiddenTips: <HiddenTips />,
          pageNumber: <PageNumber />,
          pagination,
          zoomController: <ZoomController mode={mode} />,
          curItems,
          footerDivider: <FooterDivider />,
        })}
      </div>
    );
  }

  return footer;
};

const mapStateToProps = (state: AppState) => ({
  totalPage: getTotalPage(state.annotation),
  imgIndex: state.annotation.imgIndex,
  stepList: state.annotation.stepList,
  step: state.annotation.step,
  basicIndex: state.annotation.basicIndex,
  basicResultList: state.annotation.basicResultList,
});

export default connect(mapStateToProps)(ToolFooter);
