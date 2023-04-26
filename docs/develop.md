# 项目初始化

```bash
git clone
cd labelbee
npm i && npm run bootstrap
npm run start
```

# 编码规范

## Commit 规范

[LabelBee CommitLint 规范](./commitlint.md)

## 注释 (参考: [jsDoc](url: https://jsdoc.app/))

### 文件头

```
/**
 * @file description.....
 * @createdate YYYY-MM-DD
 * @author Name Mail
 */
```

### 函数注释

```
/**
 * 是否在指定范围内
 * @param value 判断的数值
 * @param range 限制范围
 * @returns 是否在范围内
 */
public static isInRange = (value: number | number[], range: number[]): boolean => {
  const min = Math.min(...range);
  const max = Math.max(...range);
  const inRange = (v: number) => v <= max && v >= min;
  const values = Array.isArray(value) ? value : [value];
  return values.every((v: number) => inRange(v));
};
```
