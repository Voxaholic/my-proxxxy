export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send("No URL");

  try {
    const target = new URL(url.startsWith('http') ? url : 'https://' + url);
    const response = await fetch(target, {
      method: req.method,
      headers: { ...req.headers, host: target.host },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined
    });

    let data = response.headers.get('content-type')?.includes('text/html')
      ? await response.text()
      : await response.blob();

    if (typeof data === 'string') {
      data = data
        .replace(/href="\//g, `href="${target.origin}/`)
        .replace(/src="\//g, `src="${target.origin}/`)
        .replace(/action="\//g, `action="${target.origin}/`);
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(response.status).send(data);
  } catch (e) {
    res.status(500).send("Proxy error");
  }
}
