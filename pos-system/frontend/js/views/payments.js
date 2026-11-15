// payments.js
import { state, clearUser } from '../state.js';
import { getSidebar } from '../layouts/sidebar.js';
import { supabase } from '../config/supabaseClient.js';
import { showModal } from '../utils/modal.js';
import { getSubscriptionStatus, initializePayment, verifyPayment, getPricing, getDaysUntilExpiry } from '../utils/subscription.js';

export async function renderPayments(container) {
    const user = state.user || { name: 'Guest', role: 'manager' };
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    let subscription = null;
    if (userId) {
        subscription = await getSubscriptionStatus(userId);
    }
    
    const pricing = getPricing();
    const daysLeft = getDaysUntilExpiry(subscription);
    
    container.innerHTML = `
        <div class="app-layout">
            <aside class="sidebar">
                ${getSidebar('payments', user.role, state.subscriptionActive)}
            </aside>
            <header class="topbar">
                <h2>Usage</h2>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span>${user.name}</span>
                    <button id="logout-btn" class="icon-btn" title="Logout">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                </div>
            </header>
            <main class="main-content">
                
                <div style="background: var(--card-bg); padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h3 style="color: var(--text); margin-bottom: 15px;">Current Status</h3>
                    ${subscription ? `
                        <div style="display: flex; gap: 30px; flex-wrap: wrap;">
                            <div>
                                <p style="color: var(--text-muted); font-size: 13px;">Plan</p>
                                <p style="color: var(--text); font-size: 18px; font-weight: bold; text-transform: capitalize;">${subscription.plan}</p>
                            </div>
                            <div>
                                <p style="color: var(--text-muted); font-size: 13px;">Status</p>
                                <p style="color: ${subscription.is_active ? 'var(--success)' : 'var(--danger)'}; font-size: 18px; font-weight: bold; text-transform: capitalize;">${subscription.is_active ? 'Active' : 'Expired'}</p>
                            </div>
                            <div>
                                <p style="color: var(--text-muted); font-size: 13px;">Days Remaining</p>
                                <p style="color: ${daysLeft <= 3 ? 'var(--danger)' : 'var(--text)'}; font-size: 18px; font-weight: bold;">${daysLeft} days</p>
                            </div>
                            ${subscription.subscription_end_date ? `
                                <div>
                                    <p style="color: var(--text-muted); font-size: 13px;">Expires On</p>
                                    <p style="color: var(--text); font-size: 18px; font-weight: bold;">${new Date(subscription.subscription_end_date).toLocaleDateString()}</p>
                                </div>
                            ` : ''}
                        </div>
                    ` : `
                        <p style="color: var(--text-muted);">No subscription found. Please select a plan below.</p>
                    `}
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    ${Object.entries(pricing).map(([key, plan]) => `
                        <div style="background: var(--card-bg); padding: 30px; border-radius: 12px; text-align: center; border: 2px solid ${key === 'biannual' ? '#b8860b' : 'var(--border)'}; position: relative; ${key === 'biannual' ? 'transform: scale(1.05);' : ''}">
                            ${key === 'biannual' ? '<div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #b8860b; color: white; padding: 4px 16px; border-radius: 12px; font-size: 12px; font-weight: bold;">MOST POPULAR</div>' : ''}
                            <h3 style="color: var(--text); margin-bottom: 10px;">${plan.label}</h3>
                            <p style="font-size: 32px; font-weight: bold; color: #b8860b; margin: 15px 0;">₦${plan.amount.toLocaleString()}</p>
                            <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">${plan.duration_days} days access</p>
                            <button class="pay-btn" data-plan="${key}" style="width: 100%; padding: 12px; background: #b8860b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 15px;">Subscribe Now</button>
                        </div>
                    `).join('')}
                </div>

                <div style="background: var(--card-bg); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: var(--text); margin-bottom: 15px;">Payment History</h3>
                    <div id="payment-history" style="color: var(--text-muted);">Loading...</div>
                </div>

                <div style="display: flex; gap: 20px; justify-content: center; margin-top: 30px;">
                    <a href="#terms" style="color: var(--primary); text-decoration: none;">Terms of Usage</a>
                    <span style="color: var(--text-muted);">|</span>
                    <a href="#support" style="color: var(--primary); text-decoration: none;">Contact Support</a>
                </div>
            </main>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        clearUser();
        window.location.hash = '#login';
    });

    document.querySelectorAll('.pay-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const plan = e.target.dataset.plan;
            
            try {
                const result = await initializePayment(userId, plan, session?.user?.email);
                if (result && result.authorization_url) {
                    window.location.href = result.authorization_url;
                } else {
                    await showModal('Failed to initialize payment. Please try again.');
                }
            } catch (error) {
                await showModal('Error: ' + error.message);
            }
        });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    if (reference) {
        const result = await verifyPayment(reference);
        if (result) {
            await showModal('Payment successful! Your subscription is now active.');
            window.history.replaceState({}, document.title, window.location.pathname);
            window.location.reload();
        }
    }

    await loadPaymentHistory(userId);
}

async function loadPaymentHistory(userId) {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const historyContainer = document.getElementById('payment-history');
        
        if (!data || data.length === 0) {
            historyContainer.innerHTML = '<p style="color: var(--text-muted);">No payment history.</p>';
            return;
        }

        historyContainer.innerHTML = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="text-align: left; border-bottom: 2px solid var(--border);">
                        <th style="padding: 10px; color: var(--text);">Date</th>
                        <th style="padding: 10px; color: var(--text);">Plan</th>
                        <th style="padding: 10px; color: var(--text);">Amount</th>
                        <th style="padding: 10px; color: var(--text);">Status</th>
                        <th style="padding: 10px; color: var(--text);">Expiry</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(sub => `
                        <tr style="border-bottom: 1px solid var(--border);">
                            <td style="padding: 10px; color: var(--text);">${new Date(sub.created_at).toLocaleDateString()}</td>
                            <td style="padding: 10px; color: var(--text); text-transform: capitalize;">${sub.plan}</td>
                            <td style="padding: 10px; color: var(--text);">₦${(sub.amount_paid || 0).toLocaleString()}</td>
                            <td style="padding: 10px; color: ${sub.status === 'active' ? 'var(--success)' : 'var(--text-muted)'}; text-transform: capitalize;">${sub.status}</td>
                            <td style="padding: 10px; color: var(--text);">${sub.subscription_end_date ? new Date(sub.subscription_end_date).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading payment history:', error);
    }
}
