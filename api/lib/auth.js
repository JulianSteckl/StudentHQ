const { verifyToken } = require('@clerk/backend');

async function getUserId(authHeader) {
  const token = (authHeader || '').replace('Bearer ', '').trim();
  if (!token) return null;
  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    return payload.sub;
  } catch {
    return null;
  }
}

module.exports = { getUserId };
