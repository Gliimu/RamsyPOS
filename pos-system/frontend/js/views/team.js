// team.js
import { state, clearUser } from '../state.js';
import { getSidebar } from '../layouts/sidebar.js';
import { supabase } from '../config/supabaseClient.js';

const BACKEND_URL = 'https://ramsypos-backend.onrender.com'; 

export async function renderTeam(container) {
    const user = state.user || { name: 'Guest', role: 'manager' };
    let team = await getTeam();

    container.innerHTML = `
        <style>
            .icon-btn { background: transparent; border: none; cursor: pointer; padding: 5px; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
            .icon-btn:hover { background: #f1f5f9; }
            .status-dot { height: 10px; width: 10px; border-radius: 50%; display: inline-block; margin-right: 5px; }
            .status-online { background: var(--success); }
            .status-offline { background: #94a3b8; }
        </style>
        <div class="app-layout">
            <aside class="sidebar">
                ${getSidebar('team', user.role)}
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
                    
                    <!-- Add Member Form -->
            <div style="background: var(--card-bg); padding: 20px; border-radius: 8px;">
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
                    <div style="background: var(--card-bg); padding: 20px; border-radius: 8px;">
                        <h3 style="margin-bottom: 20px;">Current Team</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="text-align: left; border-bottom: 2px solid var(--border);">
                                    <th style="padding: 10px;">Name</th>
                                    <th style="padding: 10px;">Username</th>
                                    <th style="padding: 10px;">Role</th>
                                    <th style="padding: 10px; text-align: right;">Actions</th>
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

        <!-- Hidden Details Modal -->
        <div id="details-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:50; justify-content:center; align-items:center;">
            <div style="background:white; padding:30px; border-radius:12px; width:400px; box-shadow: 0 10px 15px rgba(0,0,0,0.1);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="color:var(--primary);">User Details</h3>
                    <button id="close-details" class="icon-btn">
                        <svg width="24" height="24" fill="none" stroke="#64748b" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div id="details-content" style="font-size: 16px; line-height: 2;"></div>
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

    document.getElementById('close-details').addEventListener('click', () => {
        document.getElementById('details-modal').style.display = 'none';
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
        
        // SVG Icons
        const editIcon = `<svg width="16" height="16" fill="none" stroke="var(--primary)" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
        const resetIcon = `<svg width="16" height="16" fill="none" stroke="#f59e0b" stroke-width="2" viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 6.5m0 0l3 3L22 6l-3-3m-3.5 3.5L19 9"></path></svg>`;
        const detailsIcon = `<svg width="16" height="16" fill="none" stroke="#64748b" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;

        tbody.innerHTML = teamArray.map(m => `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 10px;">${m.full_name || 'N/A'}</td>
                <td style="padding: 10px;">${m.email.replace('@ramsypos.app', '')}</td>
                <td style="padding: 10px; text-transform: capitalize;">${m.role.replace('_', ' ')}</td>
                <td style="padding: 10px; display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="icon-btn details-btn" data-id="${m.id}" title="View Details">${detailsIcon}</button>
                    <button class="icon-btn edit-btn" data-id="${m.id}" title="Edit User">${editIcon}</button>
                    <button class="icon-btn reset-btn" data-id="${m.id}" title="Reset Password">${resetIcon}</button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.reset-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
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
                const id = e.currentTarget.dataset.id;
                const member = team.find(m => m.id === id);
                
                document.getElementById('edit-id').value = member.id;
                document.getElementById('edit-name').value = member.full_name || '';
                document.getElementById('edit-role').value = member.role;
                document.getElementById('edit-category').value = member.category;
                
                document.getElementById('edit-modal').style.display = 'flex';
            });
        });

        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const member = team.find(m => m.id === id);
                
                // Mocking online status for now. We will implement real presence later.
                const isOnline = Math.random() > 0.5; 
                const statusClass = isOnline ? 'status-online' : 'status-offline';
                const statusText = isOnline ? 'Online' : 'Offline';
                
                document.getElementById('details-content').innerHTML = `
                    <p><strong>Name:</strong> ${member.full_name || 'N/A'}</p>
                    <p><strong>Username:</strong> ${member.email.replace('@ramsypos.app', '')}</p>
                    <p><strong>Role:</strong> <span style="text-transform:capitalize;">${member.role.replace('_', ' ')}</span></p>
                    <p><strong>Category:</strong> <span style="text-transform:capitalize;">${member.category}</span></p>
                    <p><strong>Status:</strong> <span class="${statusClass} status-dot"></span>${statusText}</p>
                `;
                
                document.getElementById('details-modal').style.display = 'flex';
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
