import { useEffect } from 'react';

// 记忆每篇文章的阅读位置：
//   - 打开文章时，恢复到用户上次滚动到的位置；
//   - 阅读过程中节流保存当前位置；
//   - 读到结尾则清除记录，下次从头开始。
// 恢复时考虑封面图 / 内容异步撑开高度的情况：在一小段时间内多帧重试，
// 一旦用户主动滚动（滚轮 / 触摸 / 键盘）就立即停止强制定位。
export function useReadingPosition(slug: string): void {
  useEffect(() => {
    const key = `anchor:read-pos:${slug}`;
    const saved = Number(localStorage.getItem(key) || 0);
    const jump = (y: number) =>
      window.scrollTo({ top: y, left: 0, behavior: 'instant' as ScrollBehavior });

    let stopped = saved <= 0;
    const stop = () => {
      stopped = true;
    };

    if (saved > 0) {
      window.addEventListener('wheel', stop, { passive: true });
      window.addEventListener('touchmove', stop, { passive: true });
      window.addEventListener('keydown', stop);

      const deadline = Date.now() + 1500;
      const tick = () => {
        if (stopped) return;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll >= saved) jump(saved);
        if (Date.now() < deadline) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } else {
      jump(0);
    }

    // 节流保存当前阅读位置；接近结尾视为读完，清除记录。
    let raf = 0;
    const save = () => {
      const y = Math.round(window.scrollY);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (y >= maxScroll - 120) localStorage.removeItem(key);
      else localStorage.setItem(key, String(y));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        save();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
      window.removeEventListener('keydown', stop);
      save();
    };
  }, [slug]);
}
