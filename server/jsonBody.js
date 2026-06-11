/**
 * Netlify Functions + serverless-http sometimes deliver JSON bodies as Buffer
 * or leave req.body empty after express.json(). This middleware normalizes them.
 */
export function jsonBodyMiddleware(req, res, next) {
  const contentType = (req.headers['content-type'] || '').toLowerCase();
  if (!contentType.includes('application/json')) return next();

  const parseJson = (raw) => {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  if (Buffer.isBuffer(req.body)) {
    const parsed = parseJson(req.body.toString('utf8'));
    if (parsed === null) return res.status(400).json({ error: 'Invalid JSON body' });
    req.body = parsed;
    return next();
  }

  if (typeof req.body === 'string' && req.body.length > 0) {
    const parsed = parseJson(req.body);
    if (parsed === null) return res.status(400).json({ error: 'Invalid JSON body' });
    req.body = parsed;
    return next();
  }

  const empty =
    req.body == null
    || (typeof req.body === 'object' && Object.keys(req.body).length === 0);

  if (empty && req.rawBody?.length) {
    const parsed = parseJson(req.rawBody.toString('utf8'));
    if (parsed !== null) req.body = parsed;
  }

  next();
}
