// dashboard.js
import { state, clearUser } from '../state.js';
import { getSidebar } from '../layouts/sidebar.js';
import { supabase } from '../config/supabaseClient.js';

export async function renderDashboard(container) {
    const user = state.user || { name: 'Guest', role: 'admin' };
    
    // Fetch team members for the dropdown filter
    const { data: profiles } = await supabase.from('profiles').select('full_name').order('full_name', { ascending: true });
    
    container.innerHTML = `
        <div class="app-layout">
            <aside class="sidebar">
                ${getSidebar('dashboard', user.role)}
            </aside>
            <header class="topbar">
                <h2>Analytics</h2>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span>${user.name}</span>
                    <button id="logout-btn" class="icon-btn" title="Logout">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                </div>
            </header>
            <main class="main-content">
                
                <!-- Stats Container (At Top) -->
                <div id="stats-container" style="background: var(--card-bg); padding: 25px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-around; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="text-align: center;">
                        <h3 style="color: var(--text-muted); font-size: 14px; margin-bottom: 5px;">Revenue</h3>
                        <p id="stat-revenue" style="font-size: 32px; font-weight: bold; color: var(--success);">₦0</p>
                    </div>
                    <div style="width: 1px; height: 50px; background: var(--border);"></div>
                    <div style="text-align: center;">
                        <h3 style="color: var(--text-muted); font-size: 14px; margin-bottom: 5px;">Transactions</h3>
                        <p id="stat-transactions" style="font-size: 32px; font-weight: bold; color: var(--primary);">0</p>
                    </div>
                </div>

                <!-- Filters -->
                <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <div style="display: flex; gap: 10px;">
                        <button class="filter-btn active" data-range="today">Today</button>
                        <button class="filter-btn" data-range="month">This Month</button>
                        <button class="filter-btn" data-range="all">All Time</button>
                    </div>
                    <select id="attendant-filter" style="padding: 8px 16px; border: 1px solid var(--border); border-radius: 6px; background: var(--card-bg); color: var(--text); cursor: pointer;">
                        <option value="all">All Attendants</option>
                        ${profiles ? profiles.map(p => `<option value="${p.full_name}">${p.full_name}</option>`).join('') : ''}
                    </select>
                </div>
                
                <!-- Recent Transactions Table -->
                <div style="background: var(--card-bg); padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h3 style="color: var(--text);">Recent Transactions</h3>
                    <div id="recent-sales" style="margin-top: 15px;">
                        <p style="color: var(--text-muted);">Loading...</p>
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

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const range = e.target.dataset.range;
            const attendant = document.getElementById('attendant-filter').value;
            loadAnalytics(range, attendant);
        });
    });

    document.getElementById('attendant-filter').addEventListener('change', (e) => {
        const activeRange = document.querySelector('.filter-btn.active').dataset.range;
        loadAnalytics(activeRange, e.target.value);
    });

    await loadAnalytics('today', 'all');
}

async function loadAnalytics(range, attendant) {
    const { data: allSales, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching sales:', error);
        return;
    }

    let filteredSales = allSales;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const monthStr = now.toISOString().substring(0, 7);

    if (range === 'today') {
        filteredSales = allSales.filter(sale => sale.created_at.startsWith(todayStr));
    } else if (range === 'month') {
        filteredSales = allSales.filter(sale => sale.created_at.startsWith(monthStr));
    }

    if (attendant !== 'all') {
        filteredSales = filteredSales.filter(sale => sale.attendant_name === attendant);
    }

    const revenue = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    
    document.getElementById('stat-revenue').innerText = `₦${revenue.toLocaleString()}`;
    document.getElementById('stat-transactions').innerText = filteredSales.length;

    const recentSalesContainer = document.getElementById('recent-sales');
    if (filteredSales.length === 0) {
        recentSalesContainer.innerHTML = '<p style="color: var(--text-muted);">No sales recorded for this period/attendant.</p>';
        return;
    }

    recentSalesContainer.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="text-align: left; border-bottom: 2px solid var(--border);">
                    <th style="padding: 10px; color: var(--text);">Date/Time</th>
                    <th style="padding: 10px; color: var(--text);">Attendant</th>
                    <th style="padding: 10px; color: var(--text);">Items</th>
                    <th style="padding: 10px; color: var(--text);">Total</th>
                </tr>
            </thead>
            <tbody>
                ${filteredSales.slice(0, 10).map(sale => `
                    <tr style="border-bottom: 1px solid var(--border);">
                        <td style="padding: 10px; color: var(--text);">${new Date(sale.created_at).toLocaleString()}</td>
                        <td style="padding: 10px; color: var(--text);">${sale.attendant_name}</td>
                        <td style="padding: 10px; color: var(--text);">${sale.items.length} item(s)</td>
                        <td style="padding: 10px; font-weight: bold; color: var(--text);">₦${sale.total_amount.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
