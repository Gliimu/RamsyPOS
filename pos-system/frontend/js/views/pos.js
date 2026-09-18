// pos.js
export function renderPos(container) {
    container.innerHTML = `
        <h1>Cashier POS</h1>
        <p>Select items to sell.</p>
        <button onclick="window.location.hash='#dashboard'">Go to Dashboard</button>
    `;
}
