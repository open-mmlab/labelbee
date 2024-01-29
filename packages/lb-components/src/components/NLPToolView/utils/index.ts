import _ from 'lodash';
import { INLPInterval } from '../types';

export const getIntervals = (content: string, textAnnotation: INLPInterval[], key: string) => {
  if (!content?.length || !textAnnotation?.length) {
    return [];
  }
  const splitPoints = _.uniq(
    _.concat(
      0,
      ...textAnnotation.map((range: INLPInterval) => [range.start, range.end]),
      content.length,
    ),
  ).sort((a, b) => a - b);
  const intervals: INLPInterval[] = [];
  for (let i = 0; i < splitPoints.length - 1; i++) {
    const start = splitPoints[i];
    const end = splitPoints[i + 1];
    const annotations: INLPInterval[] = textAnnotation.filter(
      (range: INLPInterval) =>
        (range.start >= start && range.end <= end) || (start >= range.start && end <= range.end),
    );
    intervals.push({
      start,
      end,
      [key]: annotations,
      text: content.slice(start, end),
    });
  }
  return intervals;
};
