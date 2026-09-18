// pos.js
import { state, clearUser } from '../state.js';
import { getItems, saveSale } from '../api.js';
import { getSidebar } from '../layouts/sidebar.js';
import { printReceipt } from '../utils/print.js';
import { supabase } from '../config/supabaseClient.js';

let cart = [];
let currentCategory = 'all'; 
let allItems = [];
let searchQuery = '';

export async function renderPos(container) {
    const user = state.user || { name: 'Guest', role: 'pos_attendant' };
    allItems = await getItems();
    
    container.innerHTML = `
        <div class="app-layout">
            <aside class="sidebar">
                ${getSidebar('pos', user.role)}
            </aside>
            <header class="topbar">
                <h2>Point of Sale</h2>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span>${user.name}</span>
                    <button id="logout-btn" class="icon-btn" title="Logout">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                </div>
            </header>
            <main class="main-content">
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; height: 100%;">
                    
                    <div style="background: var(--card-bg); padding: 20px; border-radius: 8px; overflow-y: auto;">
                        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                            <input type="text" id="search-input" placeholder="Search items..." style="flex: 1; padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 16px; background: var(--card-bg); color: var(--text);">
                            
                            <div class="pos-filter-dropdown">
                                <button id="filter-toggle-btn" class="icon-btn" title="Filter Categories" style="border: 1px solid var(--border); width: 48px;">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                </button>
                                <div id="filter-menu" class="dropdown-menu">
                                    <div class="dropdown-item active" data-cat="all">All Items</div>
                                    <div class="dropdown-item" data-cat="food">Food</div>
                                    <div class="dropdown-item" data-cat="drinks">Drinks</div>
                                    <div class="dropdown-item" data-cat="services">Services</div>
                                </div>
                            </div>
                        </div>
                        
                        <div id="pos-grid" class="pos-grid"></div>
                    </div>

                    <div style="background: var(--card-bg); padding: 20px; border-radius: 8px; display: flex; flex-direction: column;">
                        <h3 style="margin-bottom: 20px; color: var(--text);">Current Order</h3>
                        <div id="cart-container" class="cart-list" style="flex: 1; overflow-y: auto;"></div>
                        
                        <div class="cart-total">
                            <span style="color: var(--text);">Total:</span>
                            <span style="color: var(--text);">₦<span id="cart-total">0</span></span>
                        </div>

                        <!-- Mode of Payment -->
                        <select id="mop-select" class="mop-select">
                            <option value="Cash">Cash (Withdrawal)</option>
                            <option value="Transfer">Transfer</option>
                        </select>

                        <button id="checkout-btn" class="checkout-btn">Check out</button>
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

    document.getElementById('filter-toggle-btn').addEventListener('click', () => {
        const menu = document.getElementById('filter-menu');
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });

    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            document.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.cat;
            document.getElementById('filter-menu').style.display = 'none';
            renderItems();
        });
    });

    document.getElementById('checkout-btn').addEventListener('click', checkout);
    
    renderItems();
    renderCart();
}

function renderItems() {
    const grid = document.getElementById('pos-grid');
    let filteredItems = allItems;
    
    if (currentCategory !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === currentCategory);
    }
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

    const checkoutBtn = document.getElementById('checkout-btn');
    const mop = document.getElementById('mop-select').value;

    // Disable button immediately to prevent double-clicking
    checkoutBtn.disabled = true;
    checkoutBtn.innerText = 'Processing...';

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    try {
        await saveSale(cart, total, state.user.name);
        printReceipt(cart, total, state.user.name, mop);
        cart = [];
        renderCart();
    } catch (error) {
        alert('Error saving sale: ' + error.message);
    } finally {
        // Re-enable button after process finishes
        checkoutBtn.disabled = false;
        checkoutBtn.innerText = 'Check out';
    }
}
