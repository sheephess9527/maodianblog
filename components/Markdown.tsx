import React from 'react';

// 一个轻量的 Markdown 渲染器，零依赖。
// 支持：标题、段落、有序/无序列表、引用、代码块、行内代码、
//       粗体、斜体、链接、图片、分隔线。

let keyCounter = 0;
const nextKey = () => `md-${keyCounter++}`;

// ---------- 行内解析（粗体 / 斜体 / 代码 / 链接 / 图片）----------
function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // 依次匹配：图片、链接、行内代码、粗体、斜体
  const pattern =
    /(!\[([^\]]*)\]\(([^)]+)\))|(\[([^\]]+)\]\(([^)]+)\))|(`([^`]+)`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // 图片 ![alt](src)
      nodes.push(
        <img
          key={nextKey()}
          src={match[3]}
          alt={match[2]}
          className="my-8 w-full rounded-lg"
          loading="lazy"
        />,
      );
    } else if (match[4]) {
      // 链接 [text](href)
      const href = match[6];
      const external = /^https?:\/\//.test(href);
      nodes.push(
        <a
          key={nextKey()}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-2 hover:text-brand-500 dark:text-brand-400"
        >
          {match[5]}
        </a>,
      );
    } else if (match[7]) {
      // 行内代码 `code`
      nodes.push(
        <code
          key={nextKey()}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-pink-600 dark:bg-slate-800 dark:text-pink-400"
        >
          {match[8]}
        </code>,
      );
    } else if (match[9]) {
      // 粗体 **text**
      nodes.push(
        <strong key={nextKey()} className="font-semibold text-slate-900 dark:text-white">
          {parseInline(match[10])}
        </strong>,
      );
    } else if (match[11]) {
      // 斜体 *text*
      nodes.push(
        <em key={nextKey()} className="italic">
          {parseInline(match[12])}
        </em>,
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

// ---------- 块级解析 ----------
export function Markdown({ source }: { source: string }): React.ReactElement {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    let line = lines[i];

    // 空行
    if (line.trim() === '') {
      i++;
      continue;
    }

    // 代码块 ```
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i]);
        i++;
      }
      i++; // 跳过结束的 ```
      blocks.push(
        <pre
          key={nextKey()}
          className="my-8 overflow-x-auto rounded-lg bg-slate-900 p-5 text-sm leading-relaxed text-slate-100 dark:bg-black/60"
        >
          <code data-lang={lang} className="font-mono">
            {code.join('\n')}
          </code>
        </pre>,
      );
      continue;
    }

    // 表格（GFM 风格）：
    //   | 表头 | 表头 |
    //   | --- | --- |
    //   | 单元 | 单元 |
    if (
      line.trim().startsWith('|') &&
      i + 1 < lines.length &&
      /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) &&
      lines[i + 1].includes('-')
    ) {
      const splitRow = (row: string) =>
        row
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim());

      const headers = splitRow(line);
      i += 2; // 跳过表头行和分隔行
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitRow(lines[i]));
        i++;
      }

      blocks.push(
        <div key={nextKey()} className="my-8 overflow-x-auto rounded-md border border-slate-200 dark:border-slate-800">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60">
                {headers.map((h) => (
                  <th
                    key={nextKey()}
                    className="border-b border-slate-200 px-4 py-2.5 text-left font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                  >
                    {parseInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={nextKey()} className="even:bg-slate-50/50 dark:even:bg-slate-800/30">
                  {row.map((cell) => (
                    <td
                      key={nextKey()}
                      className="border-b border-slate-100 px-4 py-2.5 text-slate-600 last:border-0 dark:border-slate-800 dark:text-slate-300"
                    >
                      {parseInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // 分隔线
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      blocks.push(<hr key={nextKey()} className="my-10 border-slate-200 dark:border-slate-800" />);
      i++;
      continue;
    }

    // 标题
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const content = parseInline(heading[2]);
      const cls = {
        1: 'mt-12 mb-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white',
        2: 'mt-12 mb-4 text-2xl font-bold text-slate-900 dark:text-white',
        3: 'mt-10 mb-3 text-xl font-semibold text-slate-900 dark:text-white',
        4: 'mt-8 mb-2 text-lg font-semibold text-slate-900 dark:text-white',
      }[level as 1 | 2 | 3 | 4];
      blocks.push(
        React.createElement(
          `h${level}`,
          { key: nextKey(), className: cls },
          content,
        ),
      );
      i++;
      continue;
    }

    // 引用
    if (line.trim().startsWith('>')) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quote.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote
          key={nextKey()}
          className="my-8 border-l-4 border-accent-400 py-2 pl-6 pr-4 italic text-slate-500 dark:text-slate-400"
        >
          {parseInline(quote.join(' '))}
        </blockquote>,
      );
      continue;
    }

    // 有序列表
    if (/^\d+\.\s+/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push(
        <ol
          key={nextKey()}
          className="my-6 ml-6 list-decimal space-y-2 marker:text-brand-500"
        >
          {items.map((it) => (
            <li key={nextKey()} className="pl-1 leading-[1.9]">
              {parseInline(it)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    // 无序列表
    if (/^[-*]\s+/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul
          key={nextKey()}
          className="my-6 ml-6 list-disc space-y-2 marker:text-brand-500"
        >
          {items.map((it) => (
            <li key={nextKey()} className="pl-1 leading-[1.9]">
              {parseInline(it)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // 普通段落（合并连续的非空行）
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('```') &&
      !/^(#{1,4})\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith('>') &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith('|') &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={nextKey()} className="my-6 text-[1.05rem] leading-[1.9] text-slate-700 dark:text-slate-300">
        {parseInline(para.join(' '))}
      </p>,
    );
  }

  return <div>{blocks}</div>;
}
