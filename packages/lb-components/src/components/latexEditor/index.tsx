/**
 * @file LatexEditor
 * @author lixinghua <lixinghua_vendor@sensetime.com>
 * @date 2023.11.28
 */
import React, { useState, useRef } from 'react';
import { Dropdown, Button, Tooltip, Spin } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { latexList } from './constant/config';
import MarkdownView from '@/components/markdownView';
import styles from './index.module.scss';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

interface IProps {
  onSelectLatex: (value: string) => void;
  disabled?: boolean;
}

interface IOptionData {
  key: string;
  label?: string;
  remark?: string;
  children?: IOptionData[];
}

const LatexItem = ({
  data,
  columnIndex,
  onSelectLatex,
  setActiveKeys,
  activeKeys,
  getInitActiveKey,
  disabled,
}: {
  data: IOptionData | null;
  columnIndex: number;
  onSelectLatex: (value: string) => void;
  setActiveKeys: (value: string[]) => void;
  getInitActiveKey: (data: IOptionData) => string[];
  activeKeys: string[];
  disabled?: boolean;
}) => {
  const { t } = useTranslation();
  const isLastNode = data?.children?.some((i) => !i?.children);

  // Formula rendering area can be selected
  if (isLastNode) {
    if (data?.children) {
      return (
        <div className={styles.lastNode}>
          {data.children.map((item) => {
            // Adding spaces before and after is to prevent recognition errors when `$$` and other characters coexist.
            // Use "$$" instead of "$" to avoid misidentification caused by using "$" in complex formula memory.
            const curValue = ` $$${item.key}$$ `;

            // show tips
            if (item?.remark) {
              return (
                <Tooltip placement='top' title={item?.remark} key={item.key}>
                  <Button
                    key={item.key}
                    className={styles.markdownItem}
                    onClick={() => {
                      onSelectLatex(curValue);
                    }}
                    disabled={disabled}
                  >
                    <MarkdownView value={curValue} />
                  </Button>
                </Tooltip>
              );
            }
            return (
              <Button
                key={item.key}
                className={styles.markdownItem}
                onClick={() => {
                  onSelectLatex(curValue);
                }}
                disabled={disabled}
              >
                <MarkdownView value={curValue} />
              </Button>
            );
          })}
        </div>
      );
    }
  }

  return (
    <div className={styles.itemList}>
      {data?.children?.map((item: IOptionData) => {
        return (
          <div
            key={item.key}
            onClick={() => {
              const keyList = getInitActiveKey(item);
              const keys = [...activeKeys.slice(0, columnIndex + 1), ...keyList];
              setActiveKeys(keys);
            }}
            className={classNames({
              [`${styles.item}`]: true,
              [`${styles.itemActive}`]: activeKeys.includes(item.key),
            })}
          >
            {t(item.label || '')}
            <RightOutlined style={{ marginLeft: 4, fontSize: 10 }} />
          </div>
        );
      })}
    </div>
  );
};

const LatexEditor = ({ onSelectLatex, disabled }: IProps) => {
  const { t } = useTranslation();
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const latexDom = useRef(null);
  const getItemByKey = (data: IOptionData[], key: string): IOptionData | null => {
    for (const item of data) {
      if (item?.key === key) {
        return item;
      } else if (item?.children) {
        const found = getItemByKey(item.children, key);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  const getInitActiveKey = (data: IOptionData, keys: Array<string> = []): Array<string> => {
    const initActiveKey = keys;
    initActiveKey.push(data.key);
    // Expand the first one by default
    if (data?.children && data?.children?.length > 0) {
      getInitActiveKey(data.children[0], initActiveKey);
    }
    return initActiveKey;
  };

  return (
    <div className={styles.latexEditor} ref={latexDom}>
      {latexList.map((i) => {
        return (
          <Dropdown
            // eslint-disable-next-line react/no-unstable-nested-components
            dropdownRender={() => {
              return (
                <Spin spinning={activeKeys.length === 0}>
                  <div className={styles.dropContent}>
                    {activeKeys.map((key, columnIndex) => {
                      const data = getItemByKey(latexList, key);
                      return (
                        <div key={key}>
                          <LatexItem
                            data={data}
                            columnIndex={columnIndex}
                            onSelectLatex={onSelectLatex}
                            setActiveKeys={setActiveKeys}
                            activeKeys={activeKeys}
                            getInitActiveKey={getInitActiveKey}
                            disabled={disabled}
                          />
                        </div>
                      );
                    })}
                  </div>
                </Spin>
              );
            }}
            key={i.key}
            className={classNames({
              [`${styles.latexHeaderTitle}`]: true,
              [`${styles.itemActive}`]: activeKeys.includes(i.key),
            })}
            getPopupContainer={() => latexDom?.current || document.body}
            trigger={['click']}
            onOpenChange={(open) => {
              if (open) {
                const initActiveKey = getInitActiveKey(i);
                setActiveKeys(initActiveKey);
              } else {
                setActiveKeys([]);
              }
            }}
          >
            <span>{t(i.label)}</span>
          </Dropdown>
        );
      })}
    </div>
  );
};

export default LatexEditor;
