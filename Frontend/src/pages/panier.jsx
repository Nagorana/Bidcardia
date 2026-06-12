import "../styles/panier.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { apiFetch, authAPI } from "../api";

export default function Panier() {
    const navigate = useNavigate();
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState("");

    const user = authAPI.getUser();

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const fetchCart = useCallback(async () => {
        if (!user) { setLoading(false); return; }
        try {
            const data = await apiFetch("/cart");
            setCart(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchCart(); }, [fetchCart]);

    const removeFromCart = async (listingId) => {
        try {
            await apiFetch(`/cart/${listingId}`, { method: "DELETE" });
            showToast("Article retiré du panier");
            fetchCart();
        } catch (e) {
            showToast(e.error || "Erreur");
        }
    };

    const handleCheckout = async () => {
        try {
            const result = await apiFetch("/cart/checkout", { method: "POST" });
            showToast(`✅ ${result.message}`);
            fetchCart();
        } catch (e) {
            showToast(e.error || "Erreur lors du paiement");
        }
    };

    const total = cart.items.reduce((acc, item) => acc + (Number(item.price) || 0), 0);

    if (!user) {
        return (
            <div className="panier-container">
                <p style={{ textAlign: "center", marginTop: "40px" }}>Connecte-toi pour voir ton panier.</p>
                <div style={{ textAlign: "center" }}>
                    <button onClick={() => navigate("/login")}>Se connecter</button>
                </div>
            </div>
        );
    }

    return (
        <div className="panier-container">
            {toast && <div className="toast">{toast}</div>}
            <header className="panier-header">
                <h1>Mon Panier</h1>
                <button onClick={() => navigate("/")}>Retour au marché</button>
            </header>
            <div className="panier-content">
                {loading && <p>Chargement...</p>}
                {!loading && cart.items.length === 0 && <p>Votre panier est vide</p>}
                {cart.items.map((item) => (
                    <div key={item.id} className="panier-item">
                        {item.card_image && <img src={item.card_image} alt={item.card_name} />}
                        <div className="item-details">
                            <h3>{item.card_name}</h3>
                            <p>{item.extension_name}</p>
                            <p>{item.price} {item.currency}</p>
                            <button onClick={() => removeFromCart(item.listing_id)}>Supprimer</button>
                        </div>
                        <div className="item-total">{Number(item.price).toFixed(2)} {item.currency}</div>
                    </div>
                ))}
            </div>
            {cart.items.length > 0 && (
                <div className="panier-summary">
                    <h2>Total : {total.toFixed(2)} €</h2>
                    <button className="checkout-button" onClick={handleCheckout}>Procéder au paiement</button>
                </div>
            )}
        </div>
    );
}
