// login.js
import { setUser } from '../state.js';

export function renderLogin(container) {
    container.innerHTML = `
        <div style="width: 100%; display: flex; justify-content: center; align-items: center; height: 100vh; background: var(--bg);">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 400px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <img src="assets/logo.png" alt="RamsyPOS" style="width: 80px; margin-bottom: 10px;">
                    <h1 style="color: var(--primary);">RamsyPOS</h1>
                    <p style="color: var(--text-muted);">Sign in to your account</p>
                </div>
                
                <form id="login-form" style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <label style="font-size: 14px; color: var(--text-muted); margin-bottom: 5px; display: block;">Username</label>
                        <input type="text" id="username" placeholder="Enter username" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 16px;">
                    </div>
                    <div>
                        <label style="font-size: 14px; color: var(--text-muted); margin-bottom: 5px; display: block;">Password</label>
                        <input type="password" id="password" placeholder="Enter password" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 16px;">
                    </div>
                    <button type="submit" style="padding: 12px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px; margin-top: 10px;">Login</button>
                </form>
                
                <p style="text-align: center; color: var(--text-muted); font-size: 12px; margin-top: 20px;">
                    Mock Logins: admin/admin, manager/manager, pos/pos
                </p>
            </div>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === 'admin' && password === 'admin') {
            setUser('Admin User', 'admin');
            window.location.hash = '#dashboard';
        } else if (username === 'manager' && password === 'manager') {
            setUser('System Manager', 'manager');
            window.location.hash = '#dashboard';
        } else if (username === 'pos' && password === 'pos') {
            setUser('POS Attendant', 'pos_attendant');
            window.location.hash = '#pos';
        } else {
            alert('Invalid credentials! Use admin/admin, manager/manager, or pos/pos');
        }
    });
}
