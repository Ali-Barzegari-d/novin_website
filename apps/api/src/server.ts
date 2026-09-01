import { createApp } from './app.js';

const app = await createApp();
const port = Number(process.env.PORT ?? 4000);
await app.listen({ port, host: '0.0.0.0' });

let closing = false;
async function shutdown(signal: string) {
  if (closing) return;
  closing = true;
  app.log.info({ signal }, 'graceful shutdown started');
  try {
    await app.close();
    process.exitCode = 0;
  } catch (error) {
    app.log.error({ err: error, signal }, 'graceful shutdown failed');
    process.exitCode = 1;
  }
}
for (const signal of ['SIGTERM', 'SIGINT'] as const) process.once(signal, () => { void shutdown(signal); });
