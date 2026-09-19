// dashboard.js
import { state, clearUser } from '../state.js';
import { getSidebar } from '../layouts/sidebar.js';
import { supabase } from '../config/supabaseClient.js';

export async function renderDashboard(container) {
    const user = state.user || { name: 'Guest', role: 'admin' };
    const { data: profiles } = await supabase.from('profiles').select('full_name').order('full_name', { ascending: true });
    
    container.innerHTML = `
        <div class="app-layout">
            <aside class="sidebar">${getSidebar('dashboard', user.role)}</aside>
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
                
                <!-- Stats Container -->
                <div id="stats-container" style="background: var(--card-bg); padding: 25px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-around; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="text-align: center;">
                        <h3 style="color: var(--text-muted); font-size: 14px; margin-bottom: 5px;">Revenue</h3>
                        <p id="stat-revenue" style="font-size: 32px; font-weight: bold; color: #b8860b;">₦0</p>
                    </div>
                    <div style="width: 1px; height: 50px; background: var(--border);"></div>
                    <div style="text-align: center;">
                        <h3 style="color: var(--text-muted); font-size: 14px; margin-bottom: 5px;">Transactions</h3>
                        <p id="stat-transactions" style="font-size: 32px; font-weight: bold; color: #b8860b;">0</p>
                    </div>
                </div>

                <!-- Filters -->
                <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <select id="time-filter" class="filter-btn" style="cursor: pointer;">
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                        <input type="date" id="date-filter" class="filter-btn" style="cursor: pointer;" />
                    </div>
                    <select id="attendant-filter" class="filter-btn" style="cursor: pointer; width:180px;">
                        <option value="all">All Attendants</option>
                        ${profiles ? profiles.map(p => `<option value="${p.full_name}">${p.full_name}</option>`).join('') : ''}
                    </select>
                </div>
                
                <!-- Transaction History -->
                <div style="background: var(--card-bg); padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h3 style="color: var(--text);">Transaction History</h3>
                    <div id="recent-sales" style="margin-top: 15px; max-height: 500px; overflow-y: auto;">
                        <p style="color: var(--text-muted);">Loading...</p>
                    </div>
                </div>
            </main>
        </div>

        <!-- Hidden Items Modal -->
        <div id="items-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:50; justify-content:center; align-items:center;">
            <div style="background:var(--card-bg); padding:30px; border-radius:12px; width:400px; max-height: 80vh; overflow-y: auto;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="color:var(--primary);">Items Sold</h3>
                    <button id="close-modal" class="icon-btn">
                        <svg width="24" height="24" fill="none" stroke="var(--text-muted)" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div id="modal-items-list"></div>
            </div>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        clearUser();
        window.location.hash = '#login';
    });

    document.getElementById('time-filter').addEventListener('change', applyFilters);
    document.getElementById('date-filter').addEventListener('change', applyFilters);
    document.getElementById('attendant-filter').addEventListener('change', applyFilters);
    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('items-modal').style.display = 'none';
    });

    await loadAnalytics('today', 'all', null);

    function applyFilters() {
        const time = document.getElementById('time-filter').value;
        const date = document.getElementById('date-filter').value;
        const attendant = document.getElementById('attendant-filter').value;
        loadAnalytics(time, attendant, date);
    }
}

async function loadAnalytics(range, attendant, specificDate) {
    const { data: allSales, error } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error fetching sales:', error); return; }

    let filteredSales = allSales;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthStr = now.toISOString().substring(0, 7);
    const yearStr = now.getFullYear().toString();

    if (specificDate) {
        filteredSales = allSales.filter(sale => sale.created_at.startsWith(specificDate));
    } else {
        if (range === 'today') filteredSales = allSales.filter(sale => sale.created_at.startsWith(todayStr));
        else if (range === 'week') filteredSales = allSales.filter(sale => new Date(sale.created_at) >= weekAgo);
        else if (range === 'month') filteredSales = allSales.filter(sale => sale.created_at.startsWith(monthStr));
        else if (range === 'year') filteredSales = allSales.filter(sale => sale.created_at.startsWith(yearStr));
    }

    if (attendant !== 'all') {
        filteredSales = filteredSales.filter(sale => sale.attendant_name === attendant);
    }

    const revenue = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    document.getElementById('stat-revenue').innerText = `₦${revenue.toLocaleString()}`;
    document.getElementById('stat-transactions').innerText = filteredSales.length;

    const recentSalesContainer = document.getElementById('recent-sales');
    if (filteredSales.length === 0) {
        recentSalesContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No sales recorded for this period/attendant.</p>';
        return;
    }

    recentSalesContainer.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead style="position: sticky; top: 0; background: var(--card-bg); z-index: 10;">
                <tr style="text-align: left; border-bottom: 2px solid var(--border);">
                    <th style="padding: 10px; color: var(--text);">Date/Time</th>
                    <th style="padding: 10px; color: var(--text);">Attendant</th>
                    <th style="padding: 10px; color: var(--text); text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${filteredSales.map(sale => `
                    <tr class="tx-row" style="border-bottom: 1px solid var(--border);" data-items='${JSON.stringify(sale.items)}'>
                        <td style="padding: 12px 10px; color: var(--text);">${new Date(sale.created_at).toLocaleString()}</td>
                        <td style="padding: 12px 10px; color: var(--text);">${sale.attendant_name}</td>
                        <td style="padding: 12px 10px; font-weight: bold; color: var(--text); text-align: right;">₦${sale.total_amount.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    document.querySelectorAll('.tx-row').forEach(row => {
        row.addEventListener('click', (e) => {
            let items = [];
            try {
                items = JSON.parse(e.currentTarget.dataset.items);
            } catch (err) {
                console.error("Error parsing items", err);
            }
            
            const modalList = document.getElementById('modal-items-list');
            modalList.innerHTML = items.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border);">
                    <span style="color: var(--text);">${item.qty}x ${item.name}</span>
                    <span style="color: var(--text); font-weight: bold;">₦${(item.price * item.qty).toLocaleString()}</span>
                </div>
            `).join('');
            
            document.getElementById('items-modal').style.display = 'flex';
        });
    });
}
