export const BillingCycle = {
  Monthly: 0,
  Yearly: 1,
  Weekly: 2,
} as const;

export const Status = {
  Active: 0,
  Cancelled: 1,
  Paused: 2,
} as const;

export type BillingCycleValue =
  (typeof BillingCycle)[keyof typeof BillingCycle];
export type StatusValue = (typeof Status)[keyof typeof Status];

export interface Subscription {
  id: number;
  name: string;
  price?: number;
  currency: string;
  billingCycle: BillingCycleValue;
  status: StatusValue;
  nextBillingDate: string;
  startDate: string;
  serviceUrl: string;
}

export interface WriteSubscription {
  name?: string;
  price?: number;
  currency?: string;
  billingCycle?: BillingCycleValue;
  status?: StatusValue;
  nextBillingDate: string;
  startDate?: string;
  serviceUrl?: string;
}

export interface User {
  name: string;
  email: string;
  currency: string;
}
