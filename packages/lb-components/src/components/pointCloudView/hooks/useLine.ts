import { useContext } from 'react';
import { ILine } from '@labelbee/lb-utils';
import { PointCloudContext } from '../PointCloudContext';
import { useHistory } from './useHistory';

/**
 * PointCloud line Hook
 * @returns
 */
export const useLine = () => {
  const { lineList, setLineList, selectedID } = useContext(PointCloudContext);
  const { addHistory, pushHistoryWithList } = useHistory();

  const selectedLine = lineList.find((v) => v.id === selectedID);

  const addLine = (line: ILine) => {
    setLineList(lineList.concat(line));
    addHistory({ newLine: line });
  };

  const deleteLine = (id: string) => {
    const newLineList = lineList.filter((v) => v.id !== id).map((v) => ({ ...v }));
    setLineList(newLineList);
    pushHistoryWithList({ lineList: newLineList });
  };

  const updateSelectedLine = (line: ILine) => {
    if (selectedLine) {
      setLineList(
        lineList.map((v) => {
          if (v.id === selectedID) {
            return line;
          }
          return v;
        }),
      );
    }
  };

  const updateLineValidByID = (id: string) => {
    const line = lineList.find((v) => v.id === id);
    if (line) {
      setLineList(
        lineList.map((v) => {
          if (v.id === id) {
            return {
              ...v,
              valid: !v.valid,
            };
          }
          return v;
        }),
      );
    }
  };

  return {
    addLine,
    deleteLine,
    selectedLine,
    updateSelectedLine,
    updateLineValidByID,
  };
};
