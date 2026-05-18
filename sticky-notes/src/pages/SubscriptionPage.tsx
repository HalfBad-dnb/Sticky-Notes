import React from 'react';
import SubscriptionManager from '../components/SubscriptionManager';

const SubscriptionPage = () => {
  // Mock user data - in a real app, this would come from authentication context
  const user = {
    subscriptionId: null, // Would come from user data
    stripeCustomerId: null, // Would come from user data
  };

  return (
    <div className="subscription-page">
      <div className="container mx-auto px-4 py-8">
        <SubscriptionManager user={user} />
      </div>
    </div>
  );
};

export default SubscriptionPage;
