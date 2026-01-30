package com.Sticky_notes.Sticky_notes.services;

import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;

import java.util.Map;

public interface PaymentService {
    
    Session createCheckoutSession(String priceId, String successUrl, String cancelUrl) throws StripeException;
    
    com.stripe.model.billingportal.Session createCustomerPortalSession(String customerId) throws StripeException;
    
    Map<String, Object> getSubscriptionDetails(String subscriptionId) throws StripeException;
    
    boolean cancelSubscription(String subscriptionId) throws StripeException;
    
    String createCustomer(String email, String name) throws StripeException;
}
