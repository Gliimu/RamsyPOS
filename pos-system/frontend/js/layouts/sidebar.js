// sidebar.js
export function getSidebar(activePage, userRole) {
    return `
        <div class="sidebar-logo" style="text-align: left; padding-left: 5px; margin-bottom: 1.5rem;">
            <img src="assets/logo.png" alt="RamsyPOS" style="height: 40px;">
        </div>
        <div class="nav-item ${activePage === 'dashboard' ? 'active' : ''}" onclick="window.location.hash='#dashboard'">📊 Analytics</div>
        <div class="nav-item ${activePage === 'pos' ? 'active' : ''}" onclick="window.location.hash='#pos'">🛒 Point of Sale</div>
        
        ${userRole === 'admin' || userRole === 'manager' ? `
            <div class="nav-item ${activePage === 'inventory' ? 'active' : ''}" onclick="window.location.hash='#inventory'">📦 Inventory</div>
        ` : ''}
        
        ${userRole === 'manager' ? `
            <div class="nav-item ${activePage === 'team' ? 'active' : ''}" onclick="window.location.hash='#team'">👥 Team Management</div>
        ` : ''}

        <div class="nav-item ${activePage === 'settings' ? 'active' : ''}" onclick="window.location.hash='#settings'" style="margin-top: auto;">⚙️ Settings</div>
    `;
}
