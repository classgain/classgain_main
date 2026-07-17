import mongoose from 'mongoose';
import { accountCollections } from '../model/accountCollectionModels.js';
import EducationCenter from '../model/educationCenterModel.js';
import EducationCenterHelpTicket from '../model/educationCenterHelpTicketModel.js';
import SequenceCounter from '../model/sequenceCounterModel.js';

const requiredCollections = [
  ...accountCollections,
  { key: 'education_centers', model: EducationCenter },
  { key: 'education_center_help_tickets', model: EducationCenterHelpTicket },
  { key: 'sequence_counters', model: SequenceCounter }
];

export async function ensureAccountCollections() {
  const createdCollections = [];

  for (const collection of requiredCollections) {
    const exists = await mongoose.connection.db
      .listCollections({ name: collection.key })
      .hasNext();

    if (!exists) {
      await collection.model.createCollection();
      createdCollections.push(collection.key);
    }
  }

  return createdCollections;
}

export async function listDatabaseCollections() {
  const collections = await mongoose.connection.db
    .listCollections({}, { nameOnly: true })
    .toArray();

  return collections.map((collection) => collection.name).sort();
}
