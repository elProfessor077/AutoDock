const { NextResponse } = require('next/server');
const { blueprintCache } = require('@/lib/cache/blueprintCache');

export const dynamic = 'force-dynamic';

export async function GET() {
  const stats = blueprintCache.getTelemetry();
  return NextResponse.json(stats, { status: 200 });
}

export async function DELETE() {
  blueprintCache.clear();
  return NextResponse.json({ message: 'Blueprint LRU Cache purged successfully' }, { status: 200 });
}
