const { createVerifier } = require('fast-jwt');

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr4uLtR+6OV9YZbSoAPbN
LkDPa8E/CRZ6fRwMBFVAmRKCjr9Znmz/gTt+8UrgJO9aZhE020FXBi9qwGHxWgLA
0eyfLt9c502sr+Pzv1gB4MHeJPgiBnz42RCxmj6R9ftfB/dZImtiQgWwk2P8wdc3
xAWXjxCBXmNpTW7WiW6IbOVXOrX3ol6Sl/zJJHiJCTnnAexj2vCNKBTm4LCu2zIp
ntf6PFOLGEy25mMXHwTujffOnjsw7y7x+SmUyW0QhgKZ2RbusMBgu3MKVDXjStXa
yyb/P21UfpFifvPSw2pSucT1zEWfgF9Td+Xromo+r9bQI3RVNQb9gsZR92nhZfbw
aQIDAQAB
-----END PUBLIC KEY-----`;

const verify = createVerifier({ key: PUBLIC_KEY, algorithms: ['RS256'] });

async function getUserId(authHeader) {
  const token = (authHeader || '').replace('Bearer ', '').trim();
  if (!token) return null;
  try {
    const payload = verify(token);
    return payload.sub;
  } catch (e) {
    console.error('auth error:', e.message);
    return null;
  }
}

module.exports = { getUserId };
