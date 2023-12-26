import React, { useEffect } from 'react';
import { i18n } from '@labelbee/lb-utils';
import { I18nextProvider } from 'react-i18next';
import { IVideoTagInstanceAdaptorProps, TagToolInstanceAdaptor } from './TagToolInstanceAdaptor';

/**
 * I18n provider for InstanceAdaptorI18nProvider
 * @param props
 */
export const VideoTagTool = (props: IVideoTagInstanceAdaptorProps & { lang?: string }) => {
  useEffect(() => {
    i18n.changeLanguage(props.lang);
  }, [props.lang]);

  return (
    <I18nextProvider i18n={i18n}>
      <TagToolInstanceAdaptor {...props} />
    </I18nextProvider>
  );
};
