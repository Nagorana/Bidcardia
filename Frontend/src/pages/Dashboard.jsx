import "../styles/dashboard.css";
import { useState, useEffect, useCallback } from "react";
import { apiFetch, authAPI } from "../api";

export default function Dashboard() {
    const [listings, setListings] = useState([]);
    const [extensions, setExtensions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [search, setSearch] = useState("");
    const [filterMode, setFilterMode] = useState("all");
    const [isSelling, setIsSelling] = useState(false);
    const [bidModal, setBidModal] = useState(null);
    const [bidAmount, setBidAmount] = useState("");
    const [bidError, setBidError] = useState("");
    const [bidSuccess, setBidSuccess] = useState("");
    const [toast, setToast] = useState("");

    const user = authAPI.getUser();

    const [newListing, setNewListing] = useState({
        extensionId: "",
        cardId: "",
        price: "",
        currency: "€",
        mode: "immediate",
        endTime: ""
    });

    const fetchListings = useCallback(async () => {
        try {
            const data = await apiFetch("/listings");
            setListings(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchExtensions = useCallback(async () => {
        try {
            const data = await apiFetch("/listings/extensions/all");
            setExtensions(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => {
        fetchListings();
        fetchExtensions();
    }, [fetchListings, fetchExtensions]);

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const selectedExt = Array.isArray(extensions)
        ? extensions.find(e => e.id === newListing.extensionId)
        : null;
    const availableCards = selectedExt ? selectedExt.cards : [];

    const handleSell = async () => {
        if (!newListing.extensionId || !newListing.cardId || !newListing.price)
            return showToast("Remplis tous les champs !");
        try {
            await apiFetch("/listings", {
                method: "POST",
                body: JSON.stringify(newListing)
            });
            setIsSelling(false);
            setNewListing({ extensionId: "", cardId: "", price: "", currency: "€", mode: "immediate", endTime: "" });
            showToast("✅ Carte mise en vente !");
            fetchListings();
        } catch (err) {
            showToast(err.error || "Erreur lors de la mise en vente");
        }
    };

    const handleAddToCart = async (listing) => {
        if (!user) return showToast("Connecte-toi d'abord !");
        try {
            await apiFetch("/cart/add", {
                method: "POST",
                body: JSON.stringify({ listingId: listing.id })
            });
            showToast("✅ Ajouté au panier !");
        } catch (err) {
            showToast(err.error || "Erreur");
        }
    };

    const openBidModal = (listing) => {
        if (!user) return showToast("Connecte-toi d'abord !");
        setBidModal(listing);
        setBidAmount("");
        setBidError("");
        setBidSuccess("");
    };

    const handleBid = async () => {
        setBidError("");
        setBidSuccess("");
        if (!bidAmount || isNaN(bidAmount)) return setBidError("Montant invalide");
        try {
            await apiFetch(`/listings/${bidModal.id}/bid`, {
                method: "POST",
                body: JSON.stringify({ amount: parseFloat(bidAmount) })
            });
            setBidSuccess("✅ Enchère placée !");
            setBidAmount("");
            fetchListings();
        } catch (err) {
            setBidError(err.error || "Erreur");
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiFetch(`/listings/${id}`, { method: "DELETE" });
            showToast("Annulé !");
            fetchListings();
        } catch (err) {
            showToast(err.error || "Erreur");
        }
    };

    const filtered = listings.filter(l => {
        const matchSearch = l.card_name.toLowerCase().includes(search.toLowerCase()) ||
            l.extension_name.toLowerCase().includes(search.toLowerCase());
        const matchMode = filterMode === "all" || l.mode === filterMode;
        return matchSearch && matchMode;
    });

    const formatTimeLeft = (endTime) => {
        const diff = Math.floor((endTime - currentTime) / 1000);
        if (diff <= 0) return "Terminée";
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    return (
        <div className="market-container">
            {toast && <div className="toast">{toast}</div>}

            <header className="market-header">
                <div className="filters">
                    <input
                        type="text"
                        placeholder="Rechercher une carte, une extension..."
                        className="search-input"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button className={filterMode === "all" ? "filter-btn active" : "filter-btn"} onClick={() => setFilterMode("all")}>Tout</button>
                    <button className={filterMode === "immediate" ? "filter-btn active" : "filter-btn"} onClick={() => setFilterMode("immediate")}>Achat direct</button>
                    <button className={filterMode === "auction" ? "filter-btn active" : "filter-btn"} onClick={() => setFilterMode("auction")}>Enchères</button>
                    {user && (
                        <button className="filter-btn sell-btn" onClick={() => setIsSelling(!isSelling)}>
                            {isSelling ? "✕ Annuler" : "+ Vendre"}
                        </button>
                    )}
                </div>
            </header>

            {isSelling && (
                <div className="sell-form-wrapper">
                    <div className="sell-form">
                        <h2>Mettre une carte en vente</h2>
                        <div className="sell-field">
                            <label>Extension</label>
                            <select value={newListing.extensionId} onChange={e => setNewListing({ ...newListing, extensionId: e.target.value, cardId: "" })}>
                                <option value="">— Choisir une extension —</option>
                                {extensions.map(ext => <option key={ext.id} value={ext.id}>{ext.name}</option>)}
                            </select>
                        </div>
                        <div className="sell-field">
                            <label>Carte</label>
                            <select value={newListing.cardId} onChange={e => setNewListing({ ...newListing, cardId: e.target.value })} disabled={!newListing.extensionId}>
                                <option value="">— Choisir une carte —</option>
                                {availableCards.map(card => <option key={card.id} value={card.id}>{card.name} {card.rarity ? `(${card.rarity})` : ""}</option>)}
                            </select>
                            {newListing.cardId && availableCards.find(c => c.id === newListing.cardId)?.image && (
                                <img className="sell-card-preview" src={availableCards.find(c => c.id === newListing.cardId).image} alt="preview" />
                            )}
                        </div>
                        <div className="sell-field sell-row">
                            <div style={{ flex: 1 }}>
                                <label>Prix de départ</label>
                                <input type="number" min="0" step="0.01" placeholder="0.00" value={newListing.price} onChange={e => setNewListing({ ...newListing, price: e.target.value })} />
                            </div>
                            <div>
                                <label>Devise</label>
                                <select value={newListing.currency} onChange={e => setNewListing({ ...newListing, currency: e.target.value })}>
                                    <option value="€">€</option>
                                    <option value="$">$</option>
                                    <option value="£">£</option>
                                </select>
                            </div>
                        </div>
                        <div className="sell-field">
                            <label>Type de vente</label>
                            <div className="sell-mode-toggle">
                                <button className={newListing.mode === "immediate" ? "mode-btn active" : "mode-btn"} onClick={() => setNewListing({ ...newListing, mode: "immediate", endTime: "" })}>⚡ Achat direct</button>
                                <button className={newListing.mode === "auction" ? "mode-btn active" : "mode-btn"} onClick={() => setNewListing({ ...newListing, mode: "auction" })}>🔨 Enchère</button>
                            </div>
                        </div>
                        {newListing.mode === "auction" && (
                            <div className="sell-field">
                                <label>Date de fin de l'enchère</label>
                                <input type="datetime-local" value={newListing.endTime} onChange={e => setNewListing({ ...newListing, endTime: e.target.value })} />
                            </div>
                        )}
                        <button className="sell-submit-btn" onClick={handleSell}>Mettre en vente</button>
                    </div>
                </div>
            )}

            {loading ? (
                <p style={{ textAlign: "center", color: "#b08acb" }}>Chargement...</p>
            ) : filtered.length === 0 ? (
                <p style={{ textAlign: "center", color: "#b08acb" }}>Aucune carte trouvée.</p>
            ) : (
                <div className="cards-grid">
                    {filtered.map(listing => {
                        const isExpired = listing.mode === "auction" && listing.end_time && currentTime > listing.end_time;
                        const timeLeft = listing.end_time ? formatTimeLeft(listing.end_time) : null;
                        const highestBid = listing.bids?.length > 0 ? Math.max(...listing.bids.map(b => b.amount)) : null;
                        const isMine = user && listing.seller_id === user.id;

                        return (
                            <div key={listing.id} className={`card ${listing.mode === "auction" ? "card-auction" : ""}`}>
                                <div className={`card-badge ${listing.mode === "auction" ? "badge-auction" : "badge-immediate"}`}>
                                    {listing.mode === "auction" ? "🔨 Enchère" : "⚡ Direct"}
                                </div>
                                <img src={listing.card_image} alt={listing.card_name} />
                                <div className="card-info">
                                    <h3>{listing.card_name}</h3>
                                    <p className="card-extension">{listing.extension_name}</p>
                                    {listing.card_rarity && <p className="card-rarity">{listing.card_rarity}</p>}
                                    <p className="card-seller">Vendeur : {listing.seller_username}</p>
                                </div>
                                <div className="card-price-block">
                                    <span className="card-price">
                                        {highestBid ? `${highestBid} ${listing.currency}` : `${listing.price} ${listing.currency}`}
                                    </span>
                                    {highestBid && <span className="card-price-label">Meilleure offre</span>}
                                    {listing.mode === "auction" && listing.end_time && (
                                        <span className={`card-timer ${isExpired ? "timer-expired" : ""}`}>
                                            {isExpired ? "⏰ Terminée" : `⏱ ${timeLeft}`}
                                        </span>
                                    )}
                                </div>
                                <div className="card-actions">
                                    {listing.mode === "immediate" && !isMine && (
                                        <button className="btn-buy" onClick={() => handleAddToCart(listing)}>Ajouter au panier</button>
                                    )}
                                    {listing.mode === "auction" && !isMine && !isExpired && (
                                        <button className="btn-bid" onClick={() => openBidModal(listing)}>Enchérir</button>
                                    )}
                                    {isMine && (
                                        <button className="btn-delete" onClick={() => handleDelete(listing.id)}>Annuler la vente</button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {bidModal && (
                <div className="modal-overlay" onClick={() => setBidModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setBidModal(null)}>✕</button>
                        <img src={bidModal.card_image} alt={bidModal.card_name} className="modal-img" />
                        <h2>{bidModal.card_name}</h2>
                        <p className="modal-ext">{bidModal.extension_name}</p>
                        <div className="modal-bids-info">
                            <p>Prix de départ : <strong>{bidModal.price} {bidModal.currency}</strong></p>
                            {bidModal.bids?.length > 0 ? (
                                <p>Meilleure offre : <strong>{Math.max(...bidModal.bids.map(b => b.amount))} {bidModal.currency}</strong> par <em>{[...bidModal.bids].sort((a, b) => b.amount - a.amount)[0].bidder_username}</em></p>
                            ) : (
                                <p>Aucune offre pour l'instant</p>
                            )}
                            {bidModal.end_time && <p>Temps restant : <strong>{formatTimeLeft(bidModal.end_time)}</strong></p>}
                        </div>
                        {bidError && <p className="modal-error">{bidError}</p>}
                        {bidSuccess && <p className="modal-success">{bidSuccess}</p>}
                        <div className="modal-bid-row">
                            <input
                                type="number"
                                placeholder={`Min. ${bidModal.bids?.length > 0 ? Math.max(...bidModal.bids.map(b => b.amount)) + 0.01 : bidModal.price} ${bidModal.currency}`}
                                value={bidAmount}
                                onChange={e => setBidAmount(e.target.value)}
                            />
                            <button className="btn-bid" onClick={handleBid}>Confirmer</button>
                        </div>
                        {bidModal.bids?.length > 0 && (
                            <div className="modal-bid-history">
                                <h4>Historique des offres</h4>
                                {[...bidModal.bids].sort((a, b) => b.amount - a.amount).map((bid, i) => (
                                    <div key={bid.id} className={`bid-row ${i === 0 ? "bid-top" : ""}`}>
                                        <span>{bid.bidder_username}</span>
                                        <span>{bid.amount} {bidModal.currency}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
