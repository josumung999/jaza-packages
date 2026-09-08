import { JazaError } from '@jazadev/node';
import { getJazaServer } from '@/lib/jaza-server';
import { findUserById } from '@/lib/users-store';

/**
 * Host handshake: maps the signed-in demo user → jaza.init({ customerId }).
 * Returns InitResult (sessionToken + wallet/features snapshot) for the RN SDK.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return Response.json(
        { message: 'X-User-Id required', code: 'unauthorized' },
        { status: 401 },
      );
    }

    const user = await findUserById(userId);
    if (!user) {
      return Response.json(
        { message: 'User not found', code: 'not_found' },
        { status: 404 },
      );
    }

    const result = await getJazaServer().init({
      customerId: user.customerId,
    });

    return Response.json(result);
  } catch (err) {
    if (err instanceof JazaError) {
      const status =
        err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500;
      return Response.json(
        { message: err.message, code: err.code },
        { status },
      );
    }
    const message = err instanceof Error ? err.message : 'Jaza init failed';
    return Response.json({ message, code: 'api_error' }, { status: 500 });
  }
}
