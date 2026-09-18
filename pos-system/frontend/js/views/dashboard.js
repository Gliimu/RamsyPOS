// dashboard.js
import { state, clearUser } from '../state.js';
import { getSidebar } from '../layouts/sidebar.js';
import { supabase } from '../config/supabaseClient.js';

export async function renderDashboard(container) {
    const user = state.user || { name: 'Guest', role: 'admin' };
    
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
                <div style="margin-bottom: 20px; display: flex; gap: 10px;">
                    <button class="filter-btn active" data-range="today">Today</button>
                    <button class="filter-btn" data-range="month">This Month</button>
                    <button class="filter-btn" data-range="all">All Time</button>
                </div>
                
                <div id="dashboard-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <p style="color: var(--text-muted);">Loading analytics...</p>
                </div>
                
                <div style="background: var(--card-bg); padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h3 style="color: var(--text);">Recent Transactions</h3>
                    <div id="recent-sales" style="margin-top: 15px;">
                        <p style="color: var(--text-muted);">Loading recent sales...</p>
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
            loadAnalytics(e.target.dataset.range);
        });
    });

    await loadAnalytics('today');
}

async function loadAnalytics(range) {
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

    const revenue = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const allTimeRevenue = allSales.reduce((sum, sale) => sum + sale.total_amount, 0);

    document.getElementById('dashboard-stats').innerHTML = `
        <div style="background: var(--card-bg); padding: 20px; border-radius: 8px; border-left: 4px solid var(--success);">
            <h3 style="color: var(--text-muted); font-size: 14px; margin-bottom: 5px;">Revenue</h3>
            <p style="font-size: 28px; font-weight: bold; color: var(--text);">₦${revenue.toLocaleString()}</p>
        </div>
        <div style="background: var(--card-bg); padding: 20px; border-radius: 8px; border-left: 4px solid var(--primary);">
            <h3 style="color: var(--text-muted); font-size: 14px; margin-bottom: 5px;">Transactions</h3>
            <p style="font-size: 28px; font-weight: bold; color: var(--text);">${filteredSales.length}</p>
        </div>
        <div style="background: var(--card-bg); padding: 20px; border-radius: 8px; border-left: 4px solid var(--danger);">
            <h3 style="color: var(--text-muted); font-size: 14px; margin-bottom: 5px;">All-Time Revenue</h3>
            <p style="font-size: 28px; font-weight: bold; color: var(--text);">₦${allTimeRevenue.toLocaleString()}</p>
        </div>
    `;

    const recentSalesContainer = document.getElementById('recent-sales');
    if (filteredSales.length === 0) {
        recentSalesContainer.innerHTML = '<p style="color: var(--text-muted);">No sales recorded for this period.</p>';
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
