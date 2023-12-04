import RadioList from '@/components/attributeList';
import CheckBoxList from '@/components/checkboxList';
import { CaretRightOutlined } from '@ant-design/icons';
import { Badge, Collapse, Tooltip } from 'antd';
import { cloneDeep } from 'lodash';
import React, { Component } from 'react';
import styles from './index.module.scss';
// import EventBus from '@/utils/EventBus';
import LabelDetailPopover from '../LabelDetailPopover';
import LabelFilterInput from '../labelFilterInput';
import { TagUtils } from '@labelbee/lb-annotation';
import clearSmall from '@/assets/annotation/common/icon_clearSmall.svg';
import clearSmallA from '@/assets/annotation/common/icon_clearSmall_a.svg';
import { IEntityDetail } from '@/types/tool'
import { withTranslation } from 'react-i18next';

const createHighlightLabel = (key: string, val: string) => {
  return highlightKeyword(key, val, '#666FFF');
};

// 高亮关键字
export const highlightKeyword = (str: string, keyword: string, color: string) => {
  if (!str || !keyword) {
    return str;
  }
  const index = str.indexOf(keyword);
  if (index === -1) {
    return str;
  }
  return (
    <>
      {str.slice(0, index)}
      <span style={{ color }}>{keyword}</span>
      {str.slice(index + keyword.length)}
    </>
  );
};

interface ILabelInfo {
  key: string;
  value: string;
  subSelected?: IFilteredLabelInfo[];
  hasShow?: boolean;
  isMulti?: boolean;
  show?: boolean;
  showLabel: string | React.ReactElement;
}

interface IFilteredLabelInfo extends ILabelInfo {
  show: boolean;
  showLabel: string | React.ReactElement;
}

interface IState {
  hoverDeleteIndex: number;
  expandKeyList: string[]; // 用于折叠的 activeKey
  inputValue: string;
}

interface IProps {
  labelInfoSet: ILabelInfo[];
  labelSelectedList: number[];
  setLabel: (i: number, j: number) => void;
  tagResult: {};
  clearResult: (a: string) => void;
  imgIndex?: number;
  graphIndex?: number;
  isEdit: boolean;

  entityMap?: Map<string, IEntityDetail>;
  dynamicTag?: boolean; // 是否开始动态标签
  withPanelTab?: boolean;
  t: any;
}

const { Panel } = Collapse;

class LabelSidebar extends Component<IProps, IState> {
  private sideBar: React.RefObject<HTMLDivElement> = React.createRef();

  public constructor(props: IProps) {
    super(props);
    this.state = {
      hoverDeleteIndex: -1,
      expandKeyList: props.labelInfoSet.map((info) => info.value),
      inputValue: '',
    };

    // EventBus.on('updateLabelSideBarScrollTop', this.updateScrollTop);
  }

  // public componentWillUnmount() {
  //   EventBus.unbind('updateLabelSideBarScrollTop', this.updateScrollTop);
  // }

  public updateScrollTop = (childIndex: number) => {
    if (this.sideBar.current) {
      this.sideBar.current.children[childIndex]?.scrollIntoView({ block: 'center' });
    }
  };

  public shouldComponentUpdate(newProps: any, newState: IState) {
    const { labelSelectedList, labelInfoSet } = newProps;

    // 用于配置的初始化
    if (
      this.props.labelInfoSet.length !== newProps.labelInfoSet.length ||
      this.state.inputValue !== newState.inputValue
    ) {
      this.setState({ expandKeyList: newProps.labelInfoSet.map((info: ILabelInfo) => info.value) });
    }

    // 设置侧壁栏展开操作
    if (
      labelSelectedList[0] !== this.props.labelSelectedList[0] &&
      newProps.labelSelectedList.length === 1
    ) {
      const index = labelSelectedList[0];
      const value = labelInfoSet.filter((v: ILabelInfo, i: number) => i === index)[0]?.value;
      this.setExpendKeyList(this.state.expandKeyList, index, value, true);
      return true;
    }

    if (newProps.labelSelectedList.length === 1) {
      this.updateScrollTop(labelSelectedList[0]);
    }

    if (
      this.props.imgIndex !== newProps.imgIndex ||
      this.props.graphIndex !== newProps.graphIndex
    ) {
      this.updateScrollTop(0);
    }
    return true;
  }

  /**
   * 设置展开操作
   *
   * @memberof LabelSidebar
   */
  public setExpendKeyList = (
    expandKeyList: string[],
    index: number,
    value: string,
    expend?: boolean,
  ) => {
    const newKeyList = cloneDeep(expandKeyList);
    if (newKeyList[index] === '' || expend === true) {
      newKeyList[index] = value;
    } else {
      newKeyList[index] = '';
    }
    this.setState({ expandKeyList: newKeyList });
  };

  public setInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      inputValue: e.target.value,
    });
  };

  public render() {
    const {
      labelInfoSet,
      labelSelectedList,
      tagResult,
      clearResult,
      entityMap,
      t,
    } = this.props;
    const { hoverDeleteIndex, expandKeyList, inputValue } = this.state;

    const inputList = labelInfoSet;
    let hasFilteredResult = false;
    labelInfoSet.forEach((item) => {
      const { subSelected = [] } = item;
      item.hasShow = false;
      subSelected.forEach((i: IFilteredLabelInfo) => {
        const { key } = i;
        if (!inputValue) {
          i.showLabel = i.key;
          i.show = true;
          return;
        }
        if (key.indexOf(inputValue) > -1) {
          i.showLabel = createHighlightLabel(key, inputValue);
          i.show = true;
          item.hasShow = true;
        } else {
          i.showLabel = i.key;
          i.show = false;
        }
      });
      if (item.hasShow) {
        hasFilteredResult = true;
      }
    });
    const selectedButton = (index: number) => {
      if (labelSelectedList.length > 0 && labelSelectedList[0] === index) {
        return <span className={styles.keyDownIconActive}>{index + 1}</span>;
      }
      return <span className={styles.keyDownIcon}>{index + 1}</span>;
    };

    const renderExpandIcon = ({ isActive }: { isActive?: boolean }): React.ReactNode => <CaretRightOutlined rotate={isActive ? 90 : 0} />
    // basicIndex 到底是那一层
    const labelPanel = (labelInfoSet: (ILabelInfo | IFilteredLabelInfo)[], basicIndex = -1) => {
      if (!labelInfoSet) {
        return;
      }
      return labelInfoSet.map((info: ILabelInfo | IFilteredLabelInfo, index: number) => {
        if (info.subSelected) {
          if (inputValue && !info.hasShow) {
            return null;
          }
          // 初始化

          // 判断是否有数据
          const isResult = TagUtils.judgeResultIsInInputList(info.value, tagResult?.[info.value as keyof typeof tagResult], inputList);

          return (
            <Collapse
              bordered={false}
              expandIcon={renderExpandIcon}
              key={`collapse_${index}_${basicIndex + 1}`}
              onChange={() => this.setExpendKeyList(expandKeyList, index, info.value)}
              activeKey={[expandKeyList[index]]}
            >
              <Panel
                header={
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>
                      {info.key}
                      <Tooltip placement='bottom' title={t('ClearThisOption')}>
                        <img
                          style={{ marginLeft: 5, cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            clearResult(info.value);
                          }}
                          src={hoverDeleteIndex === index || isResult ? clearSmallA : clearSmall}
                          onMouseEnter={() => {
                            this.setState({ hoverDeleteIndex: index });
                          }}
                          onMouseLeave={() => {
                            this.setState({ hoverDeleteIndex: -1 });
                          }}
                        />
                      </Tooltip>
                      {isResult && expandKeyList[index] === '' && <Badge color='#87d068' />}
                    </span>

                    {!inputValue && this.props.labelInfoSet.length > 1 && selectedButton(index)}
                  </div>
                }
                key={info.value}
              >
                <div
                  className={styles.level}
                  style={{
                    backgroundColor:
                      labelSelectedList.length > 0 && labelSelectedList[0] === index
                        ? 'rgba(158, 158, 158, 0.18)'
                        : '',
                  }}
                >
                  {labelPanel(info.subSelected, index)}
                </div>
              </Panel>
            </Collapse>
          );
        } else {
          const key = this.props.labelInfoSet[basicIndex]
            ? this.props.labelInfoSet[basicIndex].value
            : 0;

          const selectedAttribute =
            (tagResult?.[key as keyof typeof tagResult] as string)?.split(';')?.indexOf(info.value) > -1 ? info.value : '';

          const labelDetail = entityMap?.get(info.value);
          if (this.props.labelInfoSet[basicIndex]?.isMulti === true) {
            let hotKey: any = index + 1;
            // Hotkey 仅能在 0 - 9 范围内
            if (!(typeof hotKey === 'number' && hotKey <= 9 && hotKey >= 0)) {
              hotKey = '-';
            }

            return (
              info?.show && (
                <div className={styles.singleBar}>
                  <LabelDetailPopover labelDetail={labelDetail} visible={this.props.dynamicTag}>
                    <CheckBoxList
                      attributeChanged={() => this.props.setLabel(basicIndex, index)}
                      selectedAttribute={[selectedAttribute]}
                      list={[{ value: info.value, label: info.key, showLabel: info.showLabel }]}
                      num={hotKey}
                    />
                  </LabelDetailPopover>
                </div>
              )
            );
          } else {
            return (
              info?.show && (
                <div className={styles.singleBar}>
                  <LabelDetailPopover labelDetail={labelDetail} visible={this.props.dynamicTag}>
                    <RadioList
                      attributeChanged={() => this.props.setLabel(basicIndex, index)}
                      selectedAttribute={selectedAttribute}
                      list={[{ value: info.value, label: info.key }]}
                      num={index + 1}
                    />
                  </LabelDetailPopover>
                </div>
              )
            );
          }
        }
      });
    };

    return (
      labelInfoSet.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center' }}>{t('NoConfiguration')}</div>
      ) : (
        <div className={styles.filterContainer}>
          <div className={styles.filterInputContainer}>
            <LabelFilterInput value={inputValue} onChange={this.setInputValue} />
          </div>
          <div className={styles.filterContent}>
            <div className={styles.main} ref={this.sideBar}>
              {labelPanel(labelInfoSet)}
              {!!inputValue && !hasFilteredResult && (
                <div
                  style={{
                    textAlign: 'center',
                    color: '#999',
                  }}
                >
                  {t('NoData')}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    );
  }
}

const LabelSidebarWithTrans = withTranslation()(LabelSidebar)
export default LabelSidebarWithTrans
