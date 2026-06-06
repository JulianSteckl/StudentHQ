const { kvGet, kvSet } = require('./lib/db');
const { getUserId } = require('./lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const userId = await getUserId(req.headers['authorization']);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const key = 'state:' + userId;

    if (req.method === 'GET') {
      const data = await kvGet(key);
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      await kvSet(key, req.body);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('api/state error:', e.message);
    return res.status(500).json({ error: e.message });
  }
};
