import lineASvg from '@/assets/annotation/lineTool/icon_line_a.svg';
import pointASvg from '@/assets/annotation/pointTool/icon_point_a.svg';
import iconPolygonPatternASvg from '@/assets/annotation/polygonTool/icon_polygon_a.svg';
import iconRectPatternSvg from '@/assets/annotation/rectTool/icon_rectPattern.svg';
import { prefix } from '@/constant';
import { EToolName } from '@/data/enums/ToolType';
import { AppState } from '@/store';
import { Sider } from '@/types/main';
import StepUtils from '@/utils/StepUtils';
import { Collapse, Row } from 'antd/es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import AnnotationText from './AnnotationText';
import ClearIcon from './ClearIcon';
import GeneralOperation from './GeneralOperation';
import ImgAttributeInfo from './ImgAttributeInfo';
import SwitchAttributeList from './SwitchAttributeList';
import TagSidebar, { expandIconFuc } from './TagSidebar';
import TextToolSidebar from './TextToolSidebar';
import ToolStyle from './ToolStyle';
import { cTool } from '@labelbee/lb-annotation';
import ScribbleSidebar from './ScribbleSidebar';

const { EVideoToolName } = cTool;

const { Panel } = Collapse;

interface IProps {
  toolName?: EToolName;
  sider?: Sider;
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
const Sidebar: React.FC<IProps> = ({ sider }) => {
  const stepInfo = useSelector((state: AppState) =>
    StepUtils.getCurrentStepInfo(state.annotation.step, state.annotation.stepList),
  );
  const toolName = stepInfo?.tool;
  const { t } = useTranslation();

  if (!toolName) {
    return null;
  }

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

  const toolIcon = (
    <div className={`${sidebarCls}__level`}>
      <Row className={`${sidebarCls}__toolsOption`}>
        {renderTool && (
          <a>
            <img className={`${sidebarCls}__singleTool`} src={renderTool?.selectedSvg} />
          </a>
        )}
      </Row>
    </div>
  );

  const attributeList = <SwitchAttributeList />;

  const annotationText = <AnnotationText />;

  const toolStyle = (
    <Collapse
      defaultActiveKey={['1', 'imgAttribute']}
      bordered={false}
      expandIconPosition='right'
      className={`${sidebarCls}__content`}
      expandIcon={expandIconFuc}
    >
      {renderStylePanel('1')}
    </Collapse>
  );

  const imageAttributeInfo = (
    <Collapse
      defaultActiveKey={['1', 'imgAttribute']}
      bordered={false}
      expandIconPosition='right'
      className={`${sidebarCls}__content`}
      expandIcon={expandIconFuc}
    >
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
  );

  const operation = <GeneralOperation />;

  const tagToolSideBar = <TagSidebar />;

  const textToolSideBar = <TextToolSidebar />;

  const scribbleSidebar = (
    <ScribbleSidebar
      onChange={(t, i) => {
        // 接收
      }}
    />
  );

  const horizontal = <div className={`${sidebarCls}__horizontal`} />;
  if (sider) {
    if (typeof sider === 'function') {
      return (
        <div className={`${sidebarCls}`}>
          {sider({
            toolIcon,
            attributeList,
            annotationText,
            toolStyle,
            imageAttributeInfo,
            operation,
            tagToolSideBar,
            textToolSideBar,
            horizontal,
            scribbleSidebar,
          })}
        </div>
      );
    } else {
      return sider;
    }
  }

  if (
    (
      [
        EToolName.Rect,
        EToolName.Point,
        EToolName.Line,
        EToolName.Rect,
        EToolName.Polygon,
      ] as string[]
    ).includes(toolName)
  ) {
    return (
      <div className={`${sidebarCls}`}>
        {toolIcon}
        {scribbleSidebar}
        {horizontal}
        {attributeList}
        {annotationText}
        {horizontal}
        <div className={`${sidebarCls}__content`}>
          {toolStyle}
          {imageAttributeInfo}
        </div>
        {operation}
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

  if (toolName === EVideoToolName.VideoTagTool) {
    return (
      <div className={`${sidebarCls}`}>
        <div className={`${sidebarCls}__content`}>
          <TagSidebar />
        </div>
        {operation}
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

  if (toolName === EToolName.ScribbleTool) {
    return (
      <div className={`${sidebarCls}`}>
        {scribbleSidebar}
        {attributeList}
      </div>
    );
  }

  return null;
};

export default Sidebar;
