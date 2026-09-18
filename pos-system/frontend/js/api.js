// api.js
// Mock database for now. Later, this will make real fetch() calls to your Node.js backend.

export async function getItems() {
    return [
        { id: 1, name: "Gym Daily Pass", price: 5000, category: "gym" },
        { id: 2, name: "Protein Shake", price: 3500, category: "gym" },
        { id: 3, name: "Heineken", price: 1500, category: "bar" },
        { id: 4, name: "Pepper Soup", price: 4000, category: "bar" },
        { id: 5, name: "Jollof Rice", price: 3000, category: "restaurant" },
        { id: 6, name: "Suya (10 sticks)", price: 2500, category: "restaurant" }
    ];
}
