// team.js
import { state, clearUser } from '../state.js';
import { getSidebar } from '../layouts/sidebar.js';
import { supabase } from '../config/supabaseClient.js';

const BACKEND_URL = 'https://ramsypos-backend.onrender.com'; 

export async function renderTeam(container) {
    const user = state.user || { name: 'Guest', role: 'manager' };
    let team = await getTeam();

    container.innerHTML = `
        <div class="app-layout">
            <aside class="sidebar">
                ${getSidebar('team', user.role)}
            </aside>
            <header class="topbar">
                <h2>Team Management</h2>
                <div>
                    <span style="margin-right: 15px;">${user.name}</span>
                    <button id="logout-btn" style="padding: 8px 16px; background: var(--danger); color: white; border: none; border-radius: 6px; cursor: pointer;">Logout</button>
                </div>
            </header>
            <main class="main-content">
                <div style="display: grid; grid-template-columns: 300px 1fr; gap: 20px;">
                    
                    <!-- Add Member Form -->
                    <div style="background: white; padding: 20px; border-radius: 8px; height: fit-content;">
                        <h3 style="margin-bottom: 20px;">Add Team Member</h3>
                        <form id="add-member-form" style="display: flex; flex-direction: column; gap: 15px;">
                            <input type="text" id="member-name" placeholder="Full Name" required style="padding: 10px; border: 1px solid var(--border); border-radius: 6px;">
                            <input type="text" id="member-username" placeholder="Username (e.g., tunde)" required style="padding: 10px; border: 1px solid var(--border); border-radius: 6px;">
                            <select id="member-role" style="padding: 10px; border: 1px solid var(--border); border-radius: 6px;">
                                <option value="pos_attendant">POS Attendant</option>
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                            </select>
                            <select id="member-category" style="padding: 10px; border: 1px solid var(--border); border-radius: 6px;">
                                <option value="gym">Gym</option>
                                <option value="bar">Bar</option>
                                <option value="restaurant">Restaurant</option>
                                <option value="saloon">Saloon</option>
                                <option value="all">All Categories</option>
                            </select>
                            <button type="submit" style="padding: 10px; background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Add Member</button>
                        </form>
                    </div>

                    <!-- Team Table -->
                    <div style="background: white; padding: 20px; border-radius: 8px;">
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

        <!-- Hidden Edit Modal -->
        <div id="edit-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:50; justify-content:center; align-items:center;">
            <div style="background:white; padding:30px; border-radius:12px; width:400px; box-shadow: 0 10px 15px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom:20px; color:var(--primary);">Edit Team Member</h3>
                <form id="edit-member-form" style="display: flex; flex-direction: column; gap: 15px;">
                    <input type="hidden" id="edit-id">
                    <input type="text" id="edit-name" placeholder="Full Name" required style="padding: 10px; border: 1px solid var(--border); border-radius: 6px;">
                    <select id="edit-role" style="padding: 10px; border: 1px solid var(--border); border-radius: 6px;">
                        <option value="pos_attendant">POS Attendant</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                    </select>
                    <select id="edit-category" style="padding: 10px; border: 1px solid var(--border); border-radius: 6px;">
                        <option value="gym">Gym</option>
                        <option value="bar">Bar</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="saloon">Saloon</option>
                        <option value="all">All Categories</option>
                    </select>
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
            
            alert(result.message);
            team = await getTeam();
            renderTable(team);
            e.target.reset();
        } catch (error) {
            alert('Error adding member: ' + error.message);
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

            alert('User updated successfully!');
            document.getElementById('edit-modal').style.display = 'none';
            team = await getTeam();
            renderTable(team);
        } catch (error) {
            alert('Error updating user: ' + error.message);
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
                    <button class="edit-btn" data-id="${m.id}" style="padding: 5px 10px; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer;">Edit</button>
                    <button class="reset-btn" data-id="${m.id}" style="padding: 5px 10px; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer;">Reset Pass</button>
                    <button class="delete-btn" data-id="${m.id}" style="padding: 5px 10px; background: var(--danger); color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if(confirm('Are you sure you want to delete this user?')) {
                    try {
                        await supabase.from('profiles').delete().eq('id', id);
                        team = await getTeam();
                        renderTable(team);
                    } catch (err) {
                        alert('Error deleting member');
                    }
                }
            });
        });

        document.querySelectorAll('.reset-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if(confirm('Reset this user\'s password to Ramsy4u&me?')) {
                    try {
                        const response = await fetch(`${BACKEND_URL}/api/reset-password`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ user_id: id })
                        });
                        const result = await response.json();
                        if (!response.ok) throw new Error(result.error);
                        alert(result.message);
                    } catch (err) {
                        alert('Error resetting password: ' + err.message);
                    }
                }
            });
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
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
