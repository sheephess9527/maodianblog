import { Post } from '../types';

// 所有文章都放在这个数组里。想新增一篇文章，复制一个对象、改内容即可。
// content 字段用 Markdown 编写，支持标题、列表、引用、代码、链接、图片、粗体/斜体等。
export const posts: Post[] = [
  {
    slug: 'hello-world',
    title: '你好，世界 —— 这个博客的第一篇文章',
    excerpt:
      '欢迎来到墨记！这是一篇示例文章，用来展示博客的排版效果。你可以把它替换成自己的内容。',
    date: '2026-06-13',
    author: '博主',
    tags: ['公告', '随笔'],
    cover:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=70',
    content: `
欢迎来到 **墨记**！这是博客的第一篇文章，主要用来展示页面的排版和样式。

## 这个博客能做什么

- 在首页按时间倒序展示所有文章
- 每篇文章有独立的阅读页面，支持完整的 Markdown 排版
- 可以按**标签**筛选文章
- 支持**明暗主题**一键切换
- 在手机、平板、电脑上都能良好显示

## Markdown 排版示例

下面演示一些常见的写作元素。

### 引用

> 写作是为了把模糊的想法，变成清晰的句子。

### 列表

1. 第一步：想清楚要写什么
2. 第二步：动手写下来
3. 第三步：删掉多余的部分

### 代码

行内代码像这样：\`const blog = '墨记'\`。代码块像这样：

\`\`\`js
function greet(name) {
  return \`你好，\${name}！\`;
}

console.log(greet('世界'));
\`\`\`

### 链接与强调

你可以在文中插入[链接](https://example.com)，也可以用**粗体**或*斜体*来强调。

---

准备好了吗？把这篇示例换成你的第一篇真正的文章吧。
`,
  },
  {
    slug: 'writing-tips',
    title: '保持写作的三个小习惯',
    excerpt:
      '写作不需要灵感爆发，更多时候靠的是稳定的小习惯。分享我自己常用的三个方法。',
    date: '2026-06-10',
    author: '博主',
    tags: ['写作', '随笔'],
    content: `
很多人觉得写作需要等灵感来了再动笔。但我发现，真正让人持续产出的，是几个朴素的小习惯。

## 一、先写烂的初稿

第一稿的任务只有一个：**把东西写完**，而不是写好。允许自己写得很烂，反而更容易开始。

## 二、固定一个时间

不依赖心情，而依赖时间表。哪怕每天只写十分钟，积累下来也很可观。

> 节奏比强度更重要。

## 三、写给一个具体的人

想象你在给某位朋友写信，文字会自然变得清楚、亲切，不再端着。

试试看，挑一个最容易做到的开始就好。
`,
  },
  {
    slug: 'why-static-blog',
    title: '为什么我选择一个简单的静态博客',
    excerpt:
      '没有数据库、没有后台，一个静态博客也能很好用。聊聊它的好处和适用场景。',
    date: '2026-06-05',
    author: '博主',
    tags: ['技术', '建站'],
    content: `
这个博客本身就是一个**静态网站**：没有数据库，没有服务器后台，所有页面都是构建时生成的文件。

## 它的好处

- **快**：纯静态文件，加载几乎是瞬间的
- **稳**：没有后台逻辑，能出错的地方就少
- **省**：可以免费托管在 GitHub Pages、Vercel、Netlify 等平台
- **安全**：没有数据库和登录系统，攻击面非常小

## 适合谁

如果你主要是想**发布文章、记录想法**，而不需要评论系统、用户登录这类动态功能，
那么一个静态博客几乎是最省心的选择。

需要评论？也可以后续接入第三方评论服务，依然保持站点本体的简单。
`,
  },
];

// 按日期倒序排列（最新的在前）
export const sortedPosts = [...posts].sort((a, b) => b.date.localeCompare(a.date));

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

// 收集所有标签及其文章数量
export function getAllTags(): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
