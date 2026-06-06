const { createVerifier } = require('fast-jwt');

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAp5y/RhLpOagonlGTqEtS
ooz1weuHzRujm4K+KdMNgmsFepGyy1jDSXiTou62ihFU13NcWijCXI3T5xgS2FPw
kuFYdRSRbmIxvyeoVgTuyP5dUKD/WmfqwgIjv+vc5cZlTTRZ2u4iVQ4G1WqA+H4Y
aCj0L1b3K9M7CUE09XybTB3JOKZp6AD6eemdDp3uqmbTF+3UkPyCg750Ulc0VPsj
i+RL3bwX1qZrCpw2XlWx0U+lnypnfoZYXhKl48X3WmQPzYlClU9C+pRdbStXGzgC
5iR5LrNAn0pLZIFQhORjDoX/k08sPYkepXG/1fN674ZLUqkEtGArhHpMgURNiaUP
0QIDAQAB
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
