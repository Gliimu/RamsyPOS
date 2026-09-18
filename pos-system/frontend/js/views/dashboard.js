// dashboard.js
export function renderDashboard(container) {
    container.innerHTML = `
        <h1>Admin Dashboard</h1>
        <p>Welcome to the Analytics Dashboard.</p>
        <button onclick="window.location.hash='#pos'">Go to POS</button>
    `;
}
