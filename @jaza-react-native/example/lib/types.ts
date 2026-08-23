export type SampleUser = {
  id: string;
  email: string;
  phoneNumber: string;
  customerId: string;
  createdAt: string;
};

export type SessionUser = {
  userId: string;
  customerId: string;
  email: string;
  phoneNumber: string;
};
