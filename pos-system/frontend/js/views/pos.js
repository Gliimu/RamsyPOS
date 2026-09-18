// pos.js
import { state, clearUser } from '../state.js';
import { getItems, saveSale } from '../api.js';
import { getSidebar } from '../layouts/sidebar.js';
import { printReceipt } from '../utils/print.js';
import { supabase } from '../config/supabaseClient.js';

let cart = [];
let currentCategory = 'food'; // Default tab
let allItems = []; // Store all items for search
let searchQuery = '';

export async function renderPos(container) {
    const user = state.user || { name: 'Guest', role: 'pos_attendant' };
    allItems = await getItems(); // Fetch items from Supabase
    
    container.innerHTML = `
        <div class="app-layout">
            <aside class="sidebar">
                ${getSidebar('pos', user.role)}
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
                    <div style="background: var(--card-bg); padding: 20px; border-radius: 8px; overflow-y: auto;">
                        <input type="text" id="search-input" placeholder="Search items..." style="width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid var(--border); border-radius: 8px; font-size: 16px; background: var(--card-bg); color: var(--text);">
                        
                        <div class="pos-tabs">
                            <button class="tab-btn active" data-cat="food">Food</button>
                            <button class="tab-btn" data-cat="drinks">Drinks</button>
                            <button class="tab-btn" data-cat="services">Services</button>
                        </div>
                        <div id="pos-grid" class="pos-grid"></div>
                    </div>

                    <!-- Right Side: Cart -->
                    <div style="background: var(--card-bg); padding: 20px; border-radius: 8px; display: flex; flex-direction: column;">
                        <h3 style="margin-bottom: 20px; color: var(--text);">Current Order</h3>
                        <div id="cart-container" class="cart-list"></div>
                        <div class="cart-total">
                            <span style="color: var(--text);">Total:</span>
                            <span style="color: var(--text);">₦<span id="cart-total">0</span></span>
                        </div>
                        <button id="checkout-btn" class="checkout-btn">Checkout & Print</button>
                    </div>
                </div>
            </main>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        clearUser();
        window.location.hash = '#login';
    });

    document.getElementById('search-input').addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderItems();
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.cat;
            renderItems();
        });
    });

    document.getElementById('checkout-btn').addEventListener('click', checkout);
    
    renderItems();
    renderCart();
}

function renderItems() {
    const grid = document.getElementById('pos-grid');
    
    // Filter by category AND search query
    let filteredItems = allItems.filter(item => item.category === currentCategory);
    if (searchQuery) {
        filteredItems = filteredItems.filter(item => item.name.toLowerCase().includes(searchQuery));
    }
    
    if (filteredItems.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No items found.</p>';
        return;
    }

    grid.innerHTML = filteredItems.map(item => `
        <div class="pos-item" onclick="window.addToCart('${item.id}')" style="background: var(--card-bg); border: 1px solid var(--border);">
            ${item.image_url ? `<img src="${item.image_url}" alt="img" style="width: 100%; height: 80px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;">` : ''}
            <div class="item-name" style="color: var(--text);">${item.name}</div>
            <div class="item-price">₦${item.price.toLocaleString()}</div>
        </div>
    `).join('');
}

window.addToCart = async (itemId) => {
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;

    const existingItem = cart.find(ci => ci.id === itemId);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    renderCart();
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
        <div class="cart-item" style="border-bottom: 1px solid var(--border);">
            <div>
                <div style="font-weight: 500; color: var(--text);">${item.name}</div>
                <div style="font-size: 12px; color: var(--text-muted);">₦${item.price.toLocaleString()} each</div>
            </div>
            <div class="qty-controls">
                <button class="qty-btn" onclick="window.updateQty('${item.id}', -1)" style="border: 1px solid var(--border); background: var(--card-bg); color: var(--text);">-</button>
                <span style="color: var(--text);">${item.qty}</span>
                <button class="qty-btn" onclick="window.updateQty('${item.id}', 1)" style="border: 1px solid var(--border); background: var(--card-bg); color: var(--text);">+</button>
            </div>
            <div style="font-weight: bold; width: 80px; text-align: right; color: var(--text);">₦${(item.price * item.qty).toLocaleString()}</div>
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

async function checkout() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    try {
        await saveSale(cart, total, state.user.name);
        printReceipt(cart, total, state.user.name);
        cart = [];
        renderCart();
    } catch (error) {
        alert('Error saving sale: ' + error.message);
    }
}
