/*
 * @file LLM tool question header
 * @Author: lixinghua lixinghua@sensetime.com
 * @Date: 2023-11-13
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Resizable } from 're-resizable';
import { Radio, Image, Empty } from 'antd';
import { EDataFormatType, prefix } from '@/constant';
import { FileTextOutlined, FileMarkdownOutlined } from '@ant-design/icons';
import MarkdownView from '@/components/markdownView';
import { isObject, isString } from 'lodash';
import { i18n } from '@labelbee/lb-utils';
import ImgFailCn from '@/assets/annotation/LLMTool/imgFail_cn.svg';
import ImgFailEn from '@/assets/annotation/LLMTool/imgFail_en.svg';
import { convertLatexFormat } from '@/utils/LLM';

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
  isAudio?: boolean;
}

const LLMViewCls = `${prefix}-LLMView`;

export const RenderQuestion = ({
  question,
  dataFormatType,
  isImg,
  isAudio,
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
  isAudio?: boolean;
}) => {
  const textValue = isString(question) ? question : '';
  const ImgFail = i18n.language === 'en' ? ImgFailEn : ImgFailCn;

  if (isImg) {
    const url = isObject(question) ? question?.url : '';
    return <Image src={url || ImgFail} fallback={ImgFail} />;
  }

  if (isAudio) {
    const url = isObject(question) ? question?.url : '';
    if (url) {
      return (
        <audio controls>
          <source src={url} type='audio/mpeg' />
        </audio>
      );
    }
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <div style={{ whiteSpace: 'pre-wrap' }}>
      {(() => {
        // 根据不同的数据格式类型渲染不同的视图
        switch (dataFormatType) {
          case EDataFormatType.Markdown:
            return <MarkdownView value={textValue} />;
          case EDataFormatType.Latex:
            return <MarkdownView value={convertLatexFormat(textValue)} />;
          default:
            return textValue;
        }
      })()}
    </div>
  );
};
const Header = (props: IProps) => {
  const { question, dataFormatType, setDataFormatType, isImg, isAudio } = props;
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
        <ToggleDataFormatType
          dataFormatType={dataFormatType}
          setDataFormatType={setDataFormatType}
        />
      </div>
      <div className={`${LLMViewCls}__headerContent`}>
        <RenderQuestion
          question={question}
          dataFormatType={dataFormatType}
          isImg={isImg}
          isAudio={isAudio}
        />
      </div>
    </Resizable>
  );
};

export const ToggleDataFormatType = (props: {
  dataFormatType: EDataFormatType;
  setDataFormatType: (v: EDataFormatType) => void;
}) => {
  const { dataFormatType, setDataFormatType } = props;
  return (
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
        <Radio.Button value={EDataFormatType.Latex} style={{ textAlign: 'center', width: '52px' }}>
          <FileMarkdownOutlined />
        </Radio.Button>
      </Radio.Group>
      <span style={{ marginLeft: '8px', width: '4px', background: '#1890ff' }} />
    </span>
  );
};

export default Header;
