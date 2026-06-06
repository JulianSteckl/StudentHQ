async function kvGet(key) {
  const url = process.env.KV_REST_API_URL + '/get/' + encodeURIComponent(key);
  const res = await fetch(url, {
    headers: { Authorization: 'Bearer ' + process.env.KV_REST_API_TOKEN },
  });
  const json = await res.json();
  return json.result ? JSON.parse(json.result) : null;
}

async function kvSet(key, value) {
  const url = process.env.KV_REST_API_URL + '/set/' + encodeURIComponent(key);
  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.KV_REST_API_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(JSON.stringify(value)),
  });
}

module.exports = { kvGet, kvSet };
