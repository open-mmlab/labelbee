/**
 * 将 LaTeX 数学公式从 \(...\) 格式转换为 $...$ 格式
 * @param latexContent - 包含 LaTeX 数学公式的原始字符串
 * @returns 转换后的字符串，其中数学公式使用 $...$ 格式
 */
export const convertLatexFormat = (latexContent: string) => {
  try {
    // 匹配 \( ... \) 并替换为 $...$
    return latexContent.replace(/\\\((.*?)\\\)/g, (_, formula) => `$${formula.trim()}$`);
  } catch (error) {
    // 发生错误时返回原始字符串
    return latexContent;
  }
};
