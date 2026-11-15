// app.js
import './router.js';
// app.js (add this below existing code)
import { supabase } from './config/supabaseClient.js';
import { getSubscriptionStatus, isWithinWarningPeriod, getDaysUntilExpiry } from './utils/subscription.js';

// Check subscription and show warning banner
async function checkAndShowWarningBanner() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const subscription = await getSubscriptionStatus(session.user.id);
    if (isWithinWarningPeriod(subscription)) {
        const daysLeft = getDaysUntilExpiry(subscription);
        let expiryDate;
        if (subscription.status === 'trial') {
            expiryDate = new Date(subscription.trial_end_date);
        } else {
            expiryDate = new Date(subscription.subscription_end_date);
        }
        
        // Remove existing banner
        const existingBanner = document.getElementById('warning-banner');
        if (existingBanner) existingBanner.remove();
        
        // Create banner
        const banner = document.createElement('div');
        banner.id = 'warning-banner';
        banner.style.cssText = `
            background: #f59e0b;
            color: white;
            padding: 10px 20px;
            text-align: center;
            font-weight: 500;
            font-size: 14px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
        `;
        banner.innerHTML = `
            <span>Your subscription expires on ${expiryDate.toLocaleDateString()} (${daysLeft} days remaining). Renew to avoid service interruption.</span>
            <button onclick="window.location.hash='#payments'" style="background: white; color: #f59e0b; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">Renew Now</button>
        `;
        
        // Insert at top of body
        document.body.insertBefore(banner, document.body.firstChild);
        
        // Push app content down
        const appDiv = document.getElementById('app');
        if (appDiv) appDiv.style.marginTop = '50px';
    }
}

// Run check after page loads
setTimeout(checkAndShowWarningBanner, 2000);
window.addEventListener('hashchange', () => setTimeout(checkAndShowWarningBanner, 1000));

// Apply dark mode on initial load
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}
