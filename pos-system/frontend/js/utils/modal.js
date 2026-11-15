// modal.js

export function showModal(message, title = "RamsyPOS") {
    return new Promise((resolve) => {
        // Remove any existing modal first
        const existing = document.getElementById('custom-modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'custom-modal-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.5); z-index: 9999;
            display: flex; justify-content: center; align-items: center;
        `;

        overlay.innerHTML = `
            <div style="background: var(--card-bg); padding: 30px; border-radius: 12px; width: 400px; max-width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px;">
                    <img src="assets/logo.png" style="height: 30px;">
                    <h3 style="color: var(--text); margin: 0; font-size: 18px;">${title}</h3>
                </div>
                <p style="color: var(--text); font-size: 15px; margin-bottom: 25px; line-height: 1.5;">${message}</p>
                <button id="modal-ok-btn" style="width: 100%; padding: 12px; background: #b8860b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 15px;">OK</button>
            </div>
        `;

        document.body.appendChild(overlay);

        const okBtn = document.getElementById('modal-ok-btn');
        okBtn.addEventListener('click', () => {
            overlay.remove();
            resolve();
        });

        // Also close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve();
            }
        });
    });
}

export async function showConfirm(message, title = "RamsyPOS") {
    return new Promise((resolve) => {
        const existing = document.getElementById('custom-modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'custom-modal-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.5); z-index: 9999;
            display: flex; justify-content: center; align-items: center;
        `;

        overlay.innerHTML = `
            <div style="background: var(--card-bg); padding: 30px; border-radius: 12px; width: 400px; max-width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px;">
                    <img src="assets/logo.png" style="height: 30px;">
                    <h3 style="color: var(--text); margin: 0; font-size: 18px;">${title}</h3>
                </div>
                <p style="color: var(--text); font-size: 15px; margin-bottom: 25px; line-height: 1.5;">${message}</p>
                <div style="display: flex; gap: 10px;">
                    <button id="modal-cancel-btn" style="flex: 1; padding: 12px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 15px;">Cancel</button>
                    <button id="modal-confirm-btn" style="flex: 1; padding: 12px; background: #b8860b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 15px;">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('modal-confirm-btn').addEventListener('click', () => {
            overlay.remove();
            resolve(true);
        });

        document.getElementById('modal-cancel-btn').addEventListener('click', () => {
            overlay.remove();
            resolve(false);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(false);
            }
        });
    });
}
