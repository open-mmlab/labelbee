/**
 * @file React component based on diff-match-patch
 *  displays the difference between two strings, red is deleted content, green is added content
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @date 2023年9月21日
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
    // Handle the addition and deletion of newline characters only
    if ((key === -1 || key === 1) && !/\S/.test(value)) {
      const linebreaks = value.match(/(\S)*(\r\n|\r|\n)/g);
      // Use ↵ to replace the newline character. If the newline character is deleted, there will be no newline.
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
