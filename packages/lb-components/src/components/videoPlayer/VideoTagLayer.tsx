import React from 'react';

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

const result2LabelKey = (result: any[], inputList: any[]) => {
  try {
    return (
      result?.reduce(
        (
          exitsTags: Array<{ keyLabel: string; valueLabel: string }>,
          res: { result: { [key: string]: string } },
        ) => {
          Object.keys(res.result).forEach((key) => {
            const value = res.result[key];
            const { keyLabel, valueLabel } = findTagLabel(key, value, inputList);
            if (!exitsTags.find((i) => i.keyLabel === keyLabel && i.valueLabel === valueLabel)) {
              exitsTags.push({ keyLabel, valueLabel });
            }
          });
          return exitsTags;
        },
        [],
      ) ?? []
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

  const tags: Array<{ keyLabel: string; valueLabel: string }> = result2LabelKey(result, inputList);

  return (
    <div style={cssProperty}>
      <table>
        <tbody>
          {tags.map(({ keyLabel, valueLabel }) => (
            <tr key={keyLabel}>
              <td style={{ paddingRight: 8 }}>{`${keyLabel}:`}</td>
              <td>{`${valueLabel}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
