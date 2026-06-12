const BASE = (process.env.REACT_APP_API_URL || "http://localhost:3001/api");

export async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("token");
    const res = await fetch(BASE + path, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        ...options
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
}

export const authAPI = {
    login: (email, password) =>
        apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

    register: (email, password, username) =>
        apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ email, password, username }) }),

    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },

    getUser: () => {
        const u = localStorage.getItem("user");
        return u ? JSON.parse(u) : null;
    },

    isLoggedIn: () => !!localStorage.getItem("token"),
    isAdmin: () => {
        const u = localStorage.getItem("user");
        return u ? JSON.parse(u).role === "admin" : false;
    }
};
