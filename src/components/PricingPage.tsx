import { useState } from 'react';
import { SUBSCRIPTION_TIERS, formatPrice, type BillingInterval } from '../config/subscriptions';

const CHECK_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="8" fill="#06b6d4" />
    <path d="M4.5 8.5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SAPPHIRE_LOGO = (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="Sapphire Q44">
    <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" fill="#0e1a2b" stroke="#06b6d4" strokeWidth="1.5" />
    <text x="8" y="21" fontFamily="monospace" fontWeight="bold" fontSize="11" fill="#06b6d4">Q44</text>
  </svg>
);

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingInterval>('monthly');
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSubscribe = async (tierKey: string, priceId: string) => {
    if (tierKey === 'enterprise') {
      window.location.href = 'mailto:sales@hollywoodimaging.studio?subject=Enterprise%20Inquiry';
      return;
    }
    setLoadingTier(tierKey);
    try {
      // TODO: Replace with real Stripe Checkout session creation
      console.log('Subscribing to', tierKey, 'price:', priceId);
      // const res = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ priceId }),
      // });
      // const { url } = await res.json();
      // window.location.href = url;
      alert(`Stripe checkout coming soon for ${tierKey}`);
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="pricing-page">
      {/* Hero */}
      <header className="pricing-hero">
        <div className="pricing-logo">{SAPPHIRE_LOGO}</div>
        <h1 className="pricing-headline">
          Real-Time Release Studio<br />
          <span className="pricing-headline-accent">Professional Plans</span>
        </h1>
        <p className="pricing-subhead">
          Power your creative workflow with Sapphire Q44 Multiverse.
          From indie creators to enterprise studios.
        </p>

        {/* Billing Toggle */}
        <div className="billing-toggle" role="group" aria-label="Billing interval">
          <button
            className={`toggle-btn${billing === 'monthly' ? ' active' : ''}`}
            onClick={() => setBilling('monthly')}
            aria-pressed={billing === 'monthly'}
          >
            Monthly
          </button>
          <button
            className={`toggle-btn${billing === 'yearly' ? ' active' : ''}`}
            onClick={() => setBilling('yearly')}
            aria-pressed={billing === 'yearly'}
          >
            Yearly
            <span className="save-badge">Save 25%</span>
          </button>
        </div>
      </header>

      {/* Tier Cards */}
      <section className="pricing-grid" aria-label="Subscription plans">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const price = billing === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice;
          const priceId = billing === 'monthly' ? tier.stripePriceIdMonthly : tier.stripePriceIdYearly;
          const isLoading = loadingTier === tier.key;

          return (
            <article
              key={tier.key}
              className={`tier-card${tier.highlighted ? ' tier-card--featured' : ''}`}
              aria-label={`${tier.name} plan`}
            >
              {tier.highlighted && (
                <div className="featured-badge" aria-label="Most popular plan">
                  ★ Most Popular
                </div>
              )}

              <div className="tier-header">
                <h2 className="tier-name">{tier.name}</h2>
                <p className="tier-tagline">{tier.tagline}</p>
              </div>

              <div className="tier-price">
                {price === null ? (
                  <span className="price-custom">Custom</span>
                ) : (
                  <>
                    <span className="price-amount">{formatPrice(price)}</span>
                    <span className="price-interval">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
                  </>
                )}
                {billing === 'yearly' && tier.yearlySavings > 0 && (
                  <p className="price-savings">Save ${tier.yearlySavings.toFixed(0)}/yr</p>
                )}
              </div>

              <button
                className={`cta-btn${tier.highlighted ? ' cta-btn--primary' : ''}`}
                onClick={() => handleSubscribe(tier.key, priceId ?? '')}
                disabled={isLoading}
                aria-label={`${tier.ctaLabel} — ${tier.name} plan`}
              >
                {isLoading ? 'Processing...' : tier.ctaLabel}
              </button>

              <ul className="feature-list" aria-label={`${tier.name} features`}>
                {tier.features.map((feature) => (
                  <li key={feature} className="feature-item">
                    <span className="feature-check" aria-hidden="true">{CHECK_ICON}</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="tier-limits">
                <div className="limit-item">
                  <span className="limit-label">Projects</span>
                  <span className="limit-value">
                    {tier.limits.projects === null ? 'Unlimited' : tier.limits.projects}
                  </span>
                </div>
                <div className="limit-item">
                  <span className="limit-label">Storage</span>
                  <span className="limit-value">{tier.limits.storageGB === null ? 'Custom' : `${tier.limits.storageGB >= 1000 ? tier.limits.storageGB / 1000 + 'TB' : tier.limits.storageGB + 'GB'}`}</span>
                </div>
                <div className="limit-item">
                  <span className="limit-label">Exports/mo</span>
                  <span className="limit-value">
                    {tier.limits.exportsPerMonth === null ? 'Unlimited' : tier.limits.exportsPerMonth}
                  </span>
                </div>
                <div className="limit-item">
                  <span className="limit-label">Team Seats</span>
                  <span className="limit-value">
                    {tier.limits.seats === null ? 'Unlimited' : tier.limits.seats}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Footer note */}
      <footer className="pricing-footer">
        <p>
          All plans auto-renew. Cancel anytime.
          Payments processed securely by{' '}
          <a href="https://stripe.com" target="_blank" rel="noopener noreferrer">Stripe</a>.
        </p>
        <p>
          Questions?{' '}
          <a href="mailto:sales@hollywoodimaging.studio">Contact our team</a>{' '}
          or read our{' '}
          <a href="/terms">Terms of Service</a>.
        </p>
      </footer>
    </div>
  );
}
