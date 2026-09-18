// inventory.js
import { state, clearUser } from '../state.js';
import { getSidebar } from '../layouts/sidebar.js';
import { getItems, addItem, deleteItem } from '../api.js';
import { supabase } from '../config/supabaseClient.js';

export async function renderInventory(container) {
    const user = state.user || { name: 'Guest', role: 'admin' };
    let items = await getItems();

    container.innerHTML = `
        <div class="app-layout">
            <aside class="sidebar">
                ${getSidebar('inventory', user.role)}
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
                    <div style="background: var(--card-bg); padding: 20px; border-radius: 8px; height: fit-content;">
                        <h3 style="margin-bottom: 20px; color: var(--text);">Add New Item</h3>
                        <form id="add-item-form" style="display: flex; flex-direction: column; gap: 15px;">
                            <input type="text" id="item-name" placeholder="Item Name" required style="padding: 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--card-bg); color: var(--text);">
                            <input type="number" id="item-price" placeholder="Price (₦)" required style="padding: 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--card-bg); color: var(--text);">
                            <select id="item-category" style="padding: 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--card-bg); color: var(--text);">
                                <option value="food">Food</option>
                                <option value="drinks">Drinks</option>
                                <option value="services">Services</option>
                            </select>
                            <input type="file" id="item-image" accept="image/*" style="padding: 10px; color: var(--text);">
                            <button type="submit" style="padding: 10px; background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Add Item</button>
                        </form>
                    </div>
                    <div style="background: var(--card-bg); padding: 20px; border-radius: 8px;">
                        <h3 style="margin-bottom: 20px; color: var(--text);">Current Items</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="text-align: left; border-bottom: 2px solid var(--border);">
                                    <th style="padding: 10px; color: var(--text);">Image</th>
                                    <th style="padding: 10px; color: var(--text);">Name</th>
                                    <th style="padding: 10px; color: var(--text);">Category</th>
                                    <th style="padding: 10px; color: var(--text);">Price</th>
                                    <th style="padding: 10px; color: var(--text);">Action</th>
                                </tr>
                            </thead>
                            <tbody id="inventory-table"></tbody>
                        </table>
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

    document.getElementById('add-item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('item-name').value;
        const price = document.getElementById('item-price').value;
        const category = document.getElementById('item-category').value;
        const imageFile = document.getElementById('item-image').files[0];

        try {
            let imageUrl = null;
            if (imageFile) {
                // Upload image to Supabase Storage
                const fileName = `${Date.now()}_${imageFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('item_images')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                // Get the public URL
                const { data: publicUrlData } = supabase.storage
                    .from('item_images')
                    .getPublicUrl(fileName);

                imageUrl = publicUrlData.publicUrl;
            }

            await addItem(name, price, category, imageUrl);
            items = await getItems();
            renderTable(items);
            e.target.reset();
        } catch (error) {
            alert('Error adding item: ' + error.message);
        }
    });

    function renderTable(itemsArray) {
        const tbody = document.getElementById('inventory-table');
        if (itemsArray.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">No items found</td></tr>';
            return;
        }
        tbody.innerHTML = itemsArray.map(item => `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 10px;">
                    ${item.image_url ? `<img src="${item.image_url}" alt="img" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` : '<span style="color:var(--text-muted)">No img</span>'}
                </td>
                <td style="padding: 10px; color: var(--text);">${item.name}</td>
                <td style="padding: 10px; color: var(--text); text-transform: capitalize;">${item.category}</td>
                <td style="padding: 10px; color: var(--text);">₦${item.price.toLocaleString()}</td>
                <td style="padding: 10px;"><button class="delete-btn" data-id="${item.id}" style="padding: 5px 10px; background: var(--danger); color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button></td>
            </tr>
        `).join('');

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                await deleteItem(id);
                items = await getItems();
                renderTable(items);
            });
        });
    }

    renderTable(items);
}
