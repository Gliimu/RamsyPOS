// router.js
import { renderLogin } from './views/login.js';
import { renderDashboard } from './views/dashboard.js';
import { renderPos } from './views/pos.js';
import { renderInventory } from './views/inventory.js';
import { renderTeam } from './views/team.js';
import { state, setUser, clearUser } from './state.js';
import { supabase } from './config/supabaseClient.js';

const routes = {
    '/': renderLogin,
    '#login': renderLogin,
    '#dashboard': renderDashboard,
    '#pos': renderPos,
    '#inventory': renderInventory,
    '#team': renderTeam
};

async function router() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    // 1. Check if user has an active Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    const path = window.location.hash || '#login';

    if (session) {
        // If session exists, restore the user state so name doesn't become "Guest"
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

        // If logged in and trying to access login, redirect to correct dashboard
        if (path === '#login' || path === '/') {
            if (state.user.role === 'manager' || state.user.role === 'admin') {
                window.location.hash = '#dashboard';
            } else {
                window.location.hash = '#pos';
            }
            return;
        }
    } else {
        // If no session, force back to login
        clearUser();
        if (path !== '#login' && path !== '/') {
            window.location.hash = '#login';
            return;
        }
    }

    // 2. Render the view
    const view = routes[path] || renderLogin;
    view(app);
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// Listen for Supabase auth state changes (e.g., logout)
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        clearUser();
        window.location.hash = '#login';
    }
});
