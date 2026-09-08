import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { JazaEnv } from './jaza-env';
import type { SampleUser } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function ensureStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, '[]\n', 'utf8');
  }
}

export async function readUsers(): Promise<SampleUser[]> {
  await ensureStore();
  const raw = await fs.readFile(USERS_FILE, 'utf8');
  try {
    const parsed = JSON.parse(raw) as SampleUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: SampleUser[]): Promise<void> {
  await ensureStore();
  await fs.writeFile(USERS_FILE, `${JSON.stringify(users, null, 2)}\n`, 'utf8');
}

export async function findUserByEmail(
  email: string,
): Promise<SampleUser | undefined> {
  const users = await readUsers();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized);
}

export async function findUserById(
  id: string,
): Promise<SampleUser | undefined> {
  const users = await readUsers();
  return users.find((u) => u.id === id);
}

export async function createUser(input: {
  email: string;
  phoneNumber: string;
  customerId: string;
  jazaEnv: JazaEnv;
}): Promise<SampleUser> {
  const users = await readUsers();
  const user: SampleUser = {
    id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    email: input.email.trim().toLowerCase(),
    phoneNumber: input.phoneNumber.trim(),
    customerId: input.customerId,
    jazaEnv: input.jazaEnv,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeUsers(users);
  return user;
}

/** Overwrite customerId after sandbox→live (or reverse) remint. */
export async function updateUserCustomerId(
  userId: string,
  customerId: string,
  jazaEnv: JazaEnv,
): Promise<SampleUser | undefined> {
  const users = await readUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index < 0) return undefined;
  users[index] = {
    ...users[index],
    customerId,
    jazaEnv,
  };
  await writeUsers(users);
  return users[index];
}
