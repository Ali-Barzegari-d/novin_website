import { cp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const standaloneWeb = join(root, '.next/standalone/apps/web');
await mkdir(join(standaloneWeb, '.next'), { recursive: true });
await cp(join(root, '.next/static'), join(standaloneWeb, '.next/static'), { recursive: true });
await cp(join(root, 'public'), join(standaloneWeb, 'public'), { recursive: true });
