import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = fileURLToPath(new URL('../../', import.meta.url));

export function resolveUploadDirectory(...segments) {
  const configuredDirectory = process.env.UPLOAD_DIR?.trim();
  const rootDirectory = configuredDirectory
    ? path.resolve(serverRoot, configuredDirectory)
    : path.join(serverRoot, 'uploads');

  return path.join(rootDirectory, ...segments);
}
