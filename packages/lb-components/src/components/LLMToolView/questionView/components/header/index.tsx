/*
 * @file LLM tool question header
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2023-11-13
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Resizable } from 're-resizable';
import { Radio, Image } from 'antd';
import { EDataFormatType, prefix } from '@/constant';
import { FileTextOutlined } from '@ant-design/icons';
import MarkdownView from '@/components/markdownView';
import { isObject, isString } from 'lodash';
import { i18n } from '@labelbee/lb-utils';
import ImgFailCn from '@/assets/annotation/LLMTool/imgFail_cn.svg';
import ImgFailEn from '@/assets/annotation/LLMTool/imgFail_en.svg';

interface IProps {
  question:
    | string
    | {
        id: number;
        path: string;
        url: string;
        processedUrl: string;
        thumbnail: string;
      };
  dataFormatType: EDataFormatType;
  setDataFormatType: (v: EDataFormatType) => void;
  isImg?: boolean;
}

const LLMViewCls = `${prefix}-LLMView`;

const Content = ({
  question,
  dataFormatType,
  isImg,
}: {
  question:
    | string
    | {
        id: number;
        path: string;
        url: string;
        processedUrl: string;
        thumbnail: string;
      };
  dataFormatType: EDataFormatType;
  isImg?: boolean;
}) => {
  const textValue = isString(question) ? question : '';
  const ImgFail = i18n.language === 'en' ? ImgFailEn : ImgFailCn;

  if (isImg) {
    const url = isObject(question) ? question?.url : '';
    return <Image src={url || ImgFail} width={400} fallback={ImgFail} />;
  }
  return (
    <div style={{ whiteSpace: 'pre-wrap' }}>
      {dataFormatType === EDataFormatType.Markdown ? <MarkdownView value={textValue} /> : textValue}
    </div>
  );
};
const Header = (props: IProps) => {
  const { question, dataFormatType, setDataFormatType, isImg } = props;
  const DEFAULT_HEIGHT = 300;
  const { t } = useTranslation();

  return (
    <Resizable
      defaultSize={{
        width: '100%',
        height: DEFAULT_HEIGHT,
      }}
      minHeight={DEFAULT_HEIGHT}
      enable={{ bottom: true }}
      style={{ padding: '26px 32px', borderBottom: '1px solid #EBEBEB', overflow: 'hidden' }}
    >
      <div
        className={`${LLMViewCls}__title`}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        {t('Title')}
        {!isImg && (
          <span style={{ display: 'flex' }}>
            <Radio.Group
              value={dataFormatType}
              onChange={(e) => {
                setDataFormatType(e.target.value);
              }}
            >
              <Radio.Button
                value={EDataFormatType.Default}
                style={{ textAlign: 'center', width: '52px' }}
              >{`</>`}</Radio.Button>
              <Radio.Button
                value={EDataFormatType.Markdown}
                style={{ textAlign: 'center', width: '52px' }}
              >
                <FileTextOutlined />
              </Radio.Button>
            </Radio.Group>
            <span style={{ marginLeft: '8px', width: '4px', background: '#1890ff' }} />
          </span>
        )}
      </div>
      <div className={`${LLMViewCls}__headerContent`}>
        <Content question={question} dataFormatType={dataFormatType} isImg={isImg} />
      </div>
    </Resizable>
  );
};

export default Header;
