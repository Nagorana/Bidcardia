import "../styles/admin.css";
import { useState, useEffect, useCallback } from "react";
import { apiFetch, authAPI } from "../api";
import { useNavigate } from "react-router-dom";

export default function Admin() {
    const navigate = useNavigate();
    const user = authAPI.getUser();

    useEffect(() => {
        if (!user || user.role !== "admin") navigate("/");
    }, [user, navigate]);

    const [extensions, setExtensions] = useState([]);
    const [selectedExt, setSelectedExt] = useState(null);
    const [toast, setToast] = useState("");
    const [newExt, setNewExt] = useState({ name: "", description: "" });
    const [showExtForm, setShowExtForm] = useState(false);
    const [newCard, setNewCard] = useState({ name: "", image: "", rarity: "commune" });
    const [showCardForm, setShowCardForm] = useState(false);

    const rarities = ["commune", "peu commune", "rare", "ultra rare", "secrète"];

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const fetchExtensions = useCallback(async () => {
        try {
            const data = await apiFetch("/admin/extensions");
            setExtensions(data);
            setSelectedExt(prev => {
                if (!prev) return null;
                const updated = data.find(e => e.id === prev.id);
                return updated || null;
            });
        } catch (e) {
            showToast("Erreur de chargement");
        }
    }, []);

    useEffect(() => { fetchExtensions(); }, [fetchExtensions]);

    const handleCreateExt = async () => {
        if (!newExt.name) return showToast("Nom requis");
        try {
            await apiFetch("/admin/extensions", { method: "POST", body: JSON.stringify(newExt) });
            setNewExt({ name: "", description: "" });
            setShowExtForm(false);
            showToast("✅ Extension créée !");
            fetchExtensions();
        } catch (err) { showToast(err.error || "Erreur"); }
    };

    const handleDeleteExt = async (extId) => {
        if (!window.confirm("Supprimer cette extension et toutes ses cartes ?")) return;
        try {
            await apiFetch(`/admin/extensions/${extId}`, { method: "DELETE" });
            if (selectedExt?.id === extId) setSelectedExt(null);
            showToast("Extension supprimée");
            fetchExtensions();
        } catch (err) { showToast(err.error || "Erreur"); }
    };

    const handleAddCard = async () => {
        if (!newCard.name) return showToast("Nom de carte requis");
        if (!selectedExt) return;
        try {
            await apiFetch(`/admin/extensions/${selectedExt.id}/cards`, { method: "POST", body: JSON.stringify(newCard) });
            setNewCard({ name: "", image: "", rarity: "commune" });
            setShowCardForm(false);
            showToast("✅ Carte ajoutée !");
            fetchExtensions();
        } catch (err) { showToast(err.error || "Erreur"); }
    };

    const handleDeleteCard = async (extId, cardId) => {
        try {
            await apiFetch(`/admin/extensions/${extId}/cards/${cardId}`, { method: "DELETE" });
            showToast("Carte supprimée");
            fetchExtensions();
        } catch (err) { showToast(err.error || "Erreur"); }
    };

    if (!user || user.role !== "admin") return null;

    return (
        <div className="admin-container">
            {toast && <div className="toast">{toast}</div>}
            <div className="admin-header">
                <h1>⚙️ Panel Admin</h1>
                <p>Gestion des extensions et des cartes</p>
            </div>
            <div className="admin-layout">
                <div className="admin-col">
                    <div className="admin-section-header">
                        <h2>Extensions</h2>
                        <button className="btn-add" onClick={() => setShowExtForm(!showExtForm)}>
                            {showExtForm ? "✕ Annuler" : "+ Nouvelle"}
                        </button>
                    </div>
                    {showExtForm && (
                        <div className="admin-form">
                            <input type="text" placeholder="Nom de l'extension" value={newExt.name} onChange={e => setNewExt({ ...newExt, name: e.target.value })} />
                            <input type="text" placeholder="Description (optionnel)" value={newExt.description} onChange={e => setNewExt({ ...newExt, description: e.target.value })} />
                            <button className="btn-confirm" onClick={handleCreateExt}>Créer l'extension</button>
                        </div>
                    )}
                    <div className="ext-list">
                        {extensions.length === 0 && <p className="empty-msg">Aucune extension. Crée-en une !</p>}
                        {extensions.map(ext => (
                            <div key={ext.id} className={`ext-item ${selectedExt?.id === ext.id ? "ext-item-active" : ""}`} onClick={() => { setSelectedExt(ext); setShowCardForm(false); }}>
                                <div className="ext-item-info">
                                    <span className="ext-item-name">{ext.name}</span>
                                    <span className="ext-item-count">{ext.cards.length} carte{ext.cards.length !== 1 ? "s" : ""}</span>
                                </div>
                                <button className="btn-icon-delete" onClick={e => { e.stopPropagation(); handleDeleteExt(ext.id); }} title="Supprimer">🗑</button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="admin-col admin-col-wide">
                    {!selectedExt ? (
                        <div className="admin-empty"><p>👈 Sélectionne une extension pour gérer ses cartes</p></div>
                    ) : (
                        <>
                            <div className="admin-section-header">
                                <h2>Cartes — {selectedExt.name}</h2>
                                <button className="btn-add" onClick={() => setShowCardForm(!showCardForm)}>
                                    {showCardForm ? "✕ Annuler" : "+ Ajouter une carte"}
                                </button>
                            </div>
                            {showCardForm && (
                                <div className="admin-form">
                                    <input type="text" placeholder="Nom de la carte" value={newCard.name} onChange={e => setNewCard({ ...newCard, name: e.target.value })} />
                                    <input type="text" placeholder="URL de l'image" value={newCard.image} onChange={e => setNewCard({ ...newCard, image: e.target.value })} />
                                    {newCard.image && <img src={newCard.image} alt="preview" className="card-preview-img" />}
                                    <div className="rarity-select">
                                        <label>Rareté</label>
                                        <div className="rarity-btns">
                                            {rarities.map(r => (
                                                <button key={r} className={`rarity-btn ${newCard.rarity === r ? "rarity-active" : ""}`} onClick={() => setNewCard({ ...newCard, rarity: r })}>{r}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <button className="btn-confirm" onClick={handleAddCard}>Ajouter la carte</button>
                                </div>
                            )}
                            {selectedExt.cards.length === 0 ? (
                                <p className="empty-msg">Aucune carte dans cette extension.</p>
                            ) : (
                                <div className="admin-cards-grid">
                                    {selectedExt.cards.map(card => (
                                        <div key={card.id} className="admin-card">
                                            {card.image ? <img src={card.image} alt={card.name} /> : <div className="admin-card-no-img">Pas d'image</div>}
                                            <div className="admin-card-info">
                                                <span className="admin-card-name">{card.name}</span>
                                                <span className={`admin-card-rarity rarity-${card.rarity?.replace(" ", "-")}`}>{card.rarity}</span>
                                            </div>
                                            <button className="btn-card-delete" onClick={() => handleDeleteCard(selectedExt.id, card.id)}>Supprimer</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
