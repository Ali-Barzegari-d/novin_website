export function GET() { return Response.json({ status: 'ok', service: 'web' }, { headers: { 'cache-control': 'no-store' } }); }
