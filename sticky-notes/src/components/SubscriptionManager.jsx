import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './payment/PaymentPlans.css';

const SubscriptionManager = ({ user }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stripeConfigured, setStripeConfigured] = useState(true);

  const subscriptionTiers = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: ['5 notes', 'Basic themes', 'No collaboration'],
      stripePriceId: null,
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      features: ['Unlimited notes', 'Premium themes', 'Collaboration', 'Export options'],
      stripePriceId: 'price_1O2x34567890abcdef',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 29.99,
      features: ['Everything in Pro', 'Team management', 'Priority support', 'Custom integrations'],
      stripePriceId: 'price_1O2x34567890ghijkl',
      popular: false
    }
  ];

  useEffect(() => {
    checkStripeConfiguration();
    fetchSubscriptionDetails();
  }, []);

  const checkStripeConfiguration = async () => {
    try {
      await axios.post('/api/payments/create-checkout-session', {
        priceId: 'test_price',
        successUrl: 'http://localhost:3000/test',
        cancelUrl: 'http://localhost:3000/test'
      });
    } catch (err) {
      if (err.response?.status === 404 || err.message?.includes('Stripe is not configured')) {
        setStripeConfigured(false);
      }
    }
  };

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      if (user?.subscriptionId) {
        const response = await axios.get(`/api/payments/subscription/${user.subscriptionId}`);
        setSubscription(response.data);
      }
    } catch (err) {
      setError('Failed to fetch subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (priceId) => {
    if (!stripeConfigured) {
      setError('Payment system is not configured yet. Please contact administrator.');
      return;
    }
    
    try {
      const response = await axios.post('/api/payments/create-checkout-session', {
        priceId,
        successUrl: `${window.location.origin}/subscription-success`,
        cancelUrl: `${window.location.origin}/subscription-cancelled`
      });
      
      window.location.href = response.data.url;
    } catch (err) {
      setError('Failed to create checkout session');
    }
  };

  const handleManageSubscription = async () => {
    if (!stripeConfigured) {
      setError('Payment system is not configured yet. Please contact administrator.');
      return;
    }
    
    try {
      const response = await axios.post('/api/payments/create-customer-portal', {
        customerId: user.stripeCustomerId
      });
      
      window.location.href = response.data.url;
    } catch (err) {
      setError('Failed to open customer portal');
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.id) return;
    
    try {
      await axios.post(`/api/payments/cancel-subscription/${subscription.id}`);
      await fetchSubscriptionDetails();
    } catch (err) {
      setError('Failed to cancel subscription');
    }
  };

  if (loading) {
    return <div className="loading-state">Loading subscription details...</div>;
  }

  return (
    <div className="subscription-page">
      <div className="subscription-container">
        <div className="page-header">
          <h1 className="page-title">Choose Your Plan</h1>
          <p className="page-subtitle">
            Select the perfect plan for your needs. Upgrade anytime to unlock more features.
          </p>
        </div>
        
        {!stripeConfigured && (
          <div className="alert alert-warning">
            <strong>Payment System Not Configured:</strong> Stripe payment integration is not yet set up. 
            Subscription features will be available once payment processing is configured.
          </div>
        )}
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {subscription && (
          <div className="current-subscription">
            <div className="current-subscription-header">
              <div className="current-subscription-icon">
                💳
              </div>
              <div>
                <h2 className="current-subscription-title">Current Subscription</h2>
                <p className="current-subscription-status">{subscription.status}</p>
              </div>
            </div>
            
            <div className="current-subscription-details">
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-value">{subscription.status}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Period ends</span>
                <span className="detail-value">
                  {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Auto-renew</span>
                <span className="detail-value">
                  {subscription.cancelAtPeriodEnd ? 'Cancels at period end' : 'Auto-renews'}
                </span>
              </div>
            </div>
            
            <div className="current-subscription-actions">
              <button
                onClick={handleManageSubscription}
                disabled={!stripeConfigured}
                className="plan-button primary"
              >
                Manage Subscription
              </button>
              {!subscription.cancelAtPeriodEnd && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={!stripeConfigured}
                  className="plan-button secondary"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        )}

        <div className="pricing-grid">
          {subscriptionTiers.map((tier) => (
            <div
              key={tier.id}
              className={`pricing-card ${tier.popular ? 'popular' : ''}`}
            >
              <div className="plan-header">
                <h3 className="plan-name">{tier.name}</h3>
                <div className="plan-price">
                  <span className="price-currency">$</span>
                  <span className="price-amount">{tier.price}</span>
                  {tier.price > 0 && <span className="price-period">/month</span>}
                </div>
              </div>
              
              <div className="plan-features">
                <ul className="feature-list">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <span className="feature-icon">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="plan-actions">
                {tier.price === 0 ? (
                  <button className="plan-button current" disabled>
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(tier.stripePriceId)}
                    disabled={!stripeConfigured}
                    className="plan-button primary"
                  >
                    {stripeConfigured ? 'Subscribe Now' : 'Payment Not Available'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
