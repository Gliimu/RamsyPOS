// state.js
export const state = {
    user: null,
    subscriptionActive: true,
    subscriptionData: null
};

export function setUser(name, role, category) {
    state.user = { name, role, category };
}

export function clearUser() {
    state.user = null;
    state.subscriptionActive = true;
    state.subscriptionData = null;
}

export function setSubscription(data) {
    state.subscriptionData = data;
    state.subscriptionActive = data?.is_active === true;
}
