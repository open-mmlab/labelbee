import React from 'react';

interface ITagLabelItem {
  keyLabel: string;
  valuesLabelArray: string[];
}

type ITagLabelsArray = ITagLabelItem[];

/**
 * 通过 key和value在inputList找到对应的标签
 * @param key
 * @param value
 * @param inputList
 */
const findTagLabel = (key: string, value: string, inputList: any[]) => {
  const primaryTagConfig = inputList.find((i) => i.value === key);
  const secondaryTagConfig = primaryTagConfig.subSelected.find((i) => i.value === value);
  return { keyLabel: primaryTagConfig.key, valueLabel: secondaryTagConfig.key };
};

/**
 * 根据inputList给结果的key进行排序
 * @param tagsKeys
 * @param inputList
 */
const tagKeySortByInputList = (tagsKeys: string[], inputList: any[]) => {
  return tagsKeys.sort((key1, key2) => {
    const key1Idx = inputList.findIndex((input) => key1 === input.value);
    const key2Idx = inputList.findIndex((input) => key2 === input.value);
    return key1Idx - key2Idx;
  });
};

const result2LabelKey = (result: any[], inputList: any[]) => {
  try {
    return (
      result?.reduce((exitsTags: ITagLabelsArray, res: { result: { [key: string]: string } }) => {
        tagKeySortByInputList(Object.keys(res.result), inputList).forEach((key) => {
          const values = res.result[key];
          const valuesArray = values.split(';');
          valuesArray.forEach((value) => {
            const { keyLabel, valueLabel } = findTagLabel(key, value, inputList);
            const tagHasAssign = exitsTags.find((i) => i.keyLabel === keyLabel);
            if (tagHasAssign) {
              tagHasAssign.valuesLabelArray.push(valueLabel);
            } else {
              exitsTags.push({ keyLabel, valuesLabelArray: [valueLabel] });
            }
          });
        });
        return exitsTags;
      }, []) ?? []
    );
  } catch (error) {
    return [];
  }
};

export const VideoTagLayer = ({
  result,
  inputList,
}: {
  result: Array<{ result: { [key: string]: string } }>;
  inputList: any[];
}) => {
  const cssProperty: React.CSSProperties = {
    position: 'absolute',
    zIndex: 20,
    padding: '0 20px',
    color: 'white',
    fontSize: 15,
    lineHeight: '32px',
    background: 'rgba(0, 255, 255, 0.32)',
    top: 0,
    right: 0,
    maxHeight: 'calc(100% - 80px)',
    overflowY: 'scroll',
  };

  const tags: ITagLabelsArray = result2LabelKey(result, inputList);

  return (
    <div style={cssProperty}>
      <table>
        <tbody>
          {tags.map(({ keyLabel, valuesLabelArray }) => (
            <tr key={keyLabel}>
              <td style={{ paddingRight: 8 }}>{`${keyLabel}:`}</td>
              <td>{`${valuesLabelArray.join('、')}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
