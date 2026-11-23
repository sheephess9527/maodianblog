declare module 'virtual:posts-meta' {
  const posts: Omit<import('./types').Post, 'content'>[];
  export default posts;
}

declare module 'virtual:posts-search' {
  const searchText: Record<string, string>;
  export default searchText;
}
