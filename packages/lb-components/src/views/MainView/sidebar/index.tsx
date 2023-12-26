import { prefix } from '@/constant';
import { EToolName } from '@/data/enums/ToolType';
import { AppState } from '@/store';
import { Sider } from '@/types/main';
import StepUtils from '@/utils/StepUtils';
import { Collapse } from 'antd/es';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AnnotationText from './AnnotationText';
import ClearIcon from './ClearIcon';
import GeneralOperation, { PointCloudOperation } from './GeneralOperation';
import ImgAttributeInfo from './ImgAttributeInfo';
import SwitchAttributeList from './SwitchAttributeList';
import TagSidebar, { expandIconFuc } from './TagSidebar';
import TextToolSidebar from './TextToolSidebar';
import PointCloudToolSidebar from './PointCloudToolSidebar';
import ToolStyle from './ToolStyle';
import { cTool } from '@labelbee/lb-annotation';
import ScribbleSidebar from './ScribbleSidebar';
import { ToolIcons } from './ToolIcons';
import { useSelector } from '@/store/ctx';
import { Tabs } from 'antd';
import { classnames } from '@/utils';
import menuFoldSvg from '@/assets/annotation/common/icon_menu_fold.svg';
import LLMToolSidebar from '@/components/LLMToolView/sidebar';
import VideoClipAnnotatedList from '@/components/videoAnnotate/videoClipTool/components/annotatedList'

const { EVideoToolName, EPointCloudName } = cTool;

const { Panel } = Collapse;

interface IProps {
  toolName?: EToolName;
  sider?: Sider;
  enableColorPicker?: boolean;
  setSiderWidth?: (width: number | undefined) => void;
  propsSiderWidth?: number | undefined;
  checkMode?: boolean;
}

export const sidebarCls = `${prefix}-sidebar`;
const Sidebar: React.FC<IProps> = ({
  sider,
  enableColorPicker,
  setSiderWidth,
  propsSiderWidth,
  checkMode,
}) => {
  const stepInfo = useSelector((state: AppState) =>
    StepUtils.getCurrentStepInfo(state.annotation.step, state.annotation.stepList),
  );
  const [showSide, setShowSide] = useState<boolean>(true);
  const toolName = stepInfo?.tool;
  const { t } = useTranslation();

  if (!toolName) {
    return null;
  }

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

  // onChange is empty by default.
  const toolIcon = <ToolIcons toolName={toolName} onChange={() => {}} />;
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

  const videoClipSidebar = (
    <VideoClipAnnotatedList />
  )
  const LLMSidebar = <LLMToolSidebar checkMode={checkMode} />;

  const horizontal = <div className={`${sidebarCls}__horizontal`} />;

  const pointCloudToolSidebar = <PointCloudToolSidebar enableColorPicker={enableColorPicker} />;

  const pointCloudOperation = <PointCloudOperation />;

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

            pointCloudToolSidebar,
            pointCloudOperation,
            scribbleSidebar,
            LLMSidebar,
            videoClipSidebar,
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
        EToolName.Cuboid,
      ] as string[]
    ).includes(toolName)
  ) {
    return (
      <div className={`${sidebarCls}`}>
        {toolIcon}
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

  if (toolName === EVideoToolName.VideoClipTool) {
    return (
      <div className={`${sidebarCls}`}>
        <div className={`${sidebarCls}__content`}>
          {videoClipSidebar}
          {attributeList}
        </div>
        {operation}
      </div>
    )
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

  if (toolName === EVideoToolName.VideoTextTool) {
    return (
      <div className={`${sidebarCls}`}>
        <TextToolSidebar />
      </div>
    )
  }

  if (toolName === EToolName.Text) {
    return (
      <div className={`${sidebarCls}`}>
        <TextToolSidebar />
      </div>
    );
  }

  if (toolName === EPointCloudName.PointCloud) {
    const showFoldSide = () => {
      setShowSide(!showSide);
      if (setSiderWidth) {
        const w = showSide ? 48 : undefined;
        setSiderWidth(w);
      }
    };
    // sidebar collapse
    const hideSideBox = (
      <div
        style={{
          width: '48px',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          background: '#ffffff',
        }}
      >
        <span onClick={() => showFoldSide()}>
          <img
            style={{
              width: '16px',
              height: '16px',
              marginTop: '18px',
              cursor: 'pointer',
              transform: 'rotate(180deg)',
            }}
            src={menuFoldSvg}
          />
        </span>
      </div>
    );

    if (showSide) {
      return (
        <Tabs
          type='card'
          activeKey='1'
          className={classnames({
            [`${sidebarCls}`]: true,
            [`${sidebarCls}__pointCloud`]: true,
          })}
          tabBarExtraContent={{
            left: (
              <span onClick={() => showFoldSide()} style={{ padding: '0px 4px' }}>
                <img
                  style={{
                    width: '16px',
                    height: '16px',
                    marginLeft: '4px',
                    cursor: 'pointer',
                  }}
                  src={menuFoldSvg}
                />
              </span>
            ),
          }}
        >
          <Tabs.TabPane
            tab='工具面板'
            key='1'
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div className={`${sidebarCls}__content`}>
              <PointCloudToolSidebar />
            </div>
            <PointCloudOperation />
          </Tabs.TabPane>
        </Tabs>
      );
    }

    return hideSideBox;
  }

  if (toolName === EToolName.ScribbleTool) {
    return (
      <div className={`${sidebarCls}`}>
        <div className={`${sidebarCls}__content`}>
          {scribbleSidebar}
          {attributeList}
        </div>
        {operation}
      </div>
    );
  }

  if (toolName === EToolName.LLM) {
    return LLMSidebar;
  }

  return null;
};

export default Sidebar;
