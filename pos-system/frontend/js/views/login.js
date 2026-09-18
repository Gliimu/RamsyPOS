// login.js
import { setUser } from '../state.js';

export function renderLogin(container) {
    container.innerHTML = `
        <div style="width: 100%; display: flex; justify-content: center; align-items: center; height: 100vh; background: var(--bg);">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 400px; text-align: center;">
                <img src="assets/logo.png" alt="RamsyPOS" style="width: 80px; margin-bottom: 20px;">
                <h1 style="color: var(--primary);">RamsyPOS</h1>
                <p style="color: var(--text-muted); margin-bottom: 20px;">Sign in to your account</p>
                
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button id="login-admin" style="padding: 12px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Login as Admin</button>
                    <button id="login-cashier" style="padding: 12px; background: var(--success); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Login as Cashier</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('login-admin').addEventListener('click', () => {
        setUser('Admin User', 'admin');
        window.location.hash = '#dashboard';
    });

    document.getElementById('login-cashier').addEventListener('click', () => {
        setUser('Cashier Tunde', 'cashier');
        window.location.hash = '#pos';
    });
}
