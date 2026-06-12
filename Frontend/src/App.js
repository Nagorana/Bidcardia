import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/login";
import Register from "./pages/register";
import Panier from "./pages/panier";
import Admin from "./pages/Admin";
import Vendre from "./pages/Vendre";
import "./App.css";
import logo from "./assets/logo.png";
import { authAPI } from "./api";

export default function App() {
    return (
        <Router>
            <div className="app-layout">
                <Sidebar />
                <div className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/panier" element={<Panier />} />
                        <Route path="/vendre" element={<Vendre />} />
                        <Route path="/admin" element={<Admin />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(authAPI.getUser());

    // Se resync à chaque changement de page (après login/logout)
    useEffect(() => {
        setUser(authAPI.getUser());
    }, [location]);

    // Se resync si un autre onglet modifie le localStorage
    useEffect(() => {
        const sync = () => setUser(authAPI.getUser());
        window.addEventListener("storage", sync);
        return () => window.removeEventListener("storage", sync);
    }, []);

    const handleLogout = () => {
        authAPI.logout();
        setUser(null);
        navigate("/login");
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <img src={logo} alt="Logo" />
            </div>

            {user && (
                <div className="sidebar-user">
                    <span className="sidebar-user-email">{user.username}</span>
                    {user.role === "admin" && (
                        <span className="sidebar-badge-admin">Admin</span>
                    )}
                </div>
            )}

            <button onClick={() => navigate("/")}>Dashboard</button>
            <button onClick={() => navigate("/panier")}>Panier</button>

            {user ? (
                <>
                    <button onClick={() => navigate("/vendre")}>Vendre</button>
                    {user.role === "admin" && (
                        <button onClick={() => navigate("/admin")}>⚙️ Admin</button>
                    )}
                    <button className="sidebar-btn-logout" onClick={handleLogout}>
                        Se déconnecter
                    </button>
                </>
            ) : (
                <button onClick={() => navigate("/login")}>Se connecter</button>
            )}
        </aside>
    );
}
