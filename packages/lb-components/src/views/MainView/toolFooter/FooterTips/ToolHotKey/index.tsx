import _ from 'lodash';
import React, { useContext } from 'react';

import hotKeySvg from '@/assets/annotation/toolHotKeyIcon/icon_kj1.svg';
import hotKeyHoverSvg from '@/assets/annotation/toolHotKeyIcon/icon_kj_h.svg';
import { EToolName } from '@/data/enums/ToolType';
import rectToolShortcutTable from './rectToolShortCutTable';
import pointToolShortcutTable from './point';
import polygonToolShortcutTable from './polygon';
import lineToolShortCutTable from './line';
import tagToolSingleShortCutTable from './tag';
import textToolShortCutTable from './text';
import videoToolShortCutTable from './videoTag';
import pointCloudShortCutTable, {
  pointCloudShortCutTable_POLYGON,
  pointCloudShortCutTable_SEGMENT,
} from './pointCloud';
import scribbleShortCutTable from './scribble';
import cuboidShortCutTable from './cuboid';
import LLMShortCutTable from './LLM';

import { footerCls } from '../../index';
import { useTranslation } from 'react-i18next';
import { cTool } from '@labelbee/lb-annotation';
import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import FooterPopover from '@/views/MainView/toolFooter/FooterPopover';
import { EPointCloudPattern } from '@labelbee/lb-utils';

const { EVideoToolName, EPointCloudName } = cTool;

interface IProps {
  toolName?: string;
  style?: any;
  title?: React.ReactElement<any>;
}

interface IShortCutInfo {
  name: string;
  icon?: string;
  shortCut?: string[];
  noticeInfo?: string;
}

interface IComponentsProps {
  style?: any;
  title?: React.ReactElement<any>;
  shortCutList: IShortCutInfo[];
}

export const shortCutTable: { [a: string]: IShortCutInfo[] } = {
  [EToolName.Rect]: rectToolShortcutTable,
  [EToolName.Tag]: tagToolSingleShortCutTable,
  [EToolName.Point]: pointToolShortcutTable,
  [EToolName.Polygon]: polygonToolShortcutTable,
  [EToolName.Line]: lineToolShortCutTable,
  [EToolName.Text]: textToolShortCutTable,
  [EVideoToolName.VideoTagTool]: videoToolShortCutTable,
  [EPointCloudName.PointCloud]: pointCloudShortCutTable,
  [EPointCloudName.PointCloud + '_POLYGON']: pointCloudShortCutTable_POLYGON,
  [EPointCloudName.PointCloud + '_SEGMENT']: pointCloudShortCutTable_SEGMENT,
  [EToolName.ScribbleTool]: scribbleShortCutTable,
  [EToolName.Cuboid]: cuboidShortCutTable,
  [EToolName.LLM]: LLMShortCutTable,
  [EToolName.RectTrack]: rectToolShortcutTable,
};

const ToolHotKeyIcon = ({ icon }: { icon: React.ReactElement | string }) => {
  if (typeof icon === 'string') {
    return <img width={16} height={16} src={icon} />;
  }

  if (icon) {
    return icon;
  }

  return null;
};

export const ToolHotKeyCom: React.FC<IComponentsProps> = ({ title, style, shortCutList }) => {
  const { t } = useTranslation();

  const shortCutStyle = {
    width: 320,
    display: 'flex',
    justifyContent: 'space-between',
    margin: 16,
  };

  const shortCutNameStyles: React.CSSProperties = {
    display: 'block',
    padding: '0 3px',
    minWidth: '20px',
    marginRight: '3px',
    border: '1px solid rgba(204,204,204,1)',
    verticalAlign: 'middle',
    fontSize: '12px',
    textAlign: 'center',
  };

  const setHotKey = (info: any, index: number) => (
    <div style={shortCutStyle} key={index}>
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <ToolHotKeyIcon icon={info.icon} />
        <span style={{ marginLeft: info.icon ? 16 : 0 }}>{t(info.name)}</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {info.noticeInfo && (
          <span style={{ marginRight: '5px', color: '#CCCCCC' }}>{t(info.noticeInfo)}</span>
        )}
        {setSVG(info.shortCut, info.shortCutUseHtml, info.linkSymbol)}
      </span>
    </div>
  );

  const setSVG = (list: any[], useDangerInnerHtml = false, linkSymbol = '+') => {
    if (!list) {
      return null;
    }
    const listDom = list.map((item, index) => {
      const wrapperStyle = { display: 'flex', alignItems: 'center' };

      if (useDangerInnerHtml) {
        return (
          <span key={index} style={wrapperStyle}>
            <span style={shortCutNameStyles} dangerouslySetInnerHTML={{ __html: item }} />
          </span>
        );
      }

      if (index < list.length - 1) {
        if (typeof item === 'number') {
          return (
            <span key={index} style={wrapperStyle}>
              <span style={shortCutNameStyles}>{item}</span>
              <span style={{ marginRight: '3px' }}>~</span>
            </span>
          );
        }

        if (item?.startsWith?.('data')) {
          return (
            <span key={index} style={wrapperStyle}>
              <span className='shortCutButton' style={{ marginRight: '3px' }}>
                <img width={16} height={23} src={item} />
              </span>
              <span style={{ marginRight: '3px' }}>+</span>
            </span>
          );
        }
        return (
          <span key={index} style={wrapperStyle}>
            <span style={shortCutNameStyles}>{item}</span>
            <span style={{ marginRight: '3px' }}>{linkSymbol}</span>
          </span>
        );
      }

      if (typeof item === 'number') {
        return (
          <span key={index} style={wrapperStyle}>
            <span style={shortCutNameStyles}>{item}</span>
          </span>
        );
      }
      if (item?.startsWith?.('data')) {
        return (
          <span className='shortCutButton' key={index} style={{ marginRight: '3px' }}>
            <img width={16} height={23} src={item} />
          </span>
        );
      }
      return (
        <span style={shortCutNameStyles} key={index}>
          {item}
        </span>
      );
    });
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        {listDom}
      </div>
    );
  };

  const content = (
    <div className={`${footerCls}__hotkey-content`}>
      {shortCutList?.map((info: any, index: number) => setHotKey(info, index))}
    </div>
  );
  const containerStyle = style || {};

  return (
    <FooterPopover
      hoverIcon={hotKeyHoverSvg}
      icon={hotKeySvg}
      title={t('Hotkeys')}
      content={content}
      containerStyle={containerStyle}
    />
  );
};

const ToolHotKey: React.FC<IProps> = ({ style, title, toolName }) => {
  const { pointCloudPattern, globalPattern } = useContext(PointCloudContext);
  if (!toolName) {
    return null;
  }

  // 不存在对应的工具则不展示的快捷键
  if (!shortCutTable[toolName]) {
    return null;
  }

  let newToolName = toolName;

  /**
   * PointCloud Segment.
   */
  switch (globalPattern) {
    case EPointCloudPattern.Detection:
      /**
       * PointCloud Detection.
       */
      switch (pointCloudPattern) {
        case EToolName.Polygon:
          newToolName += '_POLYGON';

          break;
        case EToolName.Line:
          newToolName = EToolName.Line;

          break;
        case EToolName.Point:
          newToolName = EToolName.Point;

          break;
        default:
          break;
      }
      break;
    case EPointCloudPattern.Segmentation:
      newToolName = EPointCloudName.PointCloud + '_SEGMENT';
      break;
  }

  const props = {
    style,
    title,
    shortCutList: shortCutTable[newToolName],
  };

  return <ToolHotKeyCom {...props} />;
};

export default ToolHotKey;
