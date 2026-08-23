import { getJazaServer } from '@/lib/jaza-server';
import { findUserById } from '@/lib/users-store';

export async function GET(request: Request): Promise<Response> {
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return Response.json({ message: 'X-User-Id required' }, { status: 401 });
    }

    const user = await findUserById(userId);
    if (!user) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    const wallet = await getJazaServer().getBalance({
      customerId: user.customerId,
    });

    return Response.json({ balanceCredits: wallet.balanceCredits });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Balance failed';
    return Response.json({ message }, { status: 500 });
  }
}
