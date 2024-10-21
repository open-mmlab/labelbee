export type MapIndirectWeakSet<T extends object> = Map<string, Map<string, WeakSet<T>>>;

/**
 * Update MapIndirectWeakSet
 *
 * @param map The map will be changed
 * @param key0 The top key
 * @param key1 The inner key
 * @param value The target to be set
 * @returns return map
 */
export const addMapIndirectWeakSetItem = <T extends object>(
  map: MapIndirectWeakSet<T>,
  key0: string,
  key1: string,
  value: T,
) => {
  let current = map.get(key0);
  if (!current) {
    current = new Map<string, WeakSet<T>>();
    map.set(key0, current);
  }

  let set = current.get(key1);
  if (!set) {
    set = new WeakSet<T>();
    current.set(key1, set);
  }

  set.add(value);

  return map;
};
