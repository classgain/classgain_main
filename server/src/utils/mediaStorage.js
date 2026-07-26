import fs from 'node:fs';
import { Readable } from 'node:stream';
import mongoose from 'mongoose';

import { normalizeImageMimeType } from './imageFiles.js';

const BUCKET_NAME = 'registrationMedia';

function getBucket() {
  if (!mongoose.connection.db) throw new Error('MongoDB is not connected.');
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: BUCKET_NAME });
}

export async function storeUploadedFile(file) {
  if (!file?.path && !file?.buffer) return '';
  const contentType = normalizeImageMimeType(file) || file.mimetype || 'application/octet-stream';
  const upload = getBucket().openUploadStream(file.originalname, {
    contentType,
    metadata: { fieldName: file.fieldname, uploadedAt: new Date() }
  });

  await new Promise((resolve, reject) => {
    const source = file.buffer ? Readable.from(file.buffer) : fs.createReadStream(file.path);
    source
      .on('error', reject)
      .pipe(upload)
      .on('error', reject)
      .on('finish', resolve);
  });

  return `/api/media/${upload.id}`;
}

export async function deleteStoredFile(value) {
  const match = typeof value === 'string' && value.match(/^\/api\/media\/([a-f\d]{24})$/i);
  if (match) {
    await getBucket().delete(new mongoose.Types.ObjectId(match[1])).catch(() => undefined);
  }
}

export async function streamStoredFile(req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.fileId)) {
    return res.status(404).json({ success: false, message: 'Media not found.' });
  }

  try {
    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    const [file] = await bucket.find({ _id: fileId }).limit(1).toArray();
    if (!file) return res.status(404).json({ success: false, message: 'Media not found.' });
    const contentType =
      normalizeImageMimeType({ mimetype: file.contentType, originalname: file.filename }) ||
      file.contentType ||
      'application/octet-stream';

    res.set({
      'Content-Type': contentType,
      'Content-Length': String(file.length),
      'Content-Disposition': `inline; filename="${encodeURIComponent(file.filename)}"`,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    });
    return bucket.openDownloadStream(fileId).on('error', next).pipe(res);
  } catch (error) {
    return next(error);
  }
}
