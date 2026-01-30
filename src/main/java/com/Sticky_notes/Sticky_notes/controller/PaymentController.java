package com.Sticky_notes.Sticky_notes.controller;

import com.stripe.exception.StripeException;
import com.Sticky_notes.Sticky_notes.services.PaymentService;
import com.stripe.model.checkout.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, String>> createCheckoutSession(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String priceId = request.get("priceId");
            String successUrl = request.get("successUrl");
            String cancelUrl = request.get("cancelUrl");
            
            Session session = paymentService.createCheckoutSession(priceId, successUrl, cancelUrl);
            
            Map<String, String> response = new HashMap<>();
            response.put("sessionId", session.getId());
            response.put("url", session.getUrl());
            
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/create-customer-portal")
    public ResponseEntity<Map<String, String>> createCustomerPortal(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String customerId = request.get("customerId");
            
            com.stripe.model.billingportal.Session portalSession = paymentService.createCustomerPortalSession(customerId);
            
            Map<String, String> response = new HashMap<>();
            response.put("url", portalSession.getUrl());
            
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/subscription/{subscriptionId}")
    public ResponseEntity<Map<String, Object>> getSubscriptionDetails(@PathVariable String subscriptionId) {
        try {
            Map<String, Object> details = paymentService.getSubscriptionDetails(subscriptionId);
            return ResponseEntity.ok(details);
        } catch (StripeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/cancel-subscription/{subscriptionId}")
    public ResponseEntity<Map<String, Boolean>> cancelSubscription(@PathVariable String subscriptionId) {
        try {
            boolean cancelled = paymentService.cancelSubscription(subscriptionId);
            Map<String, Boolean> response = new HashMap<>();
            response.put("cancelled", cancelled);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            Map<String, Boolean> error = new HashMap<>();
            error.put("cancelled", false);
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/create-customer")
    public ResponseEntity<Map<String, String>> createCustomer(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String name = request.get("name");
            
            String customerId = paymentService.createCustomer(email, name);
            
            Map<String, String> response = new HashMap<>();
            response.put("customerId", customerId);
            
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
