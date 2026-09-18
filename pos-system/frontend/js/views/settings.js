// settings.js
import { state, clearUser } from '../state.js';
import { getSidebar } from '../layouts/sidebar.js';
import { supabase } from '../config/supabaseClient.js';

export function renderSettings(container) {
    const user = state.user || { name: 'Guest', role: 'pos_attendant' };

    // Check if dark mode is already enabled
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    container.innerHTML = `
        <div class="app-layout">
            <aside class="sidebar">
                ${getSidebar('settings', user.role)}
            </aside>
            <header class="topbar">
                <h2>Settings</h2>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span>${user.name}</span>
                    <button id="logout-btn" class="icon-btn" title="Logout">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                </div>
            </header>
            <main class="main-content">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    
                    <!-- Change Password Card -->
                    <div style="background: var(--card-bg); padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <h3 style="margin-bottom: 20px;">Change Password</h3>
                        <form id="update-password-form" style="display: flex; flex-direction: column; gap: 15px;">
                            <input type="password" id="new-password" placeholder="New Password" required minlength="6" style="padding: 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--card-bg); color: var(--text);">
                            <input type="password" id="confirm-password" placeholder="Confirm New Password" required minlength="6" style="padding: 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--card-bg); color: var(--text);">
                            <button type="submit" style="padding: 10px; background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Update Password</button>
                        </form>
                    </div>

                    <!-- Appearance Card -->
                    <div style="background: var(--card-bg); padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <h3 style="margin-bottom: 20px;">Appearance</h3>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
                            <span>Dark Mode</span>
                            <label style="position: relative; display: inline-block; width: 50px; height: 24px;">
                                <input type="checkbox" id="theme-toggle" ${isDarkMode ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                                <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; border-radius: 24px; transition: 0.4s;">
                                    <span style="position: absolute; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; border-radius: 50%; transition: 0.4s;"></span>
                                </span>
                            </label>
                        </div>
                        <p style="color: var(--text-muted); font-size: 12px; margin-top: 10px;">Toggle dark mode for a more comfortable viewing experience in low light.</p>
                    </div>

                </div>
            </main>
        </div>
    `;

    // Add toggle slider style dynamically
    const style = document.createElement('style');
    style.innerHTML = `
        input:checked + span { background-color: var(--primary) !important; }
        input:checked + span span { transform: translateX(26px); }
    `;
    document.head.appendChild(style);

    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        clearUser();
        window.location.hash = '#login';
    });

    // Theme Toggle Logic
    document.getElementById('theme-toggle').addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'false');
        }
    });

    // Password Update Logic
    document.getElementById('update-password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPass = document.getElementById('new-password').value;
        const confirmPass = document.getElementById('confirm-password').value;

        if (newPass !== confirmPass) {
            return alert('Passwords do not match!');
        }

        try {
            const { data, error } = await supabase.auth.updateUser({
                password: newPass
            });

            if (error) throw error;

            alert('Password updated successfully!');
            e.target.reset();
        } catch (error) {
            alert('Error updating password: ' + error.message);
        }
    });
}
