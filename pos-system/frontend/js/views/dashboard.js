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
                <h2>Admin Dashboard</h2>
                <div>
                    <span style="margin-right: 15px;">${user.name}</span>
                    <button id="logout-btn" style="padding: 8px 16px; background: var(--danger); color: white; border: none; border-radius: 6px; cursor: pointer;">Logout</button>
                </div>
            </header>
            <main class="main-content">
                <div id="dashboard-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <!-- Stats will inject here -->
                    <p>Loading analytics...</p>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h3>Recent Transactions</h3>
                    <div id="recent-sales" style="margin-top: 15px;">
                        <p>Loading recent sales...</p>
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

    // Fetch and render analytics
    await loadAnalytics();
}

async function loadAnalytics() {
    // Get today's date in ISO format (just the date part)
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch ALL sales
    const { data: allSales, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching sales:', error);
        return;
    }

    // Calculate Today's Sales
    const todaySales = allSales.filter(sale => sale.created_at.startsWith(today));
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0);
    
    // Calculate Total Revenue
    const totalRevenue = allSales.reduce((sum, sale) => sum + sale.total_amount, 0);

    // Render Stat Cards
    document.getElementById('dashboard-stats').innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid var(--success);">
            <h3 style="color: var(--text-muted); font-size: 14px; margin-bottom: 5px;">Today's Revenue</h3>
            <p style="font-size: 28px; font-weight: bold; color: var(--text);">₦${todayRevenue.toLocaleString()}</p>
        </div>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid var(--primary);">
            <h3 style="color: var(--text-muted); font-size: 14px; margin-bottom: 5px;">Today's Transactions</h3>
            <p style="font-size: 28px; font-weight: bold; color: var(--text);">${todaySales.length}</p>
        </div>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid var(--danger);">
            <h3 style="color: var(--text-muted); font-size: 14px; margin-bottom: 5px;">Total All-Time Revenue</h3>
            <p style="font-size: 28px; font-weight: bold; color: var(--text);">₦${totalRevenue.toLocaleString()}</p>
        </div>
    `;

    // Render Recent Sales Table
    const recentSalesContainer = document.getElementById('recent-sales');
    if (allSales.length === 0) {
        recentSalesContainer.innerHTML = '<p style="color: var(--text-muted);">No sales recorded yet.</p>';
        return;
    }

    recentSalesContainer.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="text-align: left; border-bottom: 2px solid var(--border);">
                    <th style="padding: 10px;">Date/Time</th>
                    <th style="padding: 10px;">Attendant</th>
                    <th style="padding: 10px;">Items</th>
                    <th style="padding: 10px;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${allSales.slice(0, 10).map(sale => `
                    <tr style="border-bottom: 1px solid var(--border);">
                        <td style="padding: 10px;">${new Date(sale.created_at).toLocaleString()}</td>
                        <td style="padding: 10px;">${sale.attendant_name}</td>
                        <td style="padding: 10px;">${sale.items.length} item(s)</td>
                        <td style="padding: 10px; font-weight: bold;">₦${sale.total_amount.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
