import { Popover, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
// import SampleVideo from '@/components/sampleVideo';
// import LazyLoad from 'react-lazy-load';
import { IEntityDetail } from '@/types/tool'

interface IProps {
  labelDetail?: IEntityDetail;
  visible?: boolean;
  style?: React.CSSProperties;
}

const ImgLoading: React.FC<any> = ({ src, ...props }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (src) {
      const image = new Image();
      image.src = src;
      image.onload = () => {
        setImage(image);
      };
    }
  }, [src]);

  return (
    <Spin spinning={!image}>
      {!image ? <div style={{ height: 230 }} {...props} /> : <img src={src} {...props} />}
    </Spin>
  );
};

const LabelDetailPopover: React.FC<IProps> = ({ children, labelDetail, visible, style }) => {
  if (!visible) {
    return <div>{children}</div>;
  }

  let content: any = null;
  if (!labelDetail) {
    content = <div className={styles.errorMsg}>释义词典里没有此编号，请联系管理员。</div>;
  } else {
    const { nameZH, nameEN, descriptionEN, descriptionZH, imgList, no } = labelDetail;

    content = (
      <div className={styles.content}>
        <div className={styles.nameList}>
          <div className={styles.nameZH}>{nameZH}</div>
          <div className={styles.nameEN}>{nameEN}</div>
          <div className={styles.number}>{no}</div>
        </div>

        <div className={styles.item}>
          <div className={styles.title}>
            <span className={styles.dot} />
            中英描述
          </div>
          <div className={styles.contentZH}>{descriptionZH}</div>
          <div className={styles.contentEN}>{descriptionEN}</div>
        </div>

        <div className={styles.item}>
          <div className={styles.title}>
            <span className={styles.dot} />
            图片示例
          </div>
          {imgList.map((info) => {
            // <LazyLoad key={info.url} overflow={true} throttle={100} height={230}>
            // if (info.key.endsWith('mp4')) {
            //   return <SampleVideo key={info.key} className={styles.video} src={info.url} />;
            // }
            return <ImgLoading key={info.key} className={styles.img} src={info.url} />;
            //  </LazyLoad>
          })}
        </div>
      </div>
    );
  }

  return (
    <Popover destroyTooltipOnHide={true} placement='leftTop' content={content} trigger='hover'>
      <div style={style}>{children}</div>
    </Popover>
  );
};

export default LabelDetailPopover;
