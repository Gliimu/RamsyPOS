// subscription.js
import { supabase } from '../config/supabaseClient.js';

const BACKEND_URL = 'https://ramsypos-backend.onrender.com';

const PRICING = {
  monthly: { amount: 35600, duration_days: 30, label: 'Monthly' },
  biannual: { amount: 203700, duration_days: 182, label: 'Biannual (6 months)' },
  annual: { amount: 407300, duration_days: 365, label: 'Annual (1 year)' }
};

export async function getSubscriptionStatus(userId) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/subscription/${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

export async function initializePayment(userId, plan, email) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/paystack/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan, email })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Error initializing payment:', error);
    return null;
  }
}

export async function verifyPayment(reference) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/paystack/verify/${reference}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return null;
  }
}

export function getPricing() {
  return PRICING;
}

export function isSubscriptionActive(subscription) {
  if (!subscription) return false;
  return subscription.is_active === true;
}

export function isWithinWarningPeriod(subscription) {
  if (!subscription || !subscription.is_active) return false;
  
  const now = new Date();
  let expiryDate;
  
  if (subscription.status === 'trial') {
    // During trial (3 days): always show modal since trial is short
    return true;
  } else if (subscription.status === 'active') {
    expiryDate = new Date(subscription.subscription_end_date);
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    // Show modal only when 5 days or less remain (days 25-30 of a 30-day subscription)
    return daysUntilExpiry <= 5 && daysUntilExpiry > 0;
  } else {
    return false;
  }
}

export function getDaysUntilExpiry(subscription) {
  if (!subscription) return 0;
  
  let expiryDate;
  if (subscription.status === 'trial') {
    expiryDate = new Date(subscription.trial_end_date);
  } else if (subscription.status === 'active') {
    expiryDate = new Date(subscription.subscription_end_date);
  } else {
    return 0;
  }
  
  const now = new Date();
  return Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
}
