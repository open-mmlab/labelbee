/**
 * @file 基于 diff-match-patch 的 react组件：展示两个字符串的差异，红色为删除内容，绿色为增加内容
 * @author lixinghua <lixinghua@sensetime.com>
 * @date 2023年11月07日
 */

import React from 'react';
import { uuid } from '@labelbee/lb-annotation';
import DiffMatchPatch from 'diff-match-patch';

const styles = {
  added: {
    color: '#36B34A',
    backgroundColor: '#D9FFDF',
  },
  removed: {
    color: '#F26549',
    backgroundColor: '#FFD9D9',
    textDecoration: 'line-through',
  },
};

const DiffMatchPatchComponent = ({ originString = '', currentString = '' }) => {
  const dmp = new DiffMatchPatch();
  const diff = dmp.diff_main(originString, currentString);

  const mappedNodes = diff.map((group: any) => {
    const key = group[0];
    let value = group[1];
    // 处理只包含换行符的增加和删除的情况
    if ((key === -1 || key === 1) && !/\S/.test(value)) {
      const linebreaks = value.match(/(\S)*(\r\n|\r|\n)/g);
      // 用↵替换换行符,如果换行符被删掉了就不换行了
      if (linebreaks) {
        if (key === -1) {
          value = `\u21B5`.repeat(linebreaks.length);
        }
        if (key === 1) {
          value = `\u21B5\n`.repeat(linebreaks.length);
        }
      }
    }

    let nodeStyles;
    if (key === 1) {
      nodeStyles = styles.added;
    }
    if (key === -1) {
      nodeStyles = styles.removed;
    }
    return (
      <span style={nodeStyles} key={uuid()}>
        {value}
      </span>
    );
  });

  return <span style={{ whiteSpace: 'pre-wrap' }}>{mappedNodes}</span>;
};

export default DiffMatchPatchComponent;
