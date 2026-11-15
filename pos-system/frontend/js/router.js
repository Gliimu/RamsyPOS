// router.js
import { renderLogin } from './views/login.js';
import { renderDashboard } from './views/dashboard.js';
import { renderPos } from './views/pos.js';
import { renderInventory } from './views/inventory.js';
import { renderTeam } from './views/team.js';
import { renderSettings } from './views/settings.js';
import { renderPayments } from './views/payments.js';
import { renderTerms } from './views/terms.js';
import { renderSupport } from './views/support.js';
import { renderForum } from './views/forum.js';
import { state, setUser, clearUser, setSubscription } from './state.js';
import { supabase } from './config/supabaseClient.js';
import { getSubscriptionStatus, isSubscriptionActive, isWithinWarningPeriod, getDaysUntilExpiry } from './utils/subscription.js';

const routes = {
    '/': renderLogin,
    '#login': renderLogin,
    '#dashboard': renderDashboard,
    '#pos': renderPos,
    '#inventory': renderInventory,
    '#team': renderTeam,
    '#settings': renderSettings,
    '#payments': renderPayments,
    '#terms': renderTerms,
    '#support': renderSupport,
    '#forum': renderForum
};

async function router() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const { data: { session } } = await supabase.auth.getSession();
    const path = window.location.hash || '#login';

    if (session) {
        if (!state.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, role, category')
                .eq('id', session.user.id)
                .single();
            
            if (profile) {
                setUser(profile.full_name, profile.role, profile.category);
            }
        }

        // Check subscription status
        const subscription = await getSubscriptionStatus(session.user.id);
        setSubscription(subscription);

        // Block POS if subscription expired
        if (path === '#pos' && !isSubscriptionActive(subscription)) {
            window.location.hash = '#payments';
            return;
        }

        // Block Forum if subscription expired
        if (path === '#forum' && !isSubscriptionActive(subscription)) {
            window.location.hash = '#payments';
            return;
        }

        if (path === '#login' || path === '/') {
            if (state.user.role === 'manager' || state.user.role === 'admin') {
                window.location.hash = '#dashboard';
            } else {
                window.location.hash = '#pos';
            }
            return;
        }

        // Show warning modal if within 25 days of expiry (but not on login page)
        if (isWithinWarningPeriod(subscription) && !session._warningShown) {
            session._warningShown = true; // Prevent showing multiple times per session
            setTimeout(() => showExpiryWarningModal(subscription), 1500);
        }
    } else {
        clearUser();
        if (path !== '#login' && path !== '/') {
            window.location.hash = '#login';
            return;
        }
    }

    const view = routes[path] || renderLogin;
    view(app);
}

async function showExpiryWarningModal(subscription) {
    const daysLeft = getDaysUntilExpiry(subscription);
    let expiryDate;
    if (subscription.status === 'trial') {
        expiryDate = new Date(subscription.trial_end_date);
    } else {
        expiryDate = new Date(subscription.subscription_end_date);
    }

    const overlay = document.createElement('div');
    overlay.id = 'expiry-warning-modal';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.6); z-index: 10000;
        display: flex; justify-content: center; align-items: center;
    `;

    overlay.innerHTML = `
        <div style="background: var(--card-bg); padding: 30px; border-radius: 12px; width: 420px; max-width: 90%; position: relative; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);">
            <button id="close-warning" style="position: absolute; top: 15px; right: 15px; background: transparent; border: none; cursor: pointer; padding: 5px;">
                <svg width="20" height="20" fill="none" stroke="var(--text-muted)" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div style="text-align: center;">
                <div style="width: 60px; height: 60px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <svg width="30" height="30" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                <h3 style="color: var(--text); margin: 0 0 15px 0; font-size: 20px;">Subscription Expiring Soon</h3>
                <p style="color: var(--text); font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
                    Your subscription expires on <strong>${expiryDate.toLocaleDateString()}</strong> (${daysLeft} days remaining).<br><br>
                    Please renew to avoid service interruption.
                </p>
                <div style="display: flex; gap: 10px;">
                    <button id="renew-now-btn" style="flex: 1; padding: 12px; background: #b8860b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 15px;">Renew Now</button>
                    <button id="later-btn" style="flex: 1; padding: 12px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 15px;">Later</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('close-warning').addEventListener('click', () => {
        overlay.remove();
    });

    document.getElementById('later-btn').addEventListener('click', () => {
        overlay.remove();
    });

    document.getElementById('renew-now-btn').addEventListener('click', () => {
        overlay.remove();
        window.location.hash = '#payments';
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        clearUser();
        window.location.hash = '#login';
    }
});
