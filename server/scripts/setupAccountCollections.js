import dotenv from 'dotenv';
import dns from 'node:dns';
import mongoose from 'mongoose';
import { accountCollections } from '../src/model/accountCollectionModels.js';
import { ensureAccountCollections, listDatabaseCollections } from '../src/utils/accountCollections.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI;

async function configureMongoDns() {
  if (!mongoUri?.startsWith('mongodb+srv://')) return;

  const clusterHost = new URL(mongoUri).hostname;
  try {
    await dns.promises.resolveSrv(`_mongodb._tcp.${clusterHost}`);
  } catch (error) {
    if (error.code !== 'ECONNREFUSED') throw error;

    const fallbackServers = (process.env.MONGO_DNS_SERVERS || '8.8.8.8,1.1.1.1')
      .split(',')
      .map((server) => server.trim())
      .filter(Boolean);
    dns.setServers(fallbackServers);
    await dns.promises.resolveSrv(`_mongodb._tcp.${clusterHost}`);
  }
}

async function setupAccountCollections() {
  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined.');
  }

  await configureMongoDns();
  await mongoose.connect(mongoUri);
  console.log('MongoDB Atlas connected successfully.');

  const createdCollections = await ensureAccountCollections();
  const allCollections = await listDatabaseCollections();

  console.log(`Database: ${mongoose.connection.name}`);
  console.log(`Required collections: ${accountCollections.map((collection) => collection.key).join(', ')}`);
  console.log(
    createdCollections.length
      ? `Created collections: ${createdCollections.join(', ')}`
      : 'Created collections: none, all required collections already exist'
  );
  console.log(`All collection names: ${allCollections.join(', ')}`);
}

setupAccountCollections()
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
