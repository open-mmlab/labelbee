# LabelBee - Git Commit 规范记录

## 目的：

1. 统一 git commit 的内容，便于后续 release changelog 的生成
2. 后续版本更新根据 git commit - type 进行更新

## 方式：

1. 通过 commitlint 在 pre-commit 的内容进行校验
2. 规范校验会按照 Conventional Commits 进行设置
    1. `<type>[optional scope]: <description>`

## 规范内容：

### 1. Type - 当前 commit 的类型，具体允许类型如下：

```tsx
'type-enum': [
      2,
      'always',
      [
        'feat',
        'update',
        'fix',
        'refactor',
        'optimize',
        'style',
        'docs',
        'chore',
        'test',
        'perf',
        'revert',
      ],
],
```

```bash
$ git commit -m 'feat(scope): description'
```

基本覆盖了所有基础类型，具体的 type 定义可以参照下方资源

### 2. Scope - 当前影响范围

按照当前 commit 的更改 / 修复 / 功能范围进行编写。例如：

> 为 pointCloudView 模式提供更多配置
> 

```bash
$ git commit -m 'feat(pointcloud-view): Support custom configuration of bgColor and ortho'
```

### 3. 用英文来编写 git commit

毕竟还是在 Github 上开源的东西，尽量让大家都看得明白哈哈

### 4. header max - 72 characters

当前限制 header 使用默认最大 72 个字符，建议其他多余的内容解释放在 Body 内

```bash
git commit -m 'feat(pointCloud): Header is so long' -m 'I am lonnnnng body'
```

## 资源：

1. Conventional Commit [https://www.conventionalcommits.org/en/v1.0.0/#specification](https://www.conventionalcommits.org/en/v1.0.0/#specification)