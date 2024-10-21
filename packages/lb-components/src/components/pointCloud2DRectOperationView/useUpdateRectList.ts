import { useDebounceFn } from 'ahooks'

export const useUpdateRectList = (fn: () => void) => {
  // The `fn` is high frequency function, using `debounce` to optimize the performance
  const { run } = useDebounceFn(fn, { wait: 100 })

  return run
}