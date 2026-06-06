const { MongoClient } = require('mongodb');

let client = null;
let db = null;

async function getDb() {
  if (db) return db;
  const uri = process.env.MONGODB_URI;
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    ssl: true,
    tls: true,
    tlsInsecure: true,
  });
  await client.connect();
  db = client.db('studenthq');
  return db;
}

module.exports = { getDb };
