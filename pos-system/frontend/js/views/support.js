// support.js
import { state, clearUser } from '../state.js';
import { getSidebar } from '../layouts/sidebar.js';
import { supabase } from '../config/supabaseClient.js';

export function renderSupport(container) {
    const user = state.user || { name: 'Guest', role: 'manager' };
    
    container.innerHTML = `
        <div class="app-layout">
            <aside class="sidebar">
                ${getSidebar('support', user.role)}
            </aside>
            <header class="topbar">
                <h2>Contact Support</h2>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span>${user.name}</span>
                    <button id="logout-btn" class="icon-btn" title="Logout">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                </div>
            </header>
            <main class="main-content">
                <div style="background: var(--card-bg); padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: var(--text); margin-bottom: 30px; text-align: center;">We're Here to Help</h1>
                    
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <!-- WhatsApp -->
                        <a href="https://wa.me/2348000000000" target="_blank" style="display: flex; align-items: center; gap: 20px; padding: 20px; background: var(--bg); border-radius: 12px; text-decoration: none; transition: transform 0.2s;">
                            <div style="width: 50px; height: 50px; background: #25D366; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            </div>
                            <div>
                                <h3 style="color: var(--text); margin: 0;">WhatsApp</h3>
                                <p style="color: var(--text-muted); margin: 5px 0 0 0;">+234 800 000 0000</p>
                            </div>
                        </a>
                        
                        <!-- Email -->
                        <a href="mailto:support@ramsypos.app" style="display: flex; align-items: center; gap: 20px; padding: 20px; background: var(--bg); border-radius: 12px; text-decoration: none; transition: transform 0.2s;">
                            <div style="width: 50px; height: 50px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <svg width="24" height="24" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            </div>
                            <div>
                                <h3 style="color: var(--text); margin: 0;">Email</h3>
                                <p style="color: var(--text-muted); margin: 5px 0 0 0;">support@ramsypos.app</p>
                            </div>
                        </a>
                        
                        <!-- Phone -->
                        <a href="tel:+2348000000000" style="display: flex; align-items: center; gap: 20px; padding: 20px; background: var(--bg); border-radius: 12px; text-decoration: none; transition: transform 0.2s;">
                            <div style="width: 50px; height: 50px; background: var(--success); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <svg width="24" height="24" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            </div>
                            <div>
                                <h3 style="color: var(--text); margin: 0;">Phone</h3>
                                <p style="color: var(--text-muted); margin: 5px 0 0 0;">+234 800 000 0000</p>
                            </div>
                        </a>
                        
                    </div>
                    
                    <div style="margin-top: 40px; text-align: center;">
                        <p style="color: var(--text-muted);">Response time: Within 24 hours</p>
                        <p style="color: var(--text-muted); margin-top: 10px;">Support hours: Monday - Friday, 9am - 6pm WAT</p>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center;">
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
