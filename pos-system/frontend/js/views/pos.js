// pos.js
import { state, clearUser } from '../state.js';

export function renderPos(container) {
    const user = state.user || { name: 'Guest', role: 'cashier' };
    
    container.innerHTML = `
        <div class="app-layout">
            <aside class="sidebar">
                <div class="sidebar-logo">
                    <img src="assets/logo.png" alt="RamsyPOS">
                </div>
                <div class="nav-item" onclick="window.location.hash='#dashboard'">📊 Dashboard</div>
                <div class="nav-item active">🛒 Point of Sale</div>
            </aside>
            <header class="topbar">
                <h2>Point of Sale</h2>
                <div>
                    <span style="margin-right: 15px;">${user.name}</span>
                    <button id="logout-btn" style="padding: 8px 16px; background: var(--danger); color: white; border: none; border-radius: 6px; cursor: pointer;">Logout</button>
                </div>
            </header>
            <main class="main-content">
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; height: 100%;">
                    <div style="background: white; padding: 20px; border-radius: 8px;">
                        <h3>Items for Sale</h3>
                        <p>Grid of items will go here...</p>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 8px;">
                        <h3>Current Cart</h3>
                        <p>Cart items and checkout will go here...</p>
                    </div>
                </div>
            </main>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', () => {
        clearUser();
        window.location.hash = '#login';
    });
}
