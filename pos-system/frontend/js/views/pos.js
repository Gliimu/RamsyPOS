// pos.js
import { state, clearUser } from '../state.js';
import { getItems } from '../api.js';
import { printReceipt } from '../utils/print.js';

let cart = [];
let currentCategory = 'gym'; // Default tab

export async function renderPos(container) {
    const user = state.user || { name: 'Guest', role: 'pos_attendant' };
    const items = await getItems(); // Fetch items
    
    container.innerHTML = `
        <div class="app-layout">
            <aside class="sidebar">
                <div class="sidebar-logo">
                    <img src="assets/logo.png" alt="RamsyPOS">
                </div>
                <div class="nav-item" onclick="window.location.hash='#dashboard'">📊 Dashboard</div>
                <div class="nav-item active">🛒 Point of Sale</div>
            </aside>
            <header class="topbar">
                <h2>Point of Sale</h2>
                <div>
                    <span style="margin-right: 15px;">${user.name}</span>
                    <button id="logout-btn" style="padding: 8px 16px; background: var(--danger); color: white; border: none; border-radius: 6px; cursor: pointer;">Logout</button>
                </div>
            </header>
            <main class="main-content">
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; height: 100%;">
                    
                    <!-- Left Side: Items -->
                    <div style="background: white; padding: 20px; border-radius: 8px; overflow-y: auto;">
                        <div class="pos-tabs">
                            <button class="tab-btn active" data-cat="gym">Gym</button>
                            <button class="tab-btn" data-cat="bar">Bar</button>
                            <button class="tab-btn" data-cat="restaurant">Restaurant</button>
                        </div>
                        <div id="pos-grid" class="pos-grid"></div>
                    </div>

                    <!-- Right Side: Cart -->
                    <div style="background: white; padding: 20px; border-radius: 8px; display: flex; flex-direction: column;">
                        <h3 style="margin-bottom: 20px;">Current Order</h3>
                        <div id="cart-container" class="cart-list"></div>
                        
                        <div class="cart-total">
                            <span>Total:</span>
                            <span>₦<span id="cart-total">0</span></span>
                        </div>
                        <button id="checkout-btn" class="checkout-btn">Checkout & Print</button>
                    </div>
                    
                </div>
            </main>
        </div>
    `;

    // Event Listeners
    document.getElementById('logout-btn').addEventListener('click', () => {
        clearUser();
        window.location.hash = '#login';
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.cat;
            renderItems(items);
        });
    });

    document.getElementById('checkout-btn').addEventListener('click', checkout);

    // Initial Render
    renderItems(items);
    renderCart();
}

function renderItems(items) {
    const grid = document.getElementById('pos-grid');
    const filteredItems = items.filter(item => item.category === currentCategory);
    
    if (filteredItems.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No items in this category yet.</p>';
        return;
    }

    grid.innerHTML = filteredItems.map(item => `
        <div class="pos-item" onclick="window.addToCart(${item.id})">
            <div class="item-name">${item.name}</div>
            <div class="item-price">₦${item.price.toLocaleString()}</div>
        </div>
    `).join('');
}

// Make addToCart global so inline onclick can access it
window.addToCart = (itemId) => {
    getItems().then(items => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const existingItem = cart.find(ci => ci.id === itemId);
        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({ ...item, qty: 1 });
        }
        renderCart();
    });
}

function renderCart() {
    const cartContainer = document.getElementById('cart-container');
    const totalElement = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin-top: 20px;">No items in cart</p>';
        totalElement.innerText = '0';
        return;
    }

    cartContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <div style="font-weight: 500;">${item.name}</div>
                <div style="font-size: 12px; color: var(--text-muted);">₦${item.price.toLocaleString()} each</div>
            </div>
            <div class="qty-controls">
                <button class="qty-btn" onclick="window.updateQty(${item.id}, -1)">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="window.updateQty(${item.id}, 1)">+</button>
            </div>
            <div style="font-weight: bold; width: 80px; text-align: right;">₦${(item.price * item.qty).toLocaleString()}</div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    totalElement.innerText = total.toLocaleString();
}

window.updateQty = (itemId, change) => {
    const item = cart.find(ci => ci.id === itemId);
    if (!item) return;

    item.qty += change;
    if (item.qty <= 0) {
        cart = cart.filter(ci => ci.id !== itemId);
    }
    renderCart();
}

function checkout() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Call the print function
    printReceipt(cart, total, state.user.name);
    
    // Clear cart after checkout
    cart = [];
    renderCart();
}
