import { Popover } from 'antd/es';
import _ from 'lodash';
import React, { useContext, useState } from 'react';

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
import pointCloudShortCutTable, { pointCloudShortCutTable_POLYGON } from './pointCloud';
import scribbleShortCutTable from './scribble';

import { footerCls } from '../../index';
import { useTranslation } from 'react-i18next';
import { cTool } from '@labelbee/lb-annotation';
import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';

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
  [EToolName.ScribbleTool]: scribbleShortCutTable,
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
  const [svgFlag, setFlag] = useState(false);
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
  const containerStyle = style || { width: 100 };

  return (
    // @ts-ignore
    <Popover
      placement='topLeft'
      content={content}
      // @ts-ignore
      onMouseMove={() => setFlag(true)}
      onMouseLeave={() => {
        setFlag(false);
      }}
      overlayClassName='tool-hotkeys-popover'
      className='tipsBar'
      // visible={svgFlag}
    >
      <div
        className='shortCutTitle'
        onMouseMove={() => setFlag(true)}
        onMouseLeave={() => setFlag(false)}
        style={containerStyle}
      >
        {title ?? (
          <a className='svg'>
            <img
              src={svgFlag ? hotKeyHoverSvg : hotKeySvg}
              width={15}
              height={13}
              style={{ marginRight: '5px' }}
            />

            {t('Hotkeys')}
          </a>
        )}
      </div>
    </Popover>
  );
};

const ToolHotKey: React.FC<IProps> = ({ style, title, toolName }) => {
  const { pointCloudPattern } = useContext(PointCloudContext);
  if (!toolName) {
    return null;
  }

  // 不存在对应的工具则不展示的快捷键
  if (!shortCutTable[toolName]) {
    return null;
  }

  let newToolName = toolName;
  if (newToolName === `${EPointCloudName.PointCloud}` && pointCloudPattern === EToolName.Polygon) {
    newToolName += '_POLYGON';
  }

  const props = {
    style,
    title,
    shortCutList: shortCutTable[newToolName],
  };

  return <ToolHotKeyCom {...props} />;
};

export default ToolHotKey;
