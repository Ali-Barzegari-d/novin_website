import { createWriteStream } from 'node:fs';
import { mkdir, rename, rm } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { randomUUID } from 'node:crypto';
import { fileTypeFromFile } from 'file-type';
import type { MultipartFile } from '@fastify/multipart';
import type { AppConfig } from '@novin/config';

const blockedExtensions = new Set(['.exe', '.com', '.bat', '.cmd', '.sh', '.js', '.zip', '.rar', '.7z', '.xlsm', '.docm']);

export async function savePrivateUpload(file: MultipartFile, config: AppConfig, roots = { quarantine: join(process.cwd(), 'var/uploads/quarantine'), clean: join(process.cwd(), 'var/uploads/clean') }) {
  const originalName = basename(file.filename).replace(/[\x00-\x1f]/g, '').slice(0, 255);
  const extension = extname(originalName).toLowerCase();
  if (!originalName || blockedExtensions.has(extension) || /\.[^.]+\.[^.]+$/.test(originalName) && blockedExtensions.has(extname(originalName.slice(0, -extension.length)).toLowerCase())) throw new Error('نوع فایل مجاز نیست.');
  const storageName = randomUUID();
  await mkdir(roots.quarantine, { recursive: true, mode: 0o700 });
  await mkdir(roots.clean, { recursive: true, mode: 0o700 });
  const quarantinePath = join(roots.quarantine, storageName);
  let size = 0;
  file.file.on('data', (chunk: Buffer) => { size += chunk.length; });
  await pipeline(file.file, createWriteStream(quarantinePath, { mode: 0o600 }));
  if (file.file.truncated || size > config.UPLOAD_MAX_BYTES) {
    await rm(quarantinePath, { force: true });
    throw new Error('حجم فایل از حد مجاز بیشتر است.');
  }
  const detected = await fileTypeFromFile(quarantinePath);
  if (!detected || !config.allowedUploadTypes.includes(detected.mime) || detected.ext !== extension.slice(1).replace('jpg', 'jpeg')) {
    await rm(quarantinePath, { force: true });
    throw new Error('نوع واقعی فایل با فرمت مجاز هم‌خوانی ندارد.');
  }
  const bytes = await (await import('node:fs/promises')).readFile(quarantinePath);
  if (bytes.includes(Buffer.from('X5O!P%@AP'))) {
    await rm(quarantinePath, { force: true });
    throw new Error('فایل توسط اسکن امنیتی رد شد.');
  }
  if (config.APP_ENV === 'production') await clamavScan(quarantinePath, config);
  await rename(quarantinePath, join(roots.clean, storageName));
  return { originalName, storageName, detectedMime: detected.mime, sizeBytes: size };
}

async function clamavScan(path: string, config: AppConfig) {
  const { createConnection } = await import('node:net');
  const socket = createConnection({ host: config.CLAMAV_HOST, port: config.CLAMAV_PORT });
  const result = await new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('اسکن امنیتی در دسترس نیست.')), 15_000);
    let output = '';
    socket.on('connect', () => socket.write(`zSCAN ${path}\0`));
    socket.on('data', (chunk) => { output += chunk.toString(); });
    socket.on('end', () => { clearTimeout(timer); resolve(output); });
    socket.on('error', (error) => { clearTimeout(timer); reject(error); });
  });
  if (!result.includes('OK')) throw new Error('فایل توسط اسکن امنیتی رد شد یا اسکن در دسترس نیست.');
}
