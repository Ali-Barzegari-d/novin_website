import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
const { stdout } = await exec('git', ['grep', '-nEI', '(kavenegar.{0,20}[0-9a-z]{24,}|-----BEGIN (RSA |OPENSSH )?PRIVATE KEY|AKIA[0-9A-Z]{16})', '--', '.', ':!docs/PRD.md', ':!docs/PRODUCT_DISCOVERY.md'], { maxBuffer: 1024 * 1024 }).catch((error) => error.code === 1 ? { stdout: '' } : Promise.reject(error));
if (stdout) { console.error(stdout); process.exit(1); }
console.log('secret scan passed');
