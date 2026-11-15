// team.js
import { state, clearUser } from '../state.js';
import { getSidebar } from '../layouts/sidebar.js';
import { supabase } from '../config/supabaseClient.js';
import { showModal, showConfirm } from '../utils/modal.js';

const BACKEND_URL = 'https://ramsypos-backend.onrender.com'; 

export async function renderTeam(container) {
    const user = state.user || { name: 'Guest', role: 'manager' };
    let team = await getTeam();

    container.innerHTML = `
        <div class="app-layout">
            <aside class="sidebar">
                ${getSidebar('team', user.role, state.subscriptionActive)}
            </aside>
            <header class="topbar">
                <h2>Team Management</h2>
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
                        <h3 style="margin-bottom: 20px;">Add Team Member</h3>
                        <form id="add-member-form" style="display: flex; flex-direction: column; gap: 15px;">
                            <input type="text" id="member-name" placeholder="Full Name" required>
                            <input type="text" id="member-username" placeholder="Username (e.g., tunde)" required>
                            <select id="member-role">
                                <option value="pos_attendant">POS Attendant</option>
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                            </select>
                            <select id="member-category">
                                <option value="gym">Gym</option>
                                <option value="bar">Bar</option>
                                <option value="restaurant">Restaurant</option>
                                <option value="saloon">Saloon</option>
                                <option value="all">All Categories</option>
                            </select>
                            <button type="submit">Add Member</button>
                        </form>
                    </div>

                    <div style="background: var(--card-bg); padding: 20px; border-radius: 8px;">
                        <h3 style="margin-bottom: 20px;">Current Team</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="text-align: left; border-bottom: 2px solid var(--border);">
                                    <th style="padding: 10px;">Name</th>
                                    <th style="padding: 10px;">Username</th>
                                    <th style="padding: 10px;">Role</th>
                                    <th style="padding: 10px;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="team-table"></tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>

        <div id="edit-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:50; justify-content:center; align-items:center;">
            <div style="background:var(--card-bg); padding:30px; border-radius:12px; width:400px; box-shadow: 0 10px 15px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom:20px; color:var(--primary);">Edit Team Member</h3>
                <form id="edit-member-form" style="display: flex; flex-direction: column; gap: 15px;">
                    <input type="hidden" id="edit-id">
                    <input type="text" id="edit-name" placeholder="Full Name" required>
                    <select id="edit-role">
                        <option value="pos_attendant">POS Attendant</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                    </select>
                    <select id="edit-category">
                        <option value="gym">Gym</option>
                        <option value="bar">Bar</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="saloon">Saloon</option>
                        <option value="all">All Categories</option>
                    </select>
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <button type="submit">Save Changes</button>
                        <button type="button" id="cancel-edit">Cancel</button>
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

    document.getElementById('add-member-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('member-name').value;
        const username = document.getElementById('member-username').value;
        const role = document.getElementById('member-role').value;
        const category = document.getElementById('member-category').value;
        
        try {
            const response = await fetch(`${BACKEND_URL}/api/create-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, full_name: name, role, category })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to create user');
            
            await showModal(result.message);
            team = await getTeam();
            renderTable(team);
            e.target.reset();
        } catch (error) {
            await showModal('Error adding member: ' + error.message);
        }
    });

    document.getElementById('edit-member-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        const name = document.getElementById('edit-name').value;
        const role = document.getElementById('edit-role').value;
        const category = document.getElementById('edit-category').value;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: name, role: role, category: category })
                .eq('id', id);

            if (error) throw error;

            await showModal('User updated successfully!');
            document.getElementById('edit-modal').style.display = 'none';
            team = await getTeam();
            renderTable(team);
        } catch (error) {
            await showModal('Error updating user: ' + error.message);
        }
    });

    function renderTable(teamArray) {
        const tbody = document.getElementById('team-table');
        if (teamArray.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">No team members added yet</td></tr>';
            return;
        }
        tbody.innerHTML = teamArray.map(m => `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 10px;">${m.full_name || 'N/A'}</td>
                <td style="padding: 10px;">${m.email.replace('@ramsypos.app', '')}</td>
                <td style="padding: 10px; text-transform: capitalize;">${m.role.replace('_', ' ')}</td>
                <td style="padding: 10px; display: flex; gap: 5px; flex-wrap: wrap;">
                    <button class="icon-btn edit-btn" data-id="${m.id}" title="Edit User">
                        <svg width="16" height="16" fill="none" stroke="var(--primary)" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="icon-btn reset-btn" data-id="${m.id}" title="Reset Password">
                        <svg width="16" height="16" fill="none" stroke="#f59e0b" stroke-width="2" viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 6.5m0 0l3 3L22 6l-3-3m-3.5 3.5L19 9"></path></svg>
                    </button>
                    <button class="icon-btn delete-btn" data-id="${m.id}" title="Delete User">
                        <svg width="16" height="16" fill="none" stroke="var(--danger)" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                if(await showConfirm('Are you sure you want to delete this user?')) {
                    try {
                        await supabase.from('profiles').delete().eq('id', id);
                        team = await getTeam();
                        renderTable(team);
                    } catch (err) {
                        await showModal('Error deleting member');
                    }
                }
            });
        });

        document.querySelectorAll('.reset-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                if(await showConfirm('Reset this user\'s password to Ramsy4u&me?')) {
                    try {
                        const response = await fetch(`${BACKEND_URL}/api/reset-password`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ user_id: id })
                        });
                        const result = await response.json();
                        if (!response.ok) throw new Error(result.error);
                        await showModal(result.message);
                    } catch (err) {
                        await showModal('Error resetting password: ' + err.message);
                    }
                }
            });
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const member = team.find(m => m.id === id);
                
                document.getElementById('edit-id').value = member.id;
                document.getElementById('edit-name').value = member.full_name || '';
                document.getElementById('edit-role').value = member.role;
                document.getElementById('edit-category').value = member.category;
                
                document.getElementById('edit-modal').style.display = 'flex';
            });
        });
    }

    renderTable(team);
}

async function getTeam() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });
    
    if (error) {
        console.error('Error fetching team:', error);
        return [];
    }
    return data || [];
}
