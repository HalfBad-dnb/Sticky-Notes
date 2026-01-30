import React from 'react';
import './Subscription.css';

const Subscription = () => {
  return (
    <div className="subscription-container">
      <div className="subscription-card">
        <div className="card-header">
          <h1 className="card-title">Premium Subscription</h1>
          <p className="card-subtitle">
            Unlock powerful features and take your sticky notes to the next level
          </p>
        </div>

        <div className="card-content">
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">📝</div>
              <div className="feature-text">
                <div className="feature-title">Unlimited Notes</div>
                <div className="feature-description">
                  Create as many sticky notes as you need without any limitations
                </div>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">🎨</div>
              <div className="feature-text">
                <div className="feature-title">Premium Themes</div>
                <div className="feature-description">
                  Access exclusive themes and customization options
                </div>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">👥</div>
              <div className="feature-text">
                <div className="feature-title">Team Collaboration</div>
                <div className="feature-description">
                  Share and collaborate on sticky notes with your team
                </div>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div className="feature-text">
                <div className="feature-title">Advanced Analytics</div>
                <div className="feature-description">
                  Track usage patterns and get insights from your notes
                </div>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <div className="feature-text">
                <div className="feature-title">Enhanced Security</div>
                <div className="feature-description">
                  Additional security features and data encryption
                </div>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">🚀</div>
              <div className="feature-text">
                <div className="feature-title">Priority Support</div>
                <div className="feature-description">
                  Get faster response times from our support team
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pricing-section">
          <div className="pricing-header">
            <h2 className="pricing-title">Simple, Transparent Pricing</h2>
            <p className="pricing-description">
              Choose the plan that works best for you
            </p>
          </div>
          
          <div className="price-display">
            <div className="price-amount">$9.99</div>
            <div className="price-period">per month</div>
          </div>
          
          <ul className="price-features">
            <li className="price-feature">
              <span className="price-feature-icon">✓</span>
              All premium features included
            </li>
            <li className="price-feature">
              <span className="price-feature-icon">✓</span>
              Cancel anytime
            </li>
            <li className="price-feature">
              <span className="price-feature-icon">✓</span>
              30-day money back guarantee
            </li>
            <li className="price-feature">
              <span className="price-feature-icon">✓</span>
              Priority customer support
            </li>
          </ul>
        </div>

        <div className="action-section">
          <button className="cta-button" disabled>
            Payment System Not Available
          </button>
          <a href="/subscription" className="secondary-button">
            View All Plans
          </a>
        </div>
      </div>
    </div>
  );
};

export default Subscription;