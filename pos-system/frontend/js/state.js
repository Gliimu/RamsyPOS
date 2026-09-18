// state.js
export const state = {
    user: null
};

export function setUser(name, role, category) {
    state.user = { name, role, category };
}

export function clearUser() {
    state.user = null;
}
