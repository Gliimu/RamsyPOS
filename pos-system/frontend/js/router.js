// router.js
import { renderLogin } from './views/login.js';
import { renderDashboard } from './views/dashboard.js';
import { renderPos } from './views/pos.js';

const routes = {
    '/': renderLogin,
    '#login': renderLogin,
    '#dashboard': renderDashboard,
    '#pos': renderPos
};

export function navigateTo(hash) {
    window.location.hash = hash;
}

function router() {
    const path = window.location.hash || '#login';
    const view = routes[path] || renderLogin;
    
    // Render the view into the #app div
    const app = document.getElementById('app');
    app.innerHTML = ''; // Clear current view
    view(app); // Call the function to draw the new view
}

// Listen for URL hash changes (e.g., when user clicks a link)
window.addEventListener('hashchange', router);

// Initial route load
window.addEventListener('DOMContentLoaded', router);
