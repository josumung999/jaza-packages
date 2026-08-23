import { getJazaServer } from '@/lib/jaza-server';
import { findUserById } from '@/lib/users-store';

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

    const session = await getJazaServer().topUp({
      customerId: user.customerId,
    });

    if (!session.token) {
      return Response.json(
        { message: 'Top-up session did not return a token' },
        { status: 500 },
      );
    }

    return Response.json({ token: session.token });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Top-up token failed';
    return Response.json({ message }, { status: 500 });
  }
}
