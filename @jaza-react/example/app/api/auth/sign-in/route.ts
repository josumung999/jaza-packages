import { JazaError } from '@jazadev/node';
import { getCurrentJazaEnv } from '@/lib/jaza-env';
import { getJazaServer } from '@/lib/jaza-server';
import { ensureCustomerForCurrentEnv } from '@/lib/remint-customer';
import {
  createUser,
  findUserByEmail,
  updateUserCustomerId,
} from '@/lib/users-store';

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
        { message: 'email and phoneNumber are required', code: 'invalid_request' },
        { status: 400 },
      );
    }

    const jaza = getJazaServer();
    const currentEnv = getCurrentJazaEnv();
    const existing = await findUserByEmail(email);

    if (existing) {
      const ensured = await ensureCustomerForCurrentEnv({
        jaza,
        user: existing,
        currentEnv,
        email,
        phoneNumber: phoneNumber || existing.phoneNumber,
      });

      let user = existing;
      if (ensured.reminted || existing.jazaEnv !== currentEnv) {
        const updated = await updateUserCustomerId(
          existing.id,
          ensured.customerId,
          currentEnv,
        );
        if (!updated) {
          return Response.json(
            { message: 'User not found', code: 'not_found' },
            { status: 404 },
          );
        }
        user = updated;
      }

      return Response.json({
        userId: user.id,
        customerId: user.customerId,
        email: user.email,
        phoneNumber: user.phoneNumber,
        reminted: ensured.reminted,
        jazaEnv: currentEnv,
      });
    }

    const customer = await jaza.createCustomer({
      name: email.split('@')[0] || 'Sample user',
      email,
      phoneNumber,
    });

    const user = await createUser({
      email,
      phoneNumber,
      customerId: customer.id,
      jazaEnv: currentEnv,
    });

    return Response.json({
      userId: user.id,
      customerId: user.customerId,
      email: user.email,
      phoneNumber: user.phoneNumber,
      reminted: false,
      jazaEnv: currentEnv,
    });
  } catch (err) {
    if (err instanceof JazaError) {
      const status =
        err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500;
      return Response.json(
        { message: err.message, code: err.code },
        { status },
      );
    }
    const message = err instanceof Error ? err.message : 'Sign-in failed';
    return Response.json({ message, code: 'api_error' }, { status: 500 });
  }
}
