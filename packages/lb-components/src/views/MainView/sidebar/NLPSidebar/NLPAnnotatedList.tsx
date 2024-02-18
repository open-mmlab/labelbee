import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { AppState } from 'src/store';
import StepUtils from '@/utils/StepUtils';
import { IStepInfo } from '@/types/step';
import { useTranslation } from 'react-i18next';
import { LabelBeeContext } from '@/store/ctx';
import { ICustomToolInstance } from '@/hooks/annotation';
import { prefix } from '@/constant';
import { classnames, jsonParser } from '@/utils';
import { INLPTextAnnotation, INLPToolConfig } from '@/components/NLPToolView/types';
import { Popconfirm, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
interface IProps {
  toolInstance: ICustomToolInstance;
  stepInfo: IStepInfo;
  checkMode?: boolean;
}

interface INLPTextAnnotationList extends INLPTextAnnotation {
  label: string;
}

export const sidebarCls = `${prefix}-sidebar`;

const getAnnotatedList = (config: INLPToolConfig, textAnnotation: INLPTextAnnotation[]) => {
  const attributeList = config?.attributeList || [];
  return textAnnotation.map((i) => {
    const label = attributeList.filter((item) => item.value === i.attribute)?.[0]?.key || '';
    return { ...i, label };
  });
};

const NLPAnnotatedList: React.FC<IProps> = (props) => {
  const [_, forceRender] = useState(0);
  const listRef = useRef<HTMLElement>(null);
  const { toolInstance, checkMode, stepInfo } = props;
  const { t } = useTranslation();
  const config = jsonParser(stepInfo.config);

  const [highlight, setHighlight] = useState<string>('');

  useEffect(() => {
    if (toolInstance) {
      toolInstance.on('changeAttributeSidebar', (index: number) => {
        forceRender((s) => s + 1);
      });
    }
    return () => {
      toolInstance?.unbindAll('changeAttributeSidebar');
    };
  }, [toolInstance, listRef]);

  const [result] = toolInstance.exportData();
  const list = result?.[0]?.textAnnotation ?? [];
  const annotatedList = getAnnotatedList(config, list);

  const setHighlightKey = (key: string) => {
    let chooseKey = key === highlight ? '' : key;
    toolInstance?.setHighlightKey(chooseKey);
    setHighlight(chooseKey);
  };

  const onDeleteTextAnnotation = (item: INLPTextAnnotation) => {
    toolInstance?.deleteTextAnnotation(item.id);
  };

  if (annotatedList?.length === 0) return null;
  return (
    <div className={`${sidebarCls}__content__NLPList`}>
      {annotatedList.map((v: INLPTextAnnotationList, k: number) => {
        const active = highlight === v.id;
        return (
          <div
            key={k}
            className={classnames({
              [`${sidebarCls}__content__NLPList__item`]: true,
              [`${sidebarCls}__content__NLPList__item__active`]: active,
            })}
            onClick={() => setHighlightKey(v.id)}
          >
            <span className={`${sidebarCls}__content__NLPList__item__text`}>
              <Tooltip title={v.text} overlayInnerStyle={{ maxHeight: '400px', overflow: 'auto' }}>
                <span>{`${v.label || t('NoAttribute')}，${t('textTool')}：${v.text}`}</span>
              </Tooltip>
            </span>

            {!checkMode && (
              <Popconfirm
                title={t('DeleteCommentConfirm')}
                placement='topRight'
                okText={t('Confirm')}
                cancelText={t('Cancel')}
                // @ts-ignore
                getPopupContainer={(trigger) => trigger.parentElement}
                onConfirm={() => onDeleteTextAnnotation(v)}
                overlayClassName={`${prefix}-pop-confirm`}
              >
                <CloseOutlined
                  className={`${sidebarCls}-pop-remove`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                />
              </Popconfirm>
            )}
          </div>
        );
      })}
    </div>
  );
};

const mapStateToProps = (state: AppState) => {
  const stepInfo = StepUtils.getCurrentStepInfo(state.annotation?.step, state.annotation?.stepList);

  return {
    toolInstance: state.annotation.toolInstance,
    stepInfo,
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(NLPAnnotatedList);
