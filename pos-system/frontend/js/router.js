// router.js
import { renderLogin } from './views/login.js';
import { renderDashboard } from './views/dashboard.js';
import { renderPos } from './views/pos.js';
import { renderInventory } from './views/inventory.js';
import { renderTeam } from './views/team.js';
import { renderSettings } from './views/settings.js'; // <-- ADD THIS

const routes = {
    '/': renderLogin,
    '#login': renderLogin,
    '#dashboard': renderDashboard,
    '#pos': renderPos,
    '#inventory': renderInventory,
    '#team': renderTeam,
    '#settings': renderSettings // <-- ADD THIS
};

async function router() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const { data: { session } } = await supabase.auth.getSession();
    const path = window.location.hash || '#login';

    if (session) {
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

        if (path === '#login' || path === '/') {
            if (state.user.role === 'manager' || state.user.role === 'admin') {
                window.location.hash = '#dashboard';
            } else {
                window.location.hash = '#pos';
            }
            return;
        }
    } else {
        clearUser();
        if (path !== '#login' && path !== '/') {
            window.location.hash = '#login';
            return;
        }
    }

    const view = routes[path] || renderLogin;
    view(app);
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        clearUser();
        window.location.hash = '#login';
    }
});
