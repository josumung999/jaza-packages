import { getJazaServer } from '@/lib/jaza-server';
import { createUser, findUserByEmail } from '@/lib/users-store';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as {
      email?: string;
      phoneNumber?: string;
    };

    const email = body.email?.trim() ?? '';
    const phoneNumber = body.phoneNumber?.trim() ?? '';

    if (!email || !phoneNumber) {
      return Response.json(
        { message: 'email and phoneNumber are required' },
        { status: 400 },
      );
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return Response.json({
        userId: existing.id,
        customerId: existing.customerId,
        email: existing.email,
        phoneNumber: existing.phoneNumber,
      });
    }

    const jaza = getJazaServer();
    const customer = await jaza.createCustomer({
      name: email.split('@')[0] || 'Sample user',
      email,
      phoneNumber,
    });

    const user = await createUser({
      email,
      phoneNumber,
      customerId: customer.id,
    });

    return Response.json({
      userId: user.id,
      customerId: user.customerId,
      email: user.email,
      phoneNumber: user.phoneNumber,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sign-in failed';
    return Response.json({ message }, { status: 500 });
  }
}
