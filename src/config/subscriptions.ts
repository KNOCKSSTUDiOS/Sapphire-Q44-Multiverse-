// KNOCKS STUDiOS LLC — Subscription Tiers
// hollywoodimaging.studio
// Stripe Product IDs: replace with your live Stripe price IDs

export type BillingInterval = 'monthly' | 'yearly';

export type TierKey = 'starter' | 'pro' | 'studio' | 'business' | 'enterprise';

export interface SubscriptionTier {
  key: TierKey;
  name: string;
  tagline: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  yearlySavings: string;
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
  features: string[];
  limits: Record<string, string>;
  highlighted: boolean;
  ctaLabel: string;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    key: 'starter',
    name: 'Starter',
    tagline: 'For indie creators just getting started',
    monthlyPrice: 9.99,
    yearlyPrice: 89.99,
    yearlySavings: 'Save 25%',
    stripePriceIdMonthly: 'price_starter_monthly',
    stripePriceIdYearly: 'price_starter_yearly',
    highlighted: false,
    ctaLabel: 'Start Free Trial',
    limits: {
      projects: '3 active projects',
      storage: '10 GB storage',
      exports: '5 exports/month',
      support: 'Community support',
    },
    features: [
      'Quantum-44 Teal-Core player',
      'Basic cinematic overlays',
      'HD export (1080p)',
      'KNOCKS STUDiOS watermark',
      'Email support',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    tagline: 'For working creatives who need more power',
    monthlyPrice: 29.99,
    yearlyPrice: 269.99,
    yearlySavings: 'Save 25%',
    stripePriceIdMonthly: 'price_pro_monthly',
    stripePriceIdYearly: 'price_pro_yearly',
    highlighted: false,
    ctaLabel: 'Go Pro',
    limits: {
      projects: '15 active projects',
      storage: '100 GB storage',
      exports: '50 exports/month',
      support: 'Priority email support',
    },
    features: [
      'Everything in Starter',
      'No watermark',
      '4K export',
      'Advanced cinematic filters',
      'Custom branding',
      'API access (read-only)',
      'Priority support',
    ],
  },
  {
    key: 'studio',
    name: 'Studio',
    tagline: 'Professional-grade for serious studios',
    monthlyPrice: 79.99,
    yearlyPrice: 719.99,
    yearlySavings: 'Save 25%',
    stripePriceIdMonthly: 'price_studio_monthly',
    stripePriceIdYearly: 'price_studio_yearly',
    highlighted: true,
    ctaLabel: 'Unlock Studio',
    limits: {
      projects: 'Unlimited projects',
      storage: '1 TB storage',
      exports: 'Unlimited exports',
      support: 'Live chat support',
      seats: 'Up to 5 seats',
    },
    features: [
      'Everything in Pro',
      'Real-time collaboration (5 seats)',
      '8K export',
      'Sapphire Q44 Multiverse engine',
      'Full API access',
      'Custom domain embedding',
      'Analytics dashboard',
      'Dedicated account manager',
    ],
  },
  {
    key: 'business',
    name: 'Business',
    tagline: 'Built for teams and production houses',
    monthlyPrice: 199.99,
    yearlyPrice: 1799.99,
    yearlySavings: 'Save 25%',
    stripePriceIdMonthly: 'price_business_monthly',
    stripePriceIdYearly: 'price_business_yearly',
    highlighted: false,
    ctaLabel: 'Go Business',
    limits: {
      projects: 'Unlimited projects',
      storage: '10 TB storage',
      exports: 'Unlimited exports',
      support: '24/7 phone + chat',
      seats: 'Up to 25 seats',
    },
    features: [
      'Everything in Studio',
      'Up to 25 team seats',
      'SSO / SAML authentication',
      'Advanced role permissions',
      'White-label output',
      'SLA: 99.9% uptime guarantee',
      'Quarterly business review',
      'Bulk licensing discounts',
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    tagline: 'Custom solutions for large organizations',
    monthlyPrice: null,
    yearlyPrice: null,
    yearlySavings: 'Custom pricing',
    stripePriceIdMonthly: 'price_enterprise_monthly',
    stripePriceIdYearly: 'price_enterprise_yearly',
    highlighted: false,
    ctaLabel: 'Contact Sales',
    limits: {
      projects: 'Unlimited',
      storage: 'Unlimited',
      exports: 'Unlimited',
      support: 'Dedicated engineering support',
      seats: 'Unlimited seats',
    },
    features: [
      'Everything in Business',
      'Unlimited seats',
      'On-premise deployment option',
      'Custom integrations & API',
      'Dedicated infrastructure',
      'SLA: 99.99% uptime',
      'Legal & IP licensing agreements',
      'Custom contract & invoicing',
      'Executive support line',
    ],
  },
];

export const TIER_ORDER: TierKey[] = ['starter', 'pro', 'studio', 'business', 'enterprise'];

export function getTierByKey(key: TierKey): SubscriptionTier | undefined {
  return SUBSCRIPTION_TIERS.find(t => t.key === key);
}

export function formatPrice(price: number | null, interval: BillingInterval): string {
  if (price === null) return 'Custom';
  return `$${price.toFixed(2)}/${interval === 'monthly' ? 'mo' : 'yr'}`;
}
