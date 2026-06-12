import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, authAPI } from "../api";
import "../styles/dashboard.css";

export default function Vendre() {
    const navigate = useNavigate();
    const user = authAPI.getUser();

    const [extensions, setExtensions] = useState([]);
    const [toast, setToast] = useState("");
    const [myListings, setMyListings] = useState([]);
    const [form, setForm] = useState({
        extensionId: "", cardId: "", price: "", currency: "€", mode: "immediate", endTime: ""
    });

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const loadData = useCallback(async () => {
        if (!user) { navigate("/login"); return; }
        apiFetch("/listings/extensions/all").then(setExtensions).catch(console.error);
        apiFetch("/listings/my/sales").then(setMyListings).catch(console.error);
    }, [user, navigate]);

    useEffect(() => { loadData(); }, [loadData]);

    const selectedExt = Array.isArray(extensions) ? extensions.find(e => e.id === form.extensionId) : null;
    const availableCards = selectedExt ? selectedExt.cards : [];

    const handleSell = async () => {
        if (!form.extensionId || !form.cardId || !form.price) return showToast("Remplis tous les champs !");
        try {
            await apiFetch("/listings", { method: "POST", body: JSON.stringify(form) });
            showToast("✅ Carte mise en vente !");
            setForm({ extensionId: "", cardId: "", price: "", currency: "€", mode: "immediate", endTime: "" });
            const updated = await apiFetch("/listings/my/sales");
            setMyListings(updated);
        } catch (err) { showToast(err.error || "Erreur lors de la mise en vente"); }
    };

    const handleCancel = async (id) => {
        try {
            await apiFetch(`/listings/${id}`, { method: "DELETE" });
            showToast("Vente annulée");
            const updated = await apiFetch("/listings/my/sales");
            setMyListings(updated);
        } catch (err) { showToast(err.error || "Erreur"); }
    };

    return (
        <div className="market-container">
            {toast && <div className="toast">{toast}</div>}
            <header className="market-header">
                <h1 style={{ margin: 0 }}>Mes ventes</h1>
            </header>
            <div className="sell-form-wrapper" style={{ display: "block", marginBottom: "40px" }}>
                <div className="sell-form">
                    <h2>Mettre une carte en vente</h2>
                    <div className="sell-field">
                        <label>Extension</label>
                        <select value={form.extensionId} onChange={e => setForm({ ...form, extensionId: e.target.value, cardId: "" })}>
                            <option value="">— Choisir une extension —</option>
                            {extensions.map(ext => <option key={ext.id} value={ext.id}>{ext.name}</option>)}
                        </select>
                    </div>
                    <div className="sell-field">
                        <label>Carte</label>
                        <select value={form.cardId} onChange={e => setForm({ ...form, cardId: e.target.value })} disabled={!form.extensionId}>
                            <option value="">— Choisir une carte —</option>
                            {availableCards.map(card => <option key={card.id} value={card.id}>{card.name} {card.rarity ? `(${card.rarity})` : ""}</option>)}
                        </select>
                    </div>
                    <div className="sell-field sell-row">
                        <div style={{ flex: 1 }}>
                            <label>Prix</label>
                            <input type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                        </div>
                        <div>
                            <label>Devise</label>
                            <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                                <option value="€">€</option>
                                <option value="$">$</option>
                                <option value="£">£</option>
                            </select>
                        </div>
                    </div>
                    <div className="sell-field">
                        <label>Type de vente</label>
                        <div className="sell-mode-toggle">
                            <button className={form.mode === "immediate" ? "mode-btn active" : "mode-btn"} onClick={() => setForm({ ...form, mode: "immediate", endTime: "" })}>⚡ Achat direct</button>
                            <button className={form.mode === "auction" ? "mode-btn active" : "mode-btn"} onClick={() => setForm({ ...form, mode: "auction" })}>🔨 Enchère</button>
                        </div>
                    </div>
                    {form.mode === "auction" && (
                        <div className="sell-field">
                            <label>Date de fin</label>
                            <input type="datetime-local" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                        </div>
                    )}
                    <button className="sell-submit-btn" onClick={handleSell}>Mettre en vente</button>
                </div>
            </div>
            <h2>Mes ventes actives</h2>
            {myListings.filter(l => l.status === "active").length === 0
                ? <p style={{ color: "#b08acb" }}>Aucune vente active.</p>
                : (
                    <div className="cards-grid">
                        {myListings.filter(l => l.status === "active").map(listing => (
                            <div key={listing.id} className="card">
                                <div className={`card-badge ${listing.mode === "auction" ? "badge-auction" : "badge-immediate"}`}>
                                    {listing.mode === "auction" ? "🔨 Enchère" : "⚡ Direct"}
                                </div>
                                <img src={listing.card_image} alt={listing.card_name} />
                                <div className="card-info">
                                    <h3>{listing.card_name}</h3>
                                    <p className="card-extension">{listing.extension_name}</p>
                                </div>
                                <div className="card-price-block">
                                    <span className="card-price">{listing.price} {listing.currency}</span>
                                </div>
                                <div className="card-actions">
                                    <button className="btn-delete" onClick={() => handleCancel(listing.id)}>Annuler la vente</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        </div>
    );
}
