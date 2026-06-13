// 根据正文估算阅读时长（分钟）。
// 中文按字符数（约每分钟 350 字），英文按单词数（约每分钟 200 词），取较合理的估算。
export function estimateReadingMinutes(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ') // 去掉代码块
    .replace(/[#>*`_\-\[\]()!]/g, ' '); // 去掉常见 Markdown 符号

  const chineseChars = (text.match(/[一-龥]/g) || []).length;
  const englishWords = (text.match(/[A-Za-z0-9]+/g) || []).length;

  const minutes = chineseChars / 350 + englishWords / 200;
  return Math.max(1, Math.round(minutes));
}
