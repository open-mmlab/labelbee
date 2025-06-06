/**
 * 将 LaTeX 数学公式从 \(...\) 格式转换为 $...$ 格式，以及 \[...\] 格式转换为 $$...$$格式
 * @param latexContent - 包含 LaTeX 数学公式的原始字符串
 * @returns 转换后的字符串，其中行内公式使用 $...$ 格式，行间公式使用 $$...$$ 格式
 */
export const convertLatexFormat = (latexContent: string) => {
  try {
    // 转换行内公式 \(...\) => $...$
    const inlineConverted = latexContent.replace(/\\\((.+?)\\\)/gs, (_, content) => `$${content}$`);

    // 转换行间公式 \[...\] => $$...$$
    const blockConverted = inlineConverted.replace(
      /\\\[(.+?)\\\]/gs,
      (_, content) => `$$${content}$$`,
    );

    return blockConverted;
  } catch (error) {
    // 发生错误时返回原始字符串
    return latexContent;
  }
};
