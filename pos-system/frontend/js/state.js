// state.js
export const state = {
    user: null
};

export function setUser(name, role) {
    state.user = { name, role };
}

export function clearUser() {
    state.user = null;
}
