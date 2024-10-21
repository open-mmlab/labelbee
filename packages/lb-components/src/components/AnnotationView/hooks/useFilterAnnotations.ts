import { useMemo } from 'react';

const useFilterAnnotations = (
  originAnnotations: any[] = [],
  selectedIDs: string[] | undefined,
  selectBoxVisibleSwitch: boolean,
) => {
  const filteredAnnotations = useMemo(() => {
    if (selectBoxVisibleSwitch && selectedIDs?.length) {
      return originAnnotations.filter((item) => selectedIDs.includes(item.annotation.id));
    }
    return originAnnotations;
  }, [originAnnotations, selectedIDs, selectBoxVisibleSwitch]);

  return filteredAnnotations;
};

export default useFilterAnnotations;
