import { cp, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const source = join(process.cwd(), '.next/static');
const destination = join(process.cwd(), '.next/standalone/apps/web/.next/static');

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
