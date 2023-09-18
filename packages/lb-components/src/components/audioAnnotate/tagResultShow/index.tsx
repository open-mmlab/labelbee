import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import { TagUtils, EventBus } from '@labelbee/lb-annotation'

const TagResultShow = (props: any) => {
  const { result, labelInfoSet, isCheck, hasPromptLayer } = props;
  const [visible, setVisible] = useState(true);

  const top = hasPromptLayer ? 40 : 0

  useEffect(() => {
    EventBus.on('toggleShowLabel', (val) => {
      setVisible(val);
    });
    return () => {
      EventBus.unbindAll('toggleShowLabel');
    };
  }, []);

  if (!result || !labelInfoSet || !visible) {
    return null;
  }

  const tagInfoList = TagUtils.getTagNameList(result, labelInfoSet);
  if (tagInfoList?.length === 0) {
    return null;
  }

  return (
    <div className={styles.labelContainer} style={isCheck ? { height: 245, top } : { bottom: 108, top }}>
      <div id='label' className={styles.label} key={`tagSet_${0}`}>
        {tagInfoList.map((v: any, index: number) => {
          const values = v.value.filter((i: any) => i);
          if (!v?.keyName || values.length === 0) {
            return null;
          }
          return (
            <div key={index}>
              {v.keyName}: {values.join(` 、 `)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default TagResultShow;
