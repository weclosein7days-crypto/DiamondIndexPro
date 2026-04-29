/**
 * Admin Control Panel — Diamond Index™
 * God-mode access: all cards, users, affiliates, leads.
 * Admin role required. Dark navy theme matching the platform.
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

const DARK = "#060d1e";
const NAVY = "#0d1829";
const BLUE = "#1a3a6b";
const GOLD = "#c9a84c";
const SILVER = "rgba(160,180,200,0.7)";

const TIER_COLORS: Record<string, string> = {
  PRISTINE: "#f0d060",
  ELITE: "#c9a84c",
  SUPERIOR: "#7eb8f7",
  PREMIUM: "#a0b4c8",
  STANDARD: "#6b7f94",
};

type Tab = "cards" | "users" | "affiliates" | "leads";

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: NAVY, border: `1px solid rgba(201,168,76,0.3)`, borderRadius: 12, padding: "2rem", maxWidth: 400, width: "90%" }}>
        <div style={{ color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: "0.95rem", marginBottom: "1.5rem" }}>{message}</div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={onConfirm} style={{ flex: 1, padding: "0.75rem", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.08em" }}>DELETE</button>
          <button onClick={onCancel} style={{ flex: 1, padding: "0.75rem", background: "rgba(255,255,255,0.08)", color: SILVER, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem" }}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}

// ─── Cards Tab ────────────────────────────────────────────────────────────────
function CardsTab() {
  const { data: cards = [], refetch } = trpc.admin.listAllCards.useQuery();
  const updateCard = trpc.admin.updateCard.useMutation({ onSuccess: () => refetch() });
  const deleteCard = trpc.admin.deleteCard.useMutation({ onSuccess: () => refetch() });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingCard, setEditingCard] = useState<typeof cards[0] | null>(null);
  const [editForm, setEditForm] = useState({ overallScore: "", gradeTier: "", diamondRating: 0, status: "", adminOverrideNote: "" });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const PAGE_SIZE = 8;
  const filtered = cards.filter(c =>
    [c.cardName, c.cardSet, c.cardYear, c.certId].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openEdit(card: typeof cards[0]) {
    setEditingCard(card);
    setEditForm({
      overallScore: card.overallScore ?? "",
      gradeTier: card.gradeTier ?? "",
      diamondRating: card.diamondRating ?? 3,
      status: card.status ?? "in_vault",
      adminOverrideNote: card.adminOverrideNote ?? "",
    });
  }

  function saveEdit() {
    if (!editingCard) return;
    if (!editForm.adminOverrideNote.trim()) {
      alert("Override note is required.");
      return;
    }
    updateCard.mutate({
      cardId: editingCard.id,
      overallScore: editForm.overallScore,
      gradeTier: editForm.gradeTier,
      diamondRating: editForm.diamondRating,
      status: editForm.status as "in_vault" | "sent_to_partner" | "slab_ordered",
      adminOverrideNote: editForm.adminOverrideNote,
    });
    setEditingCard(null);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name, set, year, cert ID..."
          style={{ flex: 1, padding: "0.6rem 1rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem", outline: "none" }}
        />
        <span style={{ color: SILVER, fontSize: "0.8rem", whiteSpace: "nowrap" }}>{filtered.length} cards</span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
              {["ID", "Card", "Score", "Tier", "◆", "Status", "Cert ID", "User ID", "Date", "Actions"].map(h => (
                <th key={h} style={{ padding: "0.6rem 0.75rem", textAlign: "left", color: SILVER, fontWeight: 600, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map(card => {
              const tier = card.gradeTier ?? "—";
              const tierColor = TIER_COLORS[tier] ?? "#a0b4c8";
              return (
                <tr key={card.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "0.6rem 0.75rem", color: "rgba(160,180,200,0.5)" }}>{card.id}</td>
                  <td style={{ padding: "0.6rem 0.75rem", color: "#fff", maxWidth: 180 }}>
                    <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.cardName ?? "—"}</div>
                    <div style={{ color: SILVER, fontSize: "0.72rem" }}>{[card.cardYear, card.cardSet].filter(Boolean).join(" · ") || "—"}</div>
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem", color: "#fff", fontWeight: 700 }}>{card.overallScore ? parseFloat(card.overallScore).toFixed(1) : "—"}</td>
                  <td style={{ padding: "0.6rem 0.75rem", color: tierColor, fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.08em" }}>{tier}</td>
                  <td style={{ padding: "0.6rem 0.75rem", color: GOLD }}>{card.diamondRating ?? "—"}</td>
                  <td style={{ padding: "0.6rem 0.75rem" }}>
                    <span style={{ padding: "0.2rem 0.5rem", borderRadius: 4, fontSize: "0.7rem", background: card.status === "slab_ordered" ? "rgba(74,222,128,0.15)" : card.status === "sent_to_partner" ? "rgba(96,165,250,0.15)" : "rgba(201,168,76,0.12)", color: card.status === "slab_ordered" ? "#4ade80" : card.status === "sent_to_partner" ? "#60a5fa" : GOLD }}>
                      {card.status?.replace(/_/g, " ") ?? "—"}
                    </span>
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem", color: SILVER, fontSize: "0.72rem" }}>{card.certId ?? "—"}</td>
                  <td style={{ padding: "0.6rem 0.75rem", color: SILVER }}>{card.userId}</td>
                  <td style={{ padding: "0.6rem 0.75rem", color: SILVER, fontSize: "0.72rem", whiteSpace: "nowrap" }}>{new Date(card.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "0.6rem 0.75rem" }}>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button onClick={() => openEdit(card)} style={{ padding: "0.3rem 0.7rem", background: "rgba(96,165,250,0.15)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.25)", borderRadius: 4, cursor: "pointer", fontSize: "0.72rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>EDIT</button>
                      <button onClick={() => setConfirmDelete(card.id)} style={{ padding: "0.3rem 0.7rem", background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 4, cursor: "pointer", fontSize: "0.72rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>DEL</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paged.length === 0 && (
              <tr><td colSpan={10} style={{ padding: "2rem", textAlign: "center", color: SILVER }}>No cards found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", marginTop: "1rem" }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ width: 32, height: 32, borderRadius: 4, border: "1px solid rgba(255,255,255,0.12)", background: p === page ? GOLD : "transparent", color: p === page ? DARK : SILVER, cursor: "pointer", fontSize: "0.8rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>{p}</button>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingCard && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: NAVY, border: `1px solid rgba(201,168,76,0.25)`, borderRadius: 12, padding: "2rem", maxWidth: 480, width: "100%" }}>
            <div style={{ color: GOLD, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Override Grade</div>
            <div style={{ color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.2rem", marginBottom: "1.5rem" }}>
              {editingCard.cardName ?? "Card"} #{editingCard.id}
            </div>

            {[
              { label: "Overall Score (0–100)", key: "overallScore", type: "text" },
              { label: "Grade Tier (PRISTINE / ELITE / SUPERIOR / PREMIUM / STANDARD)", key: "gradeTier", type: "text" },
              { label: "Diamond Rating (1–5)", key: "diamondRating", type: "number" },
            ].map(({ label, key, type }) => (
              <div key={key} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", color: SILVER, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.35rem", fontFamily: "'Barlow', sans-serif" }}>{label}</label>
                <input
                  type={type}
                  value={(editForm as Record<string, string | number>)[key]}
                  onChange={e => setEditForm(f => ({ ...f, [key]: type === "number" ? parseInt(e.target.value) || 0 : e.target.value }))}
                  style={{ width: "100%", padding: "0.6rem 0.75rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: SILVER, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.35rem", fontFamily: "'Barlow', sans-serif" }}>Status</label>
              <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} style={{ width: "100%", padding: "0.6rem 0.75rem", background: NAVY, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem", outline: "none" }}>
                <option value="in_vault">In Vault</option>
                <option value="sent_to_partner">Sent to Partner</option>
                <option value="slab_ordered">Slab Ordered</option>
              </select>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", color: SILVER, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.35rem", fontFamily: "'Barlow', sans-serif" }}>Override Note (required)</label>
              <textarea
                value={editForm.adminOverrideNote}
                onChange={e => setEditForm(f => ({ ...f, adminOverrideNote: e.target.value }))}
                rows={3}
                placeholder="Reason for override..."
                style={{ width: "100%", padding: "0.6rem 0.75rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem", outline: "none", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={saveEdit} disabled={updateCard.isPending} style={{ flex: 1, padding: "0.875rem", background: GOLD, color: DARK, border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em" }}>
                {updateCard.isPending ? "SAVING..." : "SAVE OVERRIDE"}
              </button>
              <button onClick={() => setEditingCard(null)} style={{ flex: 1, padding: "0.875rem", background: "rgba(255,255,255,0.06)", color: SILVER, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem" }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete !== null && (
        <ConfirmDialog
          message={`Delete card #${confirmDelete}? This cannot be undone.`}
          onConfirm={() => { deleteCard.mutate({ cardId: confirmDelete }); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const { data: users = [], refetch } = trpc.admin.listUsers.useQuery();
  const { data: affiliates = [] } = trpc.admin.listAffiliates.useQuery();
  const updateUser = trpc.admin.updateUser.useMutation({ onSuccess: () => refetch() });
  const deleteUser = trpc.admin.deleteUser.useMutation({ onSuccess: () => refetch() });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const PAGE_SIZE = 8;
  const filtered = users.filter(u =>
    [u.name, u.email].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const ROLE_COLORS: Record<string, string> = { admin: "#f0d060", grader: "#7eb8f7", user: SILVER };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          style={{ flex: 1, padding: "0.6rem 1rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem", outline: "none" }}
        />
        <span style={{ color: SILVER, fontSize: "0.8rem", whiteSpace: "nowrap" }}>{filtered.length} users</span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["ID", "Name", "Email", "Role", "Affiliate", "Joined", "Actions"].map(h => (
                <th key={h} style={{ padding: "0.6rem 0.75rem", textAlign: "left", color: SILVER, fontWeight: 600, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map(user => (
              <tr key={user.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "0.6rem 0.75rem", color: "rgba(160,180,200,0.5)" }}>{user.id}</td>
                <td style={{ padding: "0.6rem 0.75rem", color: "#fff", fontWeight: 600 }}>{user.name ?? "—"}</td>
                <td style={{ padding: "0.6rem 0.75rem", color: SILVER }}>{user.email ?? "—"}</td>
                <td style={{ padding: "0.6rem 0.75rem" }}>
                  <select
                    value={user.role}
                    onChange={e => updateUser.mutate({ userId: user.id, role: e.target.value as "user" | "admin" | "grader" })}
                    style={{ padding: "0.25rem 0.5rem", background: NAVY, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, color: ROLE_COLORS[user.role] ?? SILVER, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", outline: "none" }}
                  >
                    <option value="user">USER</option>
                    <option value="grader">GRADER</option>
                    <option value="admin">ADMIN</option>
                  </select>
                </td>
                <td style={{ padding: "0.6rem 0.75rem" }}>
                  <select
                    value={user.affiliateId ?? ""}
                    onChange={e => updateUser.mutate({ userId: user.id, affiliateId: e.target.value ? parseInt(e.target.value) : null })}
                    style={{ padding: "0.25rem 0.5rem", background: NAVY, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, color: SILVER, fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", cursor: "pointer", outline: "none", maxWidth: 140 }}
                  >
                    <option value="">None</option>
                    {affiliates.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </td>
                <td style={{ padding: "0.6rem 0.75rem", color: SILVER, fontSize: "0.72rem", whiteSpace: "nowrap" }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: "0.6rem 0.75rem" }}>
                  <button onClick={() => setConfirmDelete(user.id)} style={{ padding: "0.3rem 0.7rem", background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 4, cursor: "pointer", fontSize: "0.72rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>DEL</button>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: SILVER }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", marginTop: "1rem" }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ width: 32, height: 32, borderRadius: 4, border: "1px solid rgba(255,255,255,0.12)", background: p === page ? GOLD : "transparent", color: p === page ? DARK : SILVER, cursor: "pointer", fontSize: "0.8rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>{p}</button>
          ))}
        </div>
      )}

      {confirmDelete !== null && (
        <ConfirmDialog
          message={`Delete user #${confirmDelete}? This cannot be undone.`}
          onConfirm={() => { deleteUser.mutate({ userId: confirmDelete }); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ─── Affiliates Tab ───────────────────────────────────────────────────────────
function AffiliatesTab() {
  const { data: affiliates = [], refetch } = trpc.admin.listAffiliates.useQuery();
  const createAffiliate = trpc.admin.createAffiliate.useMutation({ onSuccess: () => { refetch(); setShowCreate(false); setNewForm({ name: "", code: "" }); } });
  const deleteAffiliate = trpc.admin.deleteAffiliate.useMutation({ onSuccess: () => refetch() });

  const [showCreate, setShowCreate] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", code: "" });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <span style={{ color: SILVER, fontSize: "0.8rem" }}>{affiliates.length} affiliates</span>
        <button onClick={() => setShowCreate(true)} style={{ padding: "0.5rem 1.25rem", background: GOLD, color: DARK, border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.08em" }}>+ ADD AFFILIATE</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        {affiliates.map(a => (
          <div key={a.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div>
                <div style={{ color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.05rem" }}>{a.name}</div>
                <div style={{ color: GOLD, fontFamily: "'Barlow', sans-serif", fontSize: "0.75rem", marginTop: "0.2rem" }}>Code: {a.code}</div>
              </div>
              <button onClick={() => setConfirmDelete(a.id)} style={{ padding: "0.25rem 0.6rem", background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 4, cursor: "pointer", fontSize: "0.7rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>DEL</button>
            </div>
            <div style={{ color: SILVER, fontSize: "0.72rem" }}>ID: {a.id} · Created {new Date(a.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
        {affiliates.length === 0 && (
          <div style={{ color: SILVER, padding: "2rem", textAlign: "center", gridColumn: "1/-1" }}>No affiliates yet. Add your key people above.</div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: NAVY, border: `1px solid rgba(201,168,76,0.25)`, borderRadius: 12, padding: "2rem", maxWidth: 400, width: "100%" }}>
            <div style={{ color: GOLD, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1.25rem" }}>New Affiliate</div>
            {[
              { label: "Full Name", key: "name", placeholder: "e.g. John Smith" },
              { label: "Affiliate Code", key: "code", placeholder: "e.g. JOHN2026" },
            ].map(({ label, key, placeholder }) => (
              <div key={key} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", color: SILVER, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.35rem", fontFamily: "'Barlow', sans-serif" }}>{label}</label>
                <input
                  value={(newForm as Record<string, string>)[key]}
                  onChange={e => setNewForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={{ width: "100%", padding: "0.6rem 0.75rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button onClick={() => createAffiliate.mutate(newForm)} disabled={!newForm.name || !newForm.code || createAffiliate.isPending} style={{ flex: 1, padding: "0.875rem", background: GOLD, color: DARK, border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em" }}>
                {createAffiliate.isPending ? "CREATING..." : "CREATE"}
              </button>
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "0.875rem", background: "rgba(255,255,255,0.06)", color: SILVER, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem" }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete !== null && (
        <ConfirmDialog
          message={`Delete affiliate #${confirmDelete}? This cannot be undone.`}
          onConfirm={() => { deleteAffiliate.mutate({ affiliateId: confirmDelete }); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ─── Leads Tab ────────────────────────────────────────────────────────────────
function LeadsTab() {
  const { data: leads = [], refetch } = trpc.admin.listLeads.useQuery();
  const { data: affiliates = [] } = trpc.admin.listAffiliates.useQuery();
  const updateLead = trpc.admin.updateLead.useMutation({ onSuccess: () => refetch() });
  const deleteLead = trpc.admin.deleteLead.useMutation({ onSuccess: () => refetch() });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [notesModal, setNotesModal] = useState<{ id: number; notes: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const PAGE_SIZE = 8;
  const filtered = leads.filter(l =>
    [l.name, l.email, l.company].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const STATUS_COLORS: Record<string, string> = { new: "#60a5fa", contacted: "#f0d060", qualified: "#4ade80", closed: SILVER };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name, email, company..."
          style={{ flex: 1, padding: "0.6rem 1rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem", outline: "none" }}
        />
        <span style={{ color: SILVER, fontSize: "0.8rem", whiteSpace: "nowrap" }}>{filtered.length} leads</span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["Name", "Email", "Company", "Interest", "Status", "Affiliate", "Notes", "Date", "Actions"].map(h => (
                <th key={h} style={{ padding: "0.6rem 0.75rem", textAlign: "left", color: SILVER, fontWeight: 600, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map(lead => (
              <tr key={lead.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "0.6rem 0.75rem", color: "#fff", fontWeight: 600 }}>{lead.name}</td>
                <td style={{ padding: "0.6rem 0.75rem", color: SILVER }}>{lead.email}</td>
                <td style={{ padding: "0.6rem 0.75rem", color: SILVER }}>{lead.company ?? "—"}</td>
                <td style={{ padding: "0.6rem 0.75rem", color: SILVER, fontSize: "0.72rem" }}>{lead.interest?.replace(/_/g, " ") ?? "—"}</td>
                <td style={{ padding: "0.6rem 0.75rem" }}>
                  <select
                    value={lead.status ?? "new"}
                    onChange={e => updateLead.mutate({ leadId: lead.id, status: e.target.value as "new" | "contacted" | "qualified" | "closed" })}
                    style={{ padding: "0.25rem 0.5rem", background: NAVY, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, color: STATUS_COLORS[lead.status ?? "new"] ?? SILVER, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", outline: "none" }}
                  >
                    <option value="new">NEW</option>
                    <option value="contacted">CONTACTED</option>
                    <option value="qualified">QUALIFIED</option>
                    <option value="closed">CLOSED</option>
                  </select>
                </td>
                <td style={{ padding: "0.6rem 0.75rem" }}>
                  <select
                    value={lead.assignedAffiliateId ?? ""}
                    onChange={e => updateLead.mutate({ leadId: lead.id, assignedAffiliateId: e.target.value ? parseInt(e.target.value) : null })}
                    style={{ padding: "0.25rem 0.5rem", background: NAVY, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, color: SILVER, fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", cursor: "pointer", outline: "none", maxWidth: 130 }}
                  >
                    <option value="">None</option>
                    {affiliates.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </td>
                <td style={{ padding: "0.6rem 0.75rem" }}>
                  <button onClick={() => setNotesModal({ id: lead.id, notes: lead.notes ?? "" })} style={{ padding: "0.25rem 0.6rem", background: "rgba(255,255,255,0.06)", color: SILVER, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, cursor: "pointer", fontSize: "0.7rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
                    {lead.notes ? "VIEW" : "ADD"}
                  </button>
                </td>
                <td style={{ padding: "0.6rem 0.75rem", color: SILVER, fontSize: "0.72rem", whiteSpace: "nowrap" }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: "0.6rem 0.75rem" }}>
                  <button onClick={() => setConfirmDelete(lead.id)} style={{ padding: "0.3rem 0.7rem", background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 4, cursor: "pointer", fontSize: "0.72rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>DEL</button>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={9} style={{ padding: "2rem", textAlign: "center", color: SILVER }}>No leads found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", marginTop: "1rem" }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ width: 32, height: 32, borderRadius: 4, border: "1px solid rgba(255,255,255,0.12)", background: p === page ? GOLD : "transparent", color: p === page ? DARK : SILVER, cursor: "pointer", fontSize: "0.8rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>{p}</button>
          ))}
        </div>
      )}

      {/* Notes Modal */}
      {notesModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: NAVY, border: `1px solid rgba(201,168,76,0.25)`, borderRadius: 12, padding: "2rem", maxWidth: 420, width: "100%" }}>
            <div style={{ color: GOLD, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1rem" }}>Lead Notes</div>
            <textarea
              value={notesModal.notes}
              onChange={e => setNotesModal(n => n ? { ...n, notes: e.target.value } : null)}
              rows={6}
              placeholder="Add notes about this lead..."
              style={{ width: "100%", padding: "0.75rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "#fff", fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem", outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: "1.25rem" }}
            />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => { updateLead.mutate({ leadId: notesModal.id, notes: notesModal.notes }); setNotesModal(null); }} style={{ flex: 1, padding: "0.875rem", background: GOLD, color: DARK, border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem" }}>SAVE</button>
              <button onClick={() => setNotesModal(null)} style={{ flex: 1, padding: "0.875rem", background: "rgba(255,255,255,0.06)", color: SILVER, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem" }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete !== null && (
        <ConfirmDialog
          message={`Delete lead #${confirmDelete}? This cannot be undone.`}
          onConfirm={() => { deleteLead.mutate({ leadId: confirmDelete }); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
export default function AdminPanel() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("cards");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Redirect non-admins — must be in useEffect, not render phase
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      setLocation("/");
    }
  }, [loading, user, setLocation]);

  if (!loading && (!user || user.role !== "admin")) return null;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: DARK, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: SILVER, fontFamily: "'Barlow', sans-serif" }}>Loading...</div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "cards", label: "All Cards", icon: "◆" },
    { id: "users", label: "Users", icon: "👤" },
    { id: "affiliates", label: "Affiliates", icon: "🔗" },
    { id: "leads", label: "Leads", icon: "📋" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: DARK, display: "flex", fontFamily: "'Barlow', sans-serif" }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarCollapsed ? 60 : 220,
        background: NAVY,
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s ease",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
      }}>
        {/* Logo area */}
        <div style={{ padding: sidebarCollapsed ? "1.25rem 0" : "1.25rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: sidebarCollapsed ? "center" : "space-between" }}>
          {!sidebarCollapsed && (
            <div>
              <div style={{ color: GOLD, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.85rem", letterSpacing: "0.15em" }}>DIAMOND INDEX™</div>
              <div style={{ color: SILVER, fontSize: "0.65rem", letterSpacing: "0.12em", marginTop: "0.15rem" }}>ADMIN CONTROL</div>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(c => !c)} style={{ background: "none", border: "none", color: SILVER, cursor: "pointer", fontSize: "1rem", padding: "0.25rem" }}>
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0.75rem 0" }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: sidebarCollapsed ? "0.875rem 0" : "0.875rem 1.25rem",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                background: activeTab === tab.id ? "rgba(201,168,76,0.1)" : "transparent",
                border: "none",
                borderLeft: activeTab === tab.id ? `2px solid ${GOLD}` : "2px solid transparent",
                color: activeTab === tab.id ? GOLD : SILVER,
                cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.82rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>{tab.icon}</span>
              {!sidebarCollapsed && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* Back to dashboard */}
        <div style={{ padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => setLocation("/grader-dashboard")}
            style={{
              width: "100%",
              padding: sidebarCollapsed ? "0.6rem 0" : "0.6rem 1rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6,
              color: SILVER,
              cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            {sidebarCollapsed ? "←" : "← Dashboard"}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ padding: "1.25rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", background: NAVY }}>
          <div>
            <div style={{ color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.3rem" }}>
              {TABS.find(t => t.id === activeTab)?.label}
            </div>
            <div style={{ color: SILVER, fontSize: "0.72rem", marginTop: "0.15rem" }}>Diamond Index™ Admin Control Panel</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
            <span style={{ color: SILVER, fontSize: "0.78rem" }}>{user?.name ?? user?.email ?? "Admin"}</span>
          </div>
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
          {activeTab === "cards" && <CardsTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "affiliates" && <AffiliatesTab />}
          {activeTab === "leads" && <LeadsTab />}
        </div>
      </div>
    </div>
  );
}
