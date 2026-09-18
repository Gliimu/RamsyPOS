// api.js
import { supabase } from './config/supabaseClient.js';

// --- Items / Inventory API ---
export async function getItems() {
    const { data, error } = await supabase.from('items').select('*');
    if (error) { console.error('Error fetching items:', error); return []; }
    return data || [];
}

export async function addItem(name, price, category) {
    const { data, error } = await supabase
        .from('items')
        .insert([{ name, price: parseFloat(price), category }])
        .select();
    if (error) throw error;
    return data[0];
}

export async function deleteItem(id) {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) throw error;
}

// --- Sales API ---
export async function saveSale(cart, total, attendantName) {
    const { data, error } = await supabase
        .from('sales')
        .insert([
            { 
                attendant_name: attendantName, 
                total_amount: total, 
                items: cart // Save the entire cart array as JSON
            }
        ]);
    if (error) throw error;
    return data;
}
