// Cloudflare Worker 入口。
// - 静态网站（dist/）通过 [assets] 绑定自动托管；
// - /auth 与 /callback 处理 GitHub OAuth 登录，供写作后台 (/admin) 使用。

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') return handleAuth(url, env);
    if (url.pathname === '/callback') return handleCallback(request, url, env);

    // 其余请求交给静态资源（首页、文章、/admin 等）
    return env.ASSETS.fetch(request);
  },
};

// 第一步：把用户重定向到 GitHub 授权页
async function handleAuth(url, env) {
  const clientId = env.GITHUB_CLIENT_ID;
  if (!clientId || !env.GITHUB_CLIENT_SECRET) {
    return new Response(
      'OAuth 未配置：请在 Worker 的环境变量里设置 GITHUB_CLIENT_ID 和 GITHUB_CLIENT_SECRET。',
      { status: 500, headers: { 'Content-Type': 'text/plain;charset=UTF-8' } },
    );
  }

  const state = crypto.randomUUID();
  const redirectUri = `${url.origin}/callback`;

  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', clientId);
  authorize.searchParams.set('redirect_uri', redirectUri);
  authorize.searchParams.set('scope', 'repo,user');
  authorize.searchParams.set('state', state);

  const headers = new Headers({ Location: authorize.toString() });
  headers.append(
    'Set-Cookie',
    `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
  );
  return new Response(null, { status: 302, headers });
}

// 第二步：用授权码换 token，并通过 postMessage 回传给后台窗口
async function handleCallback(request, url, env) {
  const provider = 'github';
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookie = request.headers.get('Cookie') || '';
  const savedState = /(?:^|;\s*)oauth_state=([^;]+)/.exec(cookie)?.[1];

  if (!code || !state || !savedState || state !== savedState) {
    return renderMessage(provider, 'error', '登录状态校验失败，请重试。');
  }

  let data;
  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'maodianblog-cms',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    data = await res.json();
  } catch (e) {
    return renderMessage(provider, 'error', '获取 token 失败：' + e.message);
  }

  if (data.error || !data.access_token) {
    return renderMessage(provider, 'error', data.error_description || data.error || '未能获取 token');
  }

  return renderMessage(provider, 'success', { token: data.access_token, provider });
}

// 按 Decap/Sveltia CMS 约定的握手协议，把结果发回打开它的后台窗口
function renderMessage(provider, status, result) {
  const content = `authorization:${provider}:${status}:${JSON.stringify(result)}`;
  const body = `<!doctype html><html><head><meta charset="utf-8"></head><body>
<p style="font-family:sans-serif">登录处理中，请稍候…</p>
<script>
(function () {
  function receiveMessage(e) {
    window.opener.postMessage(${JSON.stringify(content)}, e.origin);
    window.removeEventListener('message', receiveMessage, false);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener && window.opener.postMessage('authorizing:${provider}', '*');
})();
</script>
</body></html>`;
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}
