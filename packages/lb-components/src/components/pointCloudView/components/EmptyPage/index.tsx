/**
 * @file EmptyPage
 * @createDate 2022-08-31
 * @author Ron <ron.f.luo@gmail.com>
 */
import React from 'react';
import NoDataSvg from '@/assets/annotation/pointCloudTool/nodata.svg';
import { getClassName } from '@/utils/dom';
import { useTranslation } from 'react-i18next';

const EmptyPage = () => {
  const { t } = useTranslation();

  return (
    <div className={getClassName('point-cloud-container', 'empty-page')}>
      <img src={NoDataSvg} />
      <span className={getClassName('point-cloud-container', 'empty-page', 'text')}>
        {t('NoData')}
      </span>
    </div>
  );
};

export default EmptyPage;
