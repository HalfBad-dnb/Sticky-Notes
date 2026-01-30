import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const CheckoutForm = ({ priceId, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const { data } = await axios.post('/api/payments/create-checkout-session', {
        priceId,
        successUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-cancelled`
      });

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        setMessage(error.message);
      } else {
        onSuccess?.();
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      
      <button 
        disabled={isLoading || !stripe || !elements} 
        id="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
      >
        <span id="button-text">
          {isLoading ? 'Processing...' : 'Subscribe Now'}
        </span>
      </button>
      
      {message && (
        <div id="payment-message" className="text-red-600 mt-2">
          {message}
        </div>
      )}
    </form>
  );
};

export default CheckoutForm;
