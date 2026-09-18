// dashboard.js
import { state, clearUser } from '../state.js';
import { getSidebar } from '../layouts/sidebar.js';

export function renderDashboard(container) {
    const user = state.user || { name: 'Guest', role: 'admin' };
    
    container.innerHTML = `
        <div class="app-layout">
            <aside class="sidebar">
                ${getSidebar('dashboard', user.role)}
            </aside>
            <header class="topbar">
                <h2>Admin Dashboard</h2>
                <div>
                    <span style="margin-right: 15px;">${user.name}</span>
                    <button id="logout-btn" style="padding: 8px 16px; background: var(--danger); color: white; border: none; border-radius: 6px; cursor: pointer;">Logout</button>
                </div>
            </header>
            <main class="main-content">
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h3>Welcome to your Analytics</h3>
                    <p>Sales charts and stats will go here.</p>
                </div>
            </main>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', () => {
        clearUser();
        window.location.hash = '#login';
    });
}
