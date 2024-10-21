/**
 * The file is about `ToolStyle` context.
 *
 * What will provide:
 *  1. give the explicit `toolStyle` config
 *  2. give hook for reading context
 *
 * Who will use/consume:
 *  1. `BasicToolOperation` class & its derived class
 *  2. `DrawUtils`
 *
 */

import React, {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useMemo,
  useState,
  useContext,
  useEffect,
} from 'react';
import type { ToolStyle } from '../types/toolStyle';
import { pick } from 'lodash';

// TODO Update the required fields when need in future,
//      but should retain the overall configuration of the previous
//
// Now, only support some limit and required fields (like `hiddenText`)
const validFields = ['hiddenText'] as const;

type ValidField = typeof validFields[number]
type OptionalToolStyle = Pick<ToolStyle, ValidField>;

const initialValue: OptionalToolStyle = {
  hiddenText: false,
};

export const ToolStyleContext = createContext<{
  value: OptionalToolStyle;
  updateValue: (value: Partial<OptionalToolStyle>) => void;
}>({
  value: initialValue,
  updateValue: () => {},
});

export const useToolStyleContext = () => {
  return useContext(ToolStyleContext);
};

interface ToolStyleProviderProps {
  value?: OptionalToolStyle;
}

export const ToolStyleProvider: FC<PropsWithChildren<ToolStyleProviderProps>> = (props) => {
  const [value, setValue] = useState<OptionalToolStyle>(() => ({ ...initialValue }));

  const updateValue = useCallback((value: Partial<OptionalToolStyle>) => {
    setValue((prevValue) => {
      if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
        return prevValue;
      }

      const newValue = { ...prevValue, ...value };
      return newValue;
    });
  }, []);

  const ctx = useMemo(() => ({ value, updateValue }), [value, updateValue]);

  useEffect(() => {
    const propValue = props.value;
    if (!propValue) {
      return;
    }

    const validToolTypeValues = pick<OptionalToolStyle, keyof OptionalToolStyle>(propValue, validFields);
    // Ignore when no valid item setting
    if (Object.keys(validToolTypeValues).length === 0) {
      return;
    }

    updateValue(validToolTypeValues);
  }, [props.value, updateValue]);

  return <ToolStyleContext.Provider value={ctx}>{props.children}</ToolStyleContext.Provider>;
};
