'use strict';

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled';

export interface SapphireSubscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startedAt: Date;
  renewsAt: Date;
  canceledAt?: Date;
  seats: number;
}

