import type { JazaEnv } from './jaza-env';

export type SampleUser = {
  id: string;
  email: string;
  phoneNumber: string;
  customerId: string;
  /** Key environment that minted `customerId` (`test` / `live`). */
  jazaEnv?: JazaEnv;
  createdAt: string;
};

export type SessionUser = {
  userId: string;
  customerId: string;
  email: string;
  phoneNumber: string;
};
