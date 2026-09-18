// team.js
import { state, clearUser } from '../state.js';
import { getSidebar } from '../layouts/sidebar.js';
import { supabase } from '../config/supabaseClient.js';

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
                            <input type="email" id="member-email" placeholder="Staff Email Address" required style="padding: 10px; border: 1px solid var(--border); border-radius: 6px;">
                            <select id="member-role" style="padding: 10px; border: 1px solid var(--border); border-radius: 6px;">
                                <option value="pos_attendant">POS Attendant</option>
                                <option value="admin">Admin</option>
                            </select>
                            <select id="member-category" style="padding: 10px; border: 1px solid var(--border); border-radius: 6px;">
                                <option value="gym">Gym</option>
                                <option value="bar">Bar</option>
                                <option value="restaurant">Restaurant</option>
                                <option value="saloon">Saloon</option>
                                <option value="all">All Categories</option>
                            </select>
                            <button type="submit" style="padding: 10px; background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Add Member & Send Invite</button>
                        </form>
                    </div>

                    <!-- Team Table -->
                    <div style="background: white; padding: 20px; border-radius: 8px;">
                        <h3 style="margin-bottom: 20px;">Current Team</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="text-align: left; border-bottom: 2px solid var(--border);">
                                    <th style="padding: 10px;">Name</th>
                                    <th style="padding: 10px;">Email</th>
                                    <th style="padding: 10px;">Role</th>
                                    <th style="padding: 10px;">Action</th>
                                </tr>
                            </thead>
                            <tbody id="team-table"></tbody>
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

    document.getElementById('add-member-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('member-name').value;
        const email = document.getElementById('member-email').value;
        const role = document.getElementById('member-role').value;
        const category = document.getElementById('member-category').value;
        
        try {
            // Call Supabase Admin function to invite user (Requires Node backend in production, 
            // but we can try to insert the profile directly for now to test DB connection)
            
            // NOTE: To actually send the email, we will need the Node.js backend running on Render.
            // For now, I will just save their profile to the database so you can see it working.
            
            const { data, error } = await supabase
                .from('profiles')
                .insert([
                    { 
                        id: '00000000-0000-0000-0000-000000000000', // Mock ID (Backend will replace this)
                        full_name: name, 
                        email: email, 
                        role: role, 
                        category: category 
                    }
                ]);

            if (error) throw error;
            
            alert(`Invite sent to ${email}. (Mock: Backend will handle actual email sending soon).`);
            team = await getTeam();
            renderTable(team);
            e.target.reset();
        } catch (error) {
            alert('Error adding member: ' + error.message);
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
                <td style="padding: 10px;">${m.full_name}</td>
                <td style="padding: 10px;">${m.email}</td>
                <td style="padding: 10px; text-transform: capitalize;">${m.role.replace('_', ' ')}</td>
                <td style="padding: 10px;"><button class="delete-btn" data-id="${m.id}" style="padding: 5px 10px; background: var(--danger); color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button></td>
            </tr>
        `).join('');

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                try {
                    await supabase.from('profiles').delete().eq('id', id);
                    team = await getTeam();
                    renderTable(team);
                } catch (err) {
                    alert('Error deleting member');
                }
            });
        });
    }

    renderTable(team);
}

// Fetch team from Supabase
async function getTeam() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*');
    
    if (error) {
        console.error('Error fetching team:', error);
        return [];
    }
    return data || [];
}
