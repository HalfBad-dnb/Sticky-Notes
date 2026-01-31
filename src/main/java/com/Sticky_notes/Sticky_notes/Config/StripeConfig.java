package com.Sticky_notes.Sticky_notes.Config;

import com.stripe.Stripe;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;

@Configuration
public class StripeConfig {
    
    @PostConstruct
    public void init() {
        String stripeSecretKey = System.getenv("STRIPE_SECRET_KEY");
        if (stripeSecretKey != null && !stripeSecretKey.isEmpty()) {
            Stripe.apiKey = stripeSecretKey;
        }
    }
}
