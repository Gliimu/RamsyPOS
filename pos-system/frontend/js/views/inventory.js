// inventory.js
import { state, clearUser } from '../state.js';
import { getSidebar } from '../layouts/sidebar.js';
import { getItems, addItem, deleteItem, updateItem } from '../api.js';
import { supabase } from '../config/supabaseClient.js';

export async function renderInventory(container) {
    const user = state.user || { name: 'Guest', role: 'admin' };
    let items = await getItems();
    let searchQuery = '';

    container.innerHTML = `
        <div class="app-layout">
            <aside class="sidebar">
                ${getSidebar('inventory', user.role)}
            </aside>
            <header class="topbar">
                <h2>Inventory Management</h2>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span>${user.name}</span>
                    <button id="logout-btn" class="icon-btn" title="Logout">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
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
                        <input type="text" id="inv-search" placeholder="Search inventory..." style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid var(--border); border-radius: 6px; background: var(--card-bg); color: var(--text);">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="text-align: left; border-bottom: 2px solid var(--border);">
                                    <th style="padding: 10px; color: var(--text);">Image</th>
                                    <th style="padding: 10px; color: var(--text);">Name</th>
                                    <th style="padding: 10px; color: var(--text);">Category</th>
                                    <th style="padding: 10px; color: var(--text);">Price</th>
                                    <th style="padding: 10px; color: var(--text); text-align: right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="inventory-table"></tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>

        <!-- Hidden Edit Modal -->
        <div id="edit-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:50; justify-content:center; align-items:center;">
            <div style="background:var(--card-bg); padding:30px; border-radius:12px; width:400px; box-shadow: 0 10px 15px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom:20px; color:var(--primary);">Edit Item</h3>
                <form id="edit-item-form" style="display: flex; flex-direction: column; gap: 15px;">
                    <input type="hidden" id="edit-id">
                    <input type="hidden" id="edit-existing-image">
                    <label style="font-size: 14px; color: var(--text-muted);">Item Name</label>
                    <input type="text" id="edit-name" placeholder="Item Name" required style="padding: 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--card-bg); color: var(--text);">
                    <label style="font-size: 14px; color: var(--text-muted);">Price (₦)</label>
                    <input type="number" id="edit-price" placeholder="Price" required style="padding: 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--card-bg); color: var(--text);">
                    <label style="font-size: 14px; color: var(--text-muted);">Category</label>
                    <select id="edit-category" style="padding: 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--card-bg); color: var(--text);">
                        <option value="food">Food</option>
                        <option value="drinks">Drinks</option>
                        <option value="services">Services</option>
                    </select>
                    <label style="font-size: 14px; color: var(--text-muted);">Change Image (Leave blank to keep current)</label>
                    <input type="file" id="edit-image" accept="image/*" style="padding: 10px; color: var(--text);">
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <button type="submit" style="flex:1; padding: 10px; background: var(--success); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Save Changes</button>
                        <button type="button" id="cancel-edit" style="flex:1; padding: 10px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        clearUser();
        window.location.hash = '#login';
    });

    document.getElementById('cancel-edit').addEventListener('click', () => {
        document.getElementById('edit-modal').style.display = 'none';
    });

    document.getElementById('inv-search').addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderTable(items);
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
                const fileName = `${Date.now()}_${imageFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('item_images')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

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

    document.getElementById('edit-item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        const name = document.getElementById('edit-name').value;
        const price = document.getElementById('edit-price').value;
        const category = document.getElementById('edit-category').value;
        const imageFile = document.getElementById('edit-image').files[0];
        const existingImage = document.getElementById('edit-existing-image').value;

        try {
            let imageUrl = existingImage;
            
            // If a new image is selected, upload it and replace the old URL
            if (imageFile) {
                const fileName = `${Date.now()}_${imageFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('item_images')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('item_images')
                    .getPublicUrl(fileName);

                imageUrl = publicUrlData.publicUrl;
            }

            await updateItem(id, name, price, category, imageUrl);
            items = await getItems();
            renderTable(items);
            
            alert('Item updated successfully!');
            document.getElementById('edit-modal').style.display = 'none';
        } catch (error) {
            alert('Error updating item: ' + error.message);
        }
    });

    function renderTable(itemsArray) {
        const tbody = document.getElementById('inventory-table');
        let filtered = itemsArray;
        if (searchQuery) {
            filtered = itemsArray.filter(item => item.name.toLowerCase().includes(searchQuery));
        }

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">No items found</td></tr>';
            return;
        }
        
        const trashIcon = `<svg width="16" height="16" fill="none" stroke="var(--danger)" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
        const editIcon = `<svg width="16" height="16" fill="none" stroke="var(--primary)" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
        
        tbody.innerHTML = filtered.map(item => `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 10px;">
                    ${item.image_url ? `<img src="${item.image_url}" alt="img" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` : '<span style="color:var(--text-muted)">No img</span>'}
                </td>
                <td style="padding: 10px; color: var(--text);">${item.name}</td>
                <td style="padding: 10px; color: var(--text); text-transform: capitalize;">${item.category}</td>
                <td style="padding: 10px; color: var(--text);">₦${item.price.toLocaleString()}</td>
                <td style="padding: 10px; text-align: right; white-space: nowrap;">
                    <button class="icon-btn edit-btn" data-id="${item.id}" title="Edit" style="display: inline-flex; vertical-align: middle; margin-right: 5px;">${editIcon}</button>
                    <button class="icon-btn delete-btn" data-id="${item.id}" title="Delete" style="display: inline-flex; vertical-align: middle;">${trashIcon}</button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                await deleteItem(id);
                items = await getItems();
                renderTable(items);
            });
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const item = items.find(i => i.id === id);
                
                document.getElementById('edit-id').value = item.id;
                document.getElementById('edit-name').value = item.name;
                document.getElementById('edit-price').value = item.price;
                document.getElementById('edit-category').value = item.category;
                document.getElementById('edit-existing-image').value = item.image_url || '';
                document.getElementById('edit-image').value = ''; // Clear file input
                
                document.getElementById('edit-modal').style.display = 'flex';
            });
        });
    }

    renderTable(items);
}
