// login.js
import { setUser } from '../state.js';
import { supabase } from '../config/supabaseClient.js';

export function renderLogin(container) {
    container.innerHTML = `
        <div class="login-container">
            <div class="login-card">
                <div class="login-header">
                    <img src="assets/logo.png" alt="RamsyPOS">
                    <h1>Welcome back</h1>
                    <p>Please sign in to your account to continue</p>
                </div>
                
                <form id="login-form" class="login-form">
                    <div class="input-group">
                        <label>Username</label>
                        <input type="text" id="username" class="login-input" placeholder="Enter your username" required>
                    </div>
                    <div class="input-group">
                        <label>Password</label>
                        <input type="password" id="password" class="login-input" placeholder="Enter password" required>
                    </div>
                    <button type="submit" style="margin-top: 10px;">Sign In</button>
                </form>
                
                <div class="login-footer">
                    Secure login by Ramsy Paradise Hotel & Suites
                </div>
            </div>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const rawUsername = document.getElementById('username').value.trim().toLowerCase().replace(/\s+/g, '');
        const password = document.getElementById('password').value;
        
        const fakeEmail = `${rawUsername}@ramsypos.app`;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: fakeEmail,
                password: password,
            });

            if (error) throw error;

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('full_name, role, category')
                .eq('id', data.user.id)
                .single();

            if (profileError) throw profileError;

            setUser(profile.full_name, profile.role, profile.category);
            
            if (profile.role === 'manager' || profile.role === 'admin') {
                window.location.hash = '#dashboard';
            } else {
                window.location.hash = '#pos';
            }

        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    });
}
