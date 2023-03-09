import { ESubmitType } from '@/constant';
import { BatchUpdateResultByTrackID, ToSubmitFileData } from '@/store/annotation/actionCreators';
import { LabelBeeContext, useDispatch } from '@/store/ctx';
import { Form, InputNumber, message, Modal, Popover, Select } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { IPointCloudConfig, PointCloudUtils } from '@labelbee/lb-utils';
import { connect } from 'react-redux';
import { AppState } from '@/store';
import { AnnotationFileList } from '@/types/data';
import { useSingleBox } from '../../hooks/useSingleBox';
import { MathUtils } from '@labelbee/lb-annotation';

interface IProps {
  id?: number;
  visible: boolean;
  onCancel: () => void;
  config: IPointCloudConfig;
  imgList: AnnotationFileList;
  imgIndex: number;
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const defaultNumberRules = [{ required: true, message: '请填写一个数字' }];
const defaultSelectedAttribute = [{ required: true, message: '请选择主属性' }];
const DECIMAL_PLACES = 2;

const PrefixTag: React.FC<{ text: string }> = ({ text }) => {
  return (
    <span
      style={{
        borderRadius: '4px 0px 0px 4px',
        padding: '0px 12px',
        background: '#FAFAFA',
        border: '1px solid rgb(217 217 217)',
        borderRight: '0',
        display: 'flex',
        alignItems: 'center',
        height: 32,
      }}
    >
      {text}
    </span>
  );
};

const UnifyParamsModal = ({ id, visible, onCancel, config, imgList, imgIndex }: IProps) => {
  const dispatch = useDispatch();
  const { selectedBox } = useSingleBox();
  const [size, setSize] = useState<{ width: number; height: number; depth: number }>();

  const [form] = Form.useForm();
  const { t } = useTranslation();

  useEffect(() => {
    if (visible === false) {
      // Clear All Data
      form.resetFields();
      setSize(undefined);
    } else {
      // Init
      recalculateSize();
    }
  }, [visible]);

  const onFinish = (values: any) => {
    if (!id) {
      return;
    }

    if (!size) {
      message.info('该范围不存在更改数据, 请更改统一范围');
      return;
    }

    dispatch(ToSubmitFileData(ESubmitType.SyncImgList));
    const newData = {
      attribute: values.attribute,
    };

    if (config.secondaryAttributeConfigurable) {
      const newSubAttribute = {};
      config.inputList?.forEach((data) => {
        const subData = values[data.value];
        if (subData !== undefined) {
          Object.assign(newSubAttribute, { [data.value]: subData });
        }
      });

      if (Object.keys(newSubAttribute).length > 0) {
        Object.assign(newData, { subAttribute: newSubAttribute });
      }
    }

    if (size) {
      Object.assign(newData, size);
    }

    dispatch(BatchUpdateResultByTrackID(id, newData, [values.prevPage - 1, values.nextPage - 1]));
    onCancel();
  };

  const recalculateSize = useCallback(() => {
    const { prevPage, nextPage } = form.getFieldsValue(['prevPage', 'nextPage']);

    // 1. Filter the imgInfo in range.
    const newImgList = imgList.filter((_, i) =>
      MathUtils.isInRange(i, [prevPage - 1, nextPage - 1]),
    );

    if (
      !(newImgList?.length > 0) ||
      !selectedBox?.info ||
      selectedBox?.info?.trackID === undefined
    ) {
      setSize(undefined);
      return;
    }

    // 2. Get the Max Size of imgList
    const newMaxSize = PointCloudUtils.getMaxSizeFromBox({
      trackID: selectedBox.info.trackID,
      imgList: newImgList as Array<{ result: string }>,
    });

    setSize(newMaxSize);
  }, [imgList, selectedBox, imgIndex]);

  const onOk = () => form.submit();

  const sizeShow = () => {
    if (!size || !selectedBox?.info) {
      return;
    }
    const style = { marginRight: 16 };

    const { length, width, height } = PointCloudUtils.transferBox2Kitti({
      ...selectedBox?.info, // Just for the type check
      ...size,
    });

    return (
      <div>
        <span style={style}>
          {t('Length')}: {length.toFixed(DECIMAL_PLACES)}
        </span>
        <span style={style}>
          {t('Width')}: {width.toFixed(DECIMAL_PLACES)}
        </span>
        <span style={style}>
          {t('Height')}: {height.toFixed(DECIMAL_PLACES)}
        </span>
        <Popover placement='rightBottom' content='统一尺寸为该ID的所有标注框中最大的尺寸'>
          <QuestionCircleOutlined />
        </Popover>
      </div>
    );
  };
  const selectStyle = {
    width: '200px',
  };

  const attributeStyle = {
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <Modal
      title={t('UnifyParams')}
      visible={visible}
      onCancel={onCancel}
      onOk={onOk}
      wrapClassName='labelbee-custom-modal'
    >
      <Form {...layout} form={form} onFinish={onFinish}>
        <Form.Item name='id' label={t('UnifyTrackID')}>
          {id}
        </Form.Item>

        <Form.Item label={t('UnifyAttributeRange')} required={true}>
          <Form.Item
            style={{ display: 'inline-block' }}
            rules={defaultNumberRules}
            name='prevPage'
            noStyle={true}
            initialValue={1} // First Page 
          >
            <InputNumber
              precision={0}
              min={1}
              style={{ width: '80px' }}
              onChange={() => recalculateSize()}
            />
          </Form.Item>
          <span
            style={{
              display: 'inline-block',
              width: '24px',
              textAlign: 'center',
            }}
          >
            -
          </span>
          <Form.Item
            style={{ display: 'inline-block' }}
            rules={defaultNumberRules}
            name='nextPage'
            noStyle={true}
            initialValue={imgList.length}  // Last Page 
          >
            <InputNumber
              precision={0}
              min={1}
              style={{ width: '80px' }}
              onChange={() => recalculateSize()}
            />
          </Form.Item>
          <span
            style={{
              display: 'inline-block',
              width: '40x',
              marginLeft: '10px',
              textAlign: 'center',
            }}
          >
            {t('Page')}
          </span>
        </Form.Item>

        <Form.Item name='UnifySize' label={t('UnifySize')}>
          {sizeShow()}
        </Form.Item>

        <Form.Item label={t('UnifyTag')} required={true}>
          <div style={attributeStyle}>
            <PrefixTag text={t('Attribute')} />
            <Form.Item name='attribute' noStyle={true} rules={defaultSelectedAttribute}>
              <Select style={selectStyle}>
                {config.attributeList.map((v) => (
                  <Select.Option key={v.value} value={v.value}>
                    {v.key}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          {config.secondaryAttributeConfigurable &&
            config.inputList.map((v) => (
              <div key={v.value} style={attributeStyle}>
                <PrefixTag text={v.key} />
                <Form.Item name={v.value} noStyle={true} required={false}>
                  <Select style={selectStyle}>
                    {v.subSelected?.map((subData) => (
                      <Select.Option key={subData.value} value={subData.value}>
                        {subData.key}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            ))}
        </Form.Item>
      </Form>
    </Modal>
  );
};

const mapStateToProps = (state: AppState) => {
  return {
    imgIndex: state.annotation.imgIndex,
  };
};

export default connect(mapStateToProps, null, null, { context: LabelBeeContext })(UnifyParamsModal);
