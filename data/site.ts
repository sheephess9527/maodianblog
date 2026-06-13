// 站点级别的配置 —— 之后想改名字 / 简介 / 社交链接，改这里即可。

export const siteConfig = {
  title: '墨记',
  subtitle: 'Inkwell',
  description: '一个简洁现代的个人博客，记录想法、教程与日常。',
  author: '博主',
  // 导航栏链接
  nav: [
    { label: '首页', route: '#/' },
    { label: '关于', route: '#/about' },
  ],
  // 页脚社交链接（留空的会自动隐藏）
  social: {
    github: 'https://github.com/',
    email: 'mailto:hello@example.com',
    twitter: '',
  },
  // “关于”页面的内容（Markdown）
  about: `
## 关于这个博客

你好，欢迎来到 **墨记**。

这是一个用来记录想法、技术笔记和生活随笔的地方。目前你看到的内容都是示例文字，
之后可以把它们替换成你自己的故事。

### 想聊聊？

- 在 [GitHub](https://github.com/) 上找到我
- 或者发邮件到 hello@example.com

> 写作是为了思考得更清楚。
`,
};
