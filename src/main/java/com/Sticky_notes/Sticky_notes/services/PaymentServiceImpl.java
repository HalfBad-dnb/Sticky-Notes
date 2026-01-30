package com.Sticky_notes.Sticky_notes.services;

import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentServiceImpl implements PaymentService {
    
    @Override
    public Session createCheckoutSession(String priceId, String successUrl, String cancelUrl) throws StripeException {
        String stripeSecretKey = System.getenv("STRIPE_SECRET_KEY");
        if (stripeSecretKey == null || stripeSecretKey.isEmpty()) {
            throw new RuntimeException("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
        }
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPrice(priceId)
                                .setQuantity(1L)
                                .build()
                )
                .build();
        
        return Session.create(params);
    }
    
    @Override
    public com.stripe.model.billingportal.Session createCustomerPortalSession(String customerId) throws StripeException {
        String stripeSecretKey = System.getenv("STRIPE_SECRET_KEY");
        if (stripeSecretKey == null || stripeSecretKey.isEmpty()) {
            throw new RuntimeException("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
        }
        com.stripe.param.billingportal.SessionCreateParams params = 
                com.stripe.param.billingportal.SessionCreateParams.builder()
                        .setCustomer(customerId)
                        .setReturnUrl("http://localhost:3000/account")
                        .build();
        
        return com.stripe.model.billingportal.Session.create(params);
    }
    
    @Override
    public Map<String, Object> getSubscriptionDetails(String subscriptionId) throws StripeException {
        String stripeSecretKey = System.getenv("STRIPE_SECRET_KEY");
        if (stripeSecretKey == null || stripeSecretKey.isEmpty()) {
            throw new RuntimeException("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
        }
        Subscription subscription = Subscription.retrieve(subscriptionId);
        
        Map<String, Object> details = new HashMap<>();
        details.put("status", subscription.getStatus());
        details.put("currentPeriodEnd", subscription.getCurrentPeriodEnd());
        details.put("cancelAtPeriodEnd", subscription.getCancelAtPeriodEnd());
        details.put("customer", subscription.getCustomer());
        
        return details;
    }
    
    @Override
    public boolean cancelSubscription(String subscriptionId) throws StripeException {
        String stripeSecretKey = System.getenv("STRIPE_SECRET_KEY");
        if (stripeSecretKey == null || stripeSecretKey.isEmpty()) {
            throw new RuntimeException("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
        }
        Subscription subscription = Subscription.retrieve(subscriptionId);
        Subscription deletedSubscription = subscription.cancel();
        
        return "canceled".equals(deletedSubscription.getStatus());
    }
    
    @Override
    public String createCustomer(String email, String name) throws StripeException {
        String stripeSecretKey = System.getenv("STRIPE_SECRET_KEY");
        if (stripeSecretKey == null || stripeSecretKey.isEmpty()) {
            throw new RuntimeException("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.");
        }
        CustomerCreateParams params = CustomerCreateParams.builder()
                .setEmail(email)
                .setName(name)
                .build();
        
        Customer customer = Customer.create(params);
        return customer.getId();
    }
}
