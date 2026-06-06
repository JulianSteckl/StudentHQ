const { MongoClient } = require('mongodb');

let client = null;
let db = null;

async function getDb() {
  if (db) return db;
  client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    tlsAllowInvalidCertificates: true,
  });
  await client.connect();
  db = client.db('studenthq');
  return db;
}

module.exports = { getDb };
