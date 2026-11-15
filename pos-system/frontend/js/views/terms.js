// terms.js
import { state, clearUser } from '../state.js';
import { getSidebar } from '../layouts/sidebar.js';
import { supabase } from '../config/supabaseClient.js';

export function renderTerms(container) {
    const user = state.user || { name: 'Guest', role: 'manager' };
    
    container.innerHTML = `
        <div class="app-layout">
            <aside class="sidebar">
                ${getSidebar('terms', user.role)}
            </aside>
            <header class="topbar">
                <h2>Terms of Usage</h2>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span>${user.name}</span>
                    <button id="logout-btn" class="icon-btn" title="Logout">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                </div>
            </header>
            <main class="main-content">
                <div style="background: var(--card-bg); padding: 40px; border-radius: 8px; max-width: 800px; margin: 0 auto; line-height: 1.8;">
                    <h1 style="color: var(--text); margin-bottom: 30px;">Terms of Usage</h1>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">Last updated: ${new Date().toLocaleDateString()}</p>
                    
                    <h3 style="color: var(--text); margin-top: 25px;">1. Acceptance of Terms</h3>
                    <p style="color: var(--text);">By accessing and using RamsyPOS, you accept and agree to be bound by these Terms of Usage. If you do not agree, please do not use our services.</p>
                    
                    <h3 style="color: var(--text); margin-top: 25px;">2. Subscription Plans</h3>
                    <p style="color: var(--text);">RamsyPOS offers three subscription plans:</p>
                    <ul style="color: var(--text); margin-left: 20px; margin-top: 10px;">
                        <li>Monthly: ₦35,600 (30 days)</li>
                        <li>Biannual: ₦203,700 (182 days)</li>
                        <li>Annual: ₦407,300 (365 days)</li>
                    </ul>
                    <p style="color: var(--text); margin-top: 10px;">A 3-day trial period is provided for new users. After the trial expires, access to the Point of Sale feature will be restricted until a subscription is purchased.</p>
                    
                    <h3 style="color: var(--text); margin-top: 25px;">3. Payment</h3>
                    <p style="color: var(--text);">All payments are processed securely through Paystack. Subscription fees are non-refundable once paid. Your subscription will be activated immediately after successful payment.</p>
                    
                    <h3 style="color: var(--text); margin-top: 25px;">4. User Responsibilities</h3>
                    <p style="color: var(--text);">You are responsible for maintaining the confidentiality of your login credentials. You agree not to share your account with unauthorized users or use the service for unlawful activities.</p>
                    
                    <h3 style="color: var(--text); margin-top: 25px;">5. Data Security</h3>
                    <p style="color: var(--text);">We use Supabase for secure data storage and authentication. Your data is encrypted and protected. However, we are not liable for data breaches caused by weak passwords or shared credentials.</p>
                    
                    <h3 style="color: var(--text); margin-top: 25px;">6. Service Availability</h3>
                    <p style="color: var(--text);">We strive for 99.9% uptime. However, we are not liable for service interruptions caused by factors beyond our control (internet outages, server maintenance, etc.).</p>
                    
                    <h3 style="color: var(--text); margin-top: 25px;">7. Termination</h3>
                    <p style="color: var(--text);">We reserve the right to terminate or suspend accounts that violate these terms. Upon termination, all data associated with your account may be deleted.</p>
                    
                    <h3 style="color: var(--text); margin-top: 25px;">8. Contact</h3>
                    <p style="color: var(--text);">For questions regarding these terms, please contact support.</p>
                    
                    <div style="margin-top: 40px; text-align: center;">
                        <a href="#payments" style="color: var(--primary); text-decoration: none;">← Back to Payments</a>
                    </div>
                </div>
            </main>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        clearUser();
        window.location.hash = '#login';
    });
}
