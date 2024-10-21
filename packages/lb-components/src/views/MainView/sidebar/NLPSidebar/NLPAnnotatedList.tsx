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
import { Col, Popconfirm, Row } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import LongText from '@/components/longText';
interface IProps {
  toolInstance: ICustomToolInstance;
  stepInfo: IStepInfo;
  checkMode?: boolean;
}

interface INLPTextAnnotationList extends INLPTextAnnotation {
  label: string;
}

export const sidebarCls = `${prefix}-sidebar`;

const getAnnotatedList = (
  config: INLPToolConfig,
  textAnnotation: INLPTextAnnotation[],
  attributeLockList: string[],
) => {
  const attributeList = config?.attributeList || [];
  const data = textAnnotation.map((i) => {
    const label = attributeList.filter((item) => item.value === i.attribute)?.[0]?.key || '';
    return { ...i, label };
  });
  if (attributeLockList?.length > 0) {
    return data.filter((i) => attributeLockList.includes(i.attribute));
  }
  return data;
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
  const annotatedList = getAnnotatedList(config, list, toolInstance?.attributeLockList ?? []);

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
            <Row className={`${sidebarCls}__content__NLPList__item__text`}>
              <Col span={7}>
                <LongText text={`${v.label}，${t('textTool')}: `} openByText={true} isToolTips={true} />
              </Col>
              <Col span={16} offset={1}>
                <LongText text={v.text} openByText={true} isToolTips={true} />
              </Col>
            </Row>

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
