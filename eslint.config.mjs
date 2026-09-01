import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  { files: ['**/*.{ts,tsx}'], rules: { '@typescript-eslint/consistent-type-imports': 'error' } },
  { settings: { react: { version: '19.2' }, next: { rootDir: 'apps/web' } } },
  { ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', 'artifacts/**', 'var/**', 'vendor/**'] }
];

export default config;
