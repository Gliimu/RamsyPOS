// inventory.js
import { state, clearUser } from '../state.js';
import { getItems, addItem, deleteItem } from '../api.js';

export async function renderInventory(container) {
    const user = state.user || { name: 'Guest', role: 'admin' };
    let items = await getItems();

    container.innerHTML = `
        <div class="app-layout">
            <aside class="sidebar">
                <div class="sidebar-logo">
                    <img src="assets/logo.png" alt="RamsyPOS">
                </div>
                <div class="nav-item" onclick="window.location.hash='#dashboard'">📊 Dashboard</div>
                <div class="nav-item" onclick="window.location.hash='#pos'">🛒 Point of Sale</div>
                <div class="nav-item active">📦 Inventory</div>
            </aside>
            <header class="topbar">
                <h2>Inventory Management</h2>
                <div>
                    <span style="margin-right: 15px;">${user.name}</span>
                    <button id="logout-btn" style="padding: 8px 16px; background: var(--danger); color: white; border: none; border-radius: 6px; cursor: pointer;">Logout</button>
                </div>
            </header>
            <main class="main-content">
                <div style="display: grid; grid-template-columns: 300px 1fr; gap: 20px;">
                    
                    <!-- Add Item Form -->
                    <div style="background: white; padding: 20px; border-radius: 8px; height: fit-content;">
                        <h3 style="margin-bottom: 20px;">Add New Item</h3>
                        <form id="add-item-form" style="display: flex; flex-direction: column; gap: 15px;">
                            <input type="text" id="item-name" placeholder="Item Name" required style="padding: 10px; border: 1px solid var(--border); border-radius: 6px;">
                            <input type="number" id="item-price" placeholder="Price (₦)" required style="padding: 10px; border: 1px solid var(--border); border-radius: 6px;">
                            <select id="item-category" style="padding: 10px; border: 1px solid var(--border); border-radius: 6px;">
                                <option value="gym">Gym</option>
                                <option value="bar">Bar</option>
                                <option value="restaurant">Restaurant</option>
                            </select>
                            <button type="submit" style="padding: 10px; background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Add Item</button>
                        </form>
                    </div>

                    <!-- Items Table -->
                    <div style="background: white; padding: 20px; border-radius: 8px;">
                        <h3 style="margin-bottom: 20px;">Current Items</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="text-align: left; border-bottom: 2px solid var(--border);">
                                    <th style="padding: 10px;">Name</th>
                                    <th style="padding: 10px;">Category</th>
                                    <th style="padding: 10px;">Price</th>
                                    <th style="padding: 10px;">Action</th>
                                </tr>
                            </thead>
                            <tbody id="inventory-table">
                                <!-- Rows injected here -->
                            </tbody>
                        </table>
                    </div>
                    
                </div>
            </main>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', () => {
        clearUser();
        window.location.hash = '#login';
    });

    document.getElementById('add-item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('item-name').value;
        const price = document.getElementById('item-price').value;
        const category = document.getElementById('item-category').value;
        
        await addItem(name, price, category);
        items = await getItems(); // refresh local array
        renderTable(items);
        
        e.target.reset(); // clear form
    });

    function renderTable(itemsArray) {
        const tbody = document.getElementById('inventory-table');
        if (itemsArray.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">No items found</td></tr>';
            return;
        }
        tbody.innerHTML = itemsArray.map(item => `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 10px;">${item.name}</td>
                <td style="padding: 10px; text-transform: capitalize;">${item.category}</td>
                <td style="padding: 10px;">₦${item.price.toLocaleString()}</td>
                <td style="padding: 10px;"><button class="delete-btn" data-id="${item.id}" style="padding: 5px 10px; background: var(--danger); color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button></td>
            </tr>
        `).join('');

        // Attach delete listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = parseInt(e.target.dataset.id);
                await deleteItem(id);
                items = await getItems();
                renderTable(items);
            });
        });
    }

    renderTable(items);
}
