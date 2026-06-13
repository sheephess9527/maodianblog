// 把 YYYY-MM-DD 格式化成更友好的中文日期，例如 “2026 年 6 月 13 日”。
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${y} 年 ${m} 月 ${d} 日`;
}
