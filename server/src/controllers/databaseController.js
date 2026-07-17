import mongoose from 'mongoose';
import { accountCollections } from '../model/accountCollectionModels.js';
import { ensureAccountCollections, listDatabaseCollections } from '../utils/accountCollections.js';
import { sendInternalServerError } from '../utils/httpError.js';

export async function getCollectionNames(_req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.'
      });
    }

    await ensureAccountCollections();

    return res.json({
      success: true,
      requiredCollections: accountCollections.map((collection) => collection.key),
      collections: await listDatabaseCollections()
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'database_collections_failed');
  }
}
