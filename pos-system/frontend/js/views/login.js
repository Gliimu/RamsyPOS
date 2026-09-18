// login.js
export function renderLogin(container) {
    container.innerHTML = `
        <div style="width: 100%; display: flex; justify-content: center; align-items: center; height: 100vh;">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px; width: 400px; text-align: center;">
                <img src="assets/logo.png" alt="RamsyPOS" style="width: 80px; margin-bottom: 20px;">
                <h1 style="color: var(--primary);">RamsyPOS</h1>
                <p style="color: var(--text-muted); margin-bottom: 20px;">Sign in to your account</p>
                <button onclick="window.location.hash='#dashboard'" style="width: 100%; padding: 12px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer;">Go to Dashboard (Test)</button>
                <br><br>
                <button onclick="window.location.hash='#pos'" style="width: 100%; padding: 12px; background: var(--success); color: white; border: none; border-radius: 8px; cursor: pointer;">Go to POS (Test)</button>
            </div>
        </div>
    `;
}
