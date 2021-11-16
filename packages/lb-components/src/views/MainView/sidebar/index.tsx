import React from 'react';
import { Row, Collapse } from 'antd/es';
import iconRectPatternSvg from '@/assets/annotation/rectTool/icon_rectPattern.svg';
import iconPolygonPatternASvg from '@/assets/annotation/polygonTool/icon_polygon_a.svg';
import pointASvg from '@/assets/annotation/pointTool/icon_point_a.svg';
import lineASvg from '@/assets/annotation/lineTool/icon_line_a.svg';
import { AppState } from '@/store';
import StepUtils from '@/utils/StepUtils';
import { useSelector } from 'react-redux';
import { EToolName } from '@/data/enums/ToolType';
import ImgAttributeInfo from './ImgAttributeInfo';
import SwitchAttributeList from './SwitchAttributeList';
import GeneralOperation from './GeneralOperation';
import AnnotationText from './AnnotationText';
import ToolStyle from './ToolStyle';
import ClearIcon from './ClearIcon';
import TagSidebar, { expandIconFuc } from './TagSidebar';
import { prefix } from '@/constant';
import TextToolSidebar from './TextToolSidebar';
import { useTranslation } from 'react-i18next';

const { Panel } = Collapse;

interface IProps {
  toolName?: EToolName;
}

const toolList = [
  {
    toolName: EToolName.Rect,
    commonSvg: iconRectPatternSvg,
    selectedSvg: iconRectPatternSvg,
  },
  // 多边形工具
  {
    toolName: EToolName.Polygon,
    commonSvg: iconPolygonPatternASvg,
    selectedSvg: iconPolygonPatternASvg,
  },
  {
    toolName: EToolName.Line,
    commonSvg: lineASvg,
    selectedSvg: lineASvg,
    pattern: EToolName.Line,
  },
  {
    toolName: EToolName.Point,
    commonSvg: pointASvg,
    selectedSvg: pointASvg,
    pattern: 'drawPoint',
  },
];
const sidebarCls = `${prefix}-sidebar`;
const Sidebar: React.FC<IProps> = () => {
  const stepInfo = useSelector((state: AppState) =>
    StepUtils.getCurrentStepInfo(state.annotation.step, state.annotation.stepList),
  );
  const toolName = stepInfo?.tool as EToolName;
  const { t } = useTranslation();

  if (!toolName) {
    return null;
  }

  if (
    [EToolName.Rect, EToolName.Point, EToolName.Line, EToolName.Rect, EToolName.Polygon].includes(
      toolName,
    )
  ) {
    const renderTool = toolList?.find((item) => item?.toolName === toolName);

    /**
     * 样式面板, 包含透明度、线框、颜色
     * @param key 虚拟dom的key
     */
    const renderStylePanel = (key: string) => {
      const ToolStyleComponent = <ToolStyle />;
      return (
        <Panel header={t('Style')} className='panel' key={key}>
          {ToolStyleComponent}
        </Panel>
      );
    };

    return (
      <div className={`${sidebarCls}`}>
        <div className={`${sidebarCls}__level`}>
          <Row className={`${sidebarCls}__toolsOption`}>
            {renderTool && (
              <a>
                <img className={`${sidebarCls}__singleTool`} src={renderTool?.selectedSvg} />
              </a>
            )}
          </Row>
        </div>
        <div className={`${sidebarCls}__horizontal`} />
        <SwitchAttributeList />
        <AnnotationText />
        <div className={`${sidebarCls}__horizontal`} />
        <Collapse
          defaultActiveKey={['1', 'imgAttribute']}
          bordered={false}
          expandIconPosition='right'
          className={`${sidebarCls}__content`}
          expandIcon={expandIconFuc}
        >
          {renderStylePanel('1')}
          <Panel
            header={
              <div>
                {t('Adjust')}

                <ClearIcon />
              </div>
            }
            className='panel'
            key='imgAttribute'
          >
            <ImgAttributeInfo />
          </Panel>
        </Collapse>

        <GeneralOperation />
      </div>
    );
  }

  if (toolName === EToolName.Tag) {
    return (
      <div className={`${sidebarCls}`}>
        <TagSidebar />
      </div>
    );
  }

  if (toolName === EToolName.Text) {
    return (
      <div className={`${sidebarCls}`}>
        <TextToolSidebar />
      </div>
    );
  }

  return null;
};

export default Sidebar;
