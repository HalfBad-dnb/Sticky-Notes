import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const StripePayment = ({ priceId, onSuccess, onCancel }) => {
  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '6px',
    },
  };

  const options = {
    mode: 'subscription',
    amount: 100,
    currency: 'usd',
    appearance,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm 
        priceId={priceId} 
        onSuccess={onSuccess} 
        onCancel={onCancel} 
      />
    </Elements>
  );
};

export default StripePayment;
