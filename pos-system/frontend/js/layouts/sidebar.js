// sidebar.js
export function getSidebar(activePage, userRole) {
    const svg = (path) => `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${path}</svg>`;
    
    return `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 2rem; padding-left: 5px;">
            <img src="assets/logo.png" alt="RamsyPOS" style="height: 40px;">
            <span style="font-family: 'Arial', sans-serif; font-weight: bold; font-size: 24px; color: #b8860b;">P.O.S.</span>
        </div>
        
        <div class="nav-item ${activePage === 'dashboard' ? 'active' : ''}" onclick="window.location.hash='#dashboard'">
            ${svg('<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>')}
            Analytics
        </div>
        <div class="nav-item ${activePage === 'pos' ? 'active' : ''}" onclick="window.location.hash='#pos'">
            ${svg('<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>')}
            Point of Sale
        </div>
        
        ${userRole === 'admin' || userRole === 'manager' ? `
            <div class="nav-item ${activePage === 'inventory' ? 'active' : ''}" onclick="window.location.hash='#inventory'">
                ${svg('<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>')}
                Inventory
            </div>
        ` : ''}
        
        ${userRole === 'manager' ? `
            <div class="nav-item ${activePage === 'team' ? 'active' : ''}" onclick="window.location.hash='#team'">
                ${svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>')}
                Team Management
            </div>
        ` : ''}

        <div class="nav-item ${activePage === 'settings' ? 'active' : ''}" onclick="window.location.hash='#settings'" style="margin-top: auto;">
            ${svg('<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>')}
            Settings
        </div>
    `;
}
