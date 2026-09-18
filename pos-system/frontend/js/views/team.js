// router.js
import { renderLogin } from './views/login.js';
import { renderDashboard } from './views/dashboard.js';
import { renderPos } from './views/pos.js';
import { renderInventory } from './views/inventory.js';
import { renderTeam } from './views/team.js'; // <-- ADD THIS

const routes = {
    '/': renderLogin,
    '#login': renderLogin,
    '#dashboard': renderDashboard,
    '#pos': renderPos,
    '#inventory': renderInventory,
    '#team': renderTeam // <-- ADD THIS
};

export function navigateTo(hash) {
    window.location.hash = hash;
}

function router() {
    const path = window.location.hash || '#login';
    const view = routes[path] || renderLogin;
    
    const app = document.getElementById('app');
    app.innerHTML = '';
    view(app);
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
