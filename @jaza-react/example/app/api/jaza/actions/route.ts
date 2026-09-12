import { randomUUID } from 'node:crypto';
import { getJazaServer } from '@/lib/jaza-server';
import { findUserById } from '@/lib/users-store';

/**
 * Host billable action: maps signed-in user → jaza.consume({ featureCode }).
 * Never called from the web SDK directly.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return Response.json({ message: 'X-User-Id required' }, { status: 401 });
    }

    const user = await findUserById(userId);
    if (!user) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      featureCode?: string;
    };
    const featureCode = body.featureCode?.trim();
    if (!featureCode) {
      return Response.json(
        { message: 'featureCode is required' },
        { status: 400 },
      );
    }

    const result = await getJazaServer().consume({
      customerId: user.customerId,
      featureCode,
      idempotencyKey: `demo-action:${user.id}:${featureCode}:${randomUUID()}`,
    });

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Action failed';
    const insufficient = /insufficient/i.test(message);
    return Response.json(
      { message, code: insufficient ? 'INSUFFICIENT_CREDITS' : undefined },
      { status: insufficient ? 402 : 500 },
    );
  }
}
