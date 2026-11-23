// 博客的核心数据类型

export interface Post {
  /** 用于 URL 的唯一标识，例如 hello-world */
  slug: string;
  /** 文章标题 */
  title: string;
  /** 文章摘要，显示在列表页 */
  excerpt: string;
  /** 发布日期，格式 YYYY-MM-DD */
  date: string;
  /** 作者 */
  author: string;
  /** 标签 */
  tags: string[];
  /** 预计阅读时长（分钟），构建时由 postsMetaPlugin 计算 */
  readingMinutes: number;
  /** 封面图地址，可选 */
  cover?: string;
  /** 正文 Markdown——仅在文章页按需加载，列表页为 undefined */
  content?: string;
}

export type Route =
  | { name: 'home' }
  | { name: 'post'; slug: string }
  | { name: 'tag'; tag: string }
  | { name: 'about' }
  | { name: 'notFound' };
