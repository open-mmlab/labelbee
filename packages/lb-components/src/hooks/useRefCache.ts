/**
 * @file Cache the operation
 * @createDate 2022-09-27
 * @author Ron <ron.f.luo@gmail.com>
 */

import { useRef, useEffect } from 'react';

const useRefCache = <T>(data: T) => {
  const ref = useRef<T>(data);
  useEffect(() => {
    ref.current = data
  }, [data]);
  return ref;
};

export default useRefCache;
