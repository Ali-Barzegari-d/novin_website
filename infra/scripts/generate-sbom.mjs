import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const store = join(root, 'node_modules/.pnpm');
const packageJsonFiles = new Set();

async function addPackages(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === '.bin') continue;
    if (entry.name.startsWith('@')) {
      const scoped = await readdir(join(directory, entry.name), { withFileTypes: true }).catch(() => []);
      for (const child of scoped) if (child.isDirectory()) packageJsonFiles.add(join(directory, entry.name, child.name, 'package.json'));
    } else {
      packageJsonFiles.add(join(directory, entry.name, 'package.json'));
    }
  }
}

for (const entry of await readdir(store, { withFileTypes: true }).catch(() => [])) {
  if (entry.isDirectory()) await addPackages(join(store, entry.name, 'node_modules'));
}

const components = new Map();
for (const filename of packageJsonFiles) {
  try {
    const pkg = JSON.parse(await readFile(filename, 'utf8'));
    if (!pkg.name || !pkg.version) continue;
    const purlName = encodeURIComponent(pkg.name).replace(/%2F/gi, '/');
    const purl = `pkg:npm/${purlName}@${encodeURIComponent(pkg.version)}`;
    const license = typeof pkg.license === 'string' ? { license: { name: pkg.license } } : undefined;
    components.set(`${pkg.name}@${pkg.version}`, { type: 'library', name: pkg.name, version: pkg.version, purl, ...(license ? { licenses: [license] } : {}) });
  } catch {
    // A broken optional package cannot make the release tooling report a false SBOM.
    throw new Error(`Unable to read installed dependency manifest: ${filename}`);
  }
}

if (!components.size) throw new Error('No installed pnpm dependencies were found for SBOM generation.');
const app = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const bom = {
  $schema: 'https://cyclonedx.org/schema/bom-1.6.schema.json',
  bomFormat: 'CycloneDX',
  specVersion: '1.6',
  version: 1,
  metadata: { component: { type: 'application', name: app.name, version: app.version } },
  components: [...components.values()].sort((left, right) => left.purl.localeCompare(right.purl))
};

await mkdir(join(root, 'artifacts'), { recursive: true });
await writeFile(join(root, 'artifacts/sbom.json'), `${JSON.stringify(bom, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`CycloneDX SBOM generated: ${bom.components.length} components\n`);
