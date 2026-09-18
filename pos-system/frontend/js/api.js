// api.js
const STORAGE_KEY = 'ramsypos_items';
const TEAM_KEY = 'ramsypos_team';

const defaultItems = [
    { id: 1, name: "Gym Daily Pass", price: 5000, category: "gym" },
    { id: 2, name: "Protein Shake", price: 3500, category: "gym" },
    { id: 3, name: "Heineken", price: 1500, category: "bar" },
    { id: 4, name: "Pepper Soup", price: 4000, category: "bar" },
    { id: 5, name: "Jollof Rice", price: 3000, category: "restaurant" },
    { id: 6, name: "Suya (10 sticks)", price: 2500, category: "restaurant" },
    { id: 7, name: "Hair Cut", price: 2000, category: "saloon" },
    { id: 8, name: "Hair Dye", price: 5000, category: "saloon" }
];

export async function getItems() {
    const items = localStorage.getItem(STORAGE_KEY);
    if (!items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultItems));
        return defaultItems;
    }
    return JSON.parse(items);
}

export async function addItem(name, price, category) {
    const items = await getItems();
    const newItem = { id: Date.now(), name, price: parseFloat(price), category };
    items.push(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return newItem;
}

export async function deleteItem(id) {
    let items = await getItems();
    items = items.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// --- Team Management API ---
export async function getTeam() {
    const team = localStorage.getItem(TEAM_KEY);
    return team ? JSON.parse(team) : [];
}

export async function addTeamMember(name, email, role, category) {
    const team = await getTeam();
    const newMember = { id: Date.now(), name, email, role, category };
    team.push(newMember);
    localStorage.setItem(TEAM_KEY, JSON.stringify(team));
    return newMember;
}

export async function deleteTeamMember(id) {
    let team = await getTeam();
    team = team.filter(m => m.id !== id);
    localStorage.setItem(TEAM_KEY, JSON.stringify(team));
}
