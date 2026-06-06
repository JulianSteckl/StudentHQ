async function kvGet(key) {
  const url = process.env.KV_REST_API_URL + '/get/' + encodeURIComponent(key);
  const res = await fetch(url, {
    headers: { Authorization: 'Bearer ' + process.env.KV_REST_API_TOKEN },
  });
  const json = await res.json();
  if (!json.result) return null;
  const parsed = JSON.parse(json.result);
  // Handle legacy double-encoded data
  if (typeof parsed === 'string') return JSON.parse(parsed);
  return parsed;
}

async function kvSet(key, value) {
  const url = process.env.KV_REST_API_URL + '/set/' + encodeURIComponent(key);
  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.KV_REST_API_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(value),
  });
}

module.exports = { kvGet, kvSet };
