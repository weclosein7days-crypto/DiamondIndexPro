/*
 * Diamond Index™ — Grader Dashboard
 * Shown only to users with role: "grader" | "admin"
 * Completely separate experience from the regular user Vault.
 *
 * Tabs: Overview | My Vault | Batch Grading | Labels | Earnings
 */

import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import LabelPreviewModal from "@/components/LabelPreviewModal";

// ─── Colors ───────────────────────────────────────────────────────────────────
const DARK = "#060d1e";
const GOLD = "#c9a84c";
const BLUE = "#3b82f6";
const SILVER = "#a0b4c8";

// ─── Nav items ────────────────────────────────────────────────────────────────
type Tab = "overview" | "vault" | "batch" | "labels" | "earnings";

const NAV_ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Dashboard", icon: "◈" },
  { id: "vault", label: "My Vault", icon: "◆" },
  { id: "batch", label: "Batch Grading", icon: "⊞" },
  { id: "labels", label: "Labels", icon: "⬡" },
  { id: "earnings", label: "Earnings", icon: "$" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function GraderDashboard() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Redirect if not a grader
  if (!loading && user && user.role !== "grader" && user.role !== "admin") {
    setLocation("/vault");
    return null;
  }

  if (!loading && !user) {
    setLocation("/");
    return null;
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: DARK, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: GOLD, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.2em", fontSize: "0.9rem" }}>
          LOADING GRADER DASHBOARD...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: DARK, display: "flex", fontFamily: "'Barlow', sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? "220px" : "64px",
        minHeight: "100vh",
        background: "rgba(255,255,255,0.03)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease",
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div
          onClick={() => setLocation("/")}
          style={{ padding: "1.5rem 1rem 1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.6rem" }}
        >
          <div style={{
            width: "32px", height: "32px", background: GOLD, borderRadius: "6px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1rem", color: DARK, flexShrink: 0,
          }}>
            DI
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "0.85rem", color: "#fff", letterSpacing: "0.05em" }}>
                DIAMOND INDEX™
              </div>
              <div style={{ fontSize: "0.6rem", color: GOLD, letterSpacing: "0.15em", fontWeight: 600 }}>
                GRADER PORTAL
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{ margin: "0 0.75rem 0.5rem", padding: "0.4rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "5px", color: SILVER, cursor: "pointer", fontSize: "0.75rem", textAlign: "center" }}
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0.5rem 0.5rem" }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.7rem 0.75rem", marginBottom: "0.2rem",
                background: activeTab === item.id ? "rgba(201,168,76,0.12)" : "transparent",
                border: activeTab === item.id ? "1px solid rgba(201,168,76,0.25)" : "1px solid transparent",
                borderRadius: "7px", cursor: "pointer", color: activeTab === item.id ? GOLD : SILVER,
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.82rem",
                letterSpacing: "0.05em", textTransform: "uppercase", transition: "all 0.15s",
                whiteSpace: "nowrap", overflow: "hidden",
              }}
            >
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom: Grade a Card + User */}
        <div style={{ padding: "0.75rem" }}>
          {/* Admin Panel link — only for admin role */}
          {user?.role === "admin" && (
            <button
              onClick={() => setLocation("/admin")}
              style={{
                width: "100%", padding: "0.55rem", background: "rgba(201,168,76,0.08)",
                color: GOLD, border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: "7px", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                marginBottom: "0.5rem",
              }}
            >
              <span>⚙</span>
              {sidebarOpen && <span>Admin Panel</span>}
            </button>
          )}

          <button
            onClick={() => setLocation("/grade")}
            style={{
              width: "100%", padding: "0.65rem", background: GOLD, color: DARK, border: "none",
              borderRadius: "7px", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800, fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
            }}
          >
            <span>◆</span>
            {sidebarOpen && <span>Grade a Card</span>}
          </button>

          <div style={{ marginTop: "0.75rem", padding: "0.6rem", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(201,168,76,0.2)", border: "1px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: GOLD, fontWeight: 700, flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() ?? "G"}
            </div>
            {sidebarOpen && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.72rem", color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.name ?? "Grader"}
                </div>
                <div style={{ fontSize: "0.6rem", color: GOLD, letterSpacing: "0.1em" }}>CERTIFIED GRADER</div>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={logout} style={{ background: "none", border: "none", color: SILVER, cursor: "pointer", fontSize: "0.7rem", padding: "0.2rem" }} title="Sign out">
                ⏻
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, minWidth: 0, padding: "2rem", overflowY: "auto" }}>
        {activeTab === "overview" && <OverviewTab user={user} />}
        {activeTab === "vault" && <VaultTab />}
        {activeTab === "batch" && <BatchTab />}
        {activeTab === "labels" && <LabelsTab />}
        {activeTab === "earnings" && <EarningsTab />}
      </main>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ user }: { user: { name?: string | null } | null }) {
  const { data: stats, isLoading } = trpc.grader.getStats.useQuery();
  const { data: cards } = trpc.grader.listCards.useQuery();

  const recentCards = cards?.slice(0, 5) ?? [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.8rem", color: "#fff", letterSpacing: "0.03em" }}>
          Welcome back, {user?.name?.split(" ")[0] ?? "Grader"}
        </div>
        <div style={{ color: SILVER, fontSize: "0.85rem", marginTop: "0.25rem" }}>
          Diamond Index™ Certified Grader Portal
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Cards Graded", value: isLoading ? "—" : String(stats?.total ?? 0), color: GOLD },
          { label: "Slabs Ordered", value: isLoading ? "—" : String(stats?.slabOrdered ?? 0), color: "#60a5fa" },
          { label: "Sent to Partner", value: isLoading ? "—" : String(stats?.sentToPartner ?? 0), color: "#34d399" },
          { label: "Est. Earnings", value: isLoading ? "—" : `$${stats?.estimatedEarnings ?? "0.00"}`, color: GOLD },
        ].map(stat => (
          <div key={stat.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "1.25rem" }}>
            <div style={{ fontSize: "0.7rem", color: SILVER, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "0.5rem" }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.8rem", color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Grade a Card", desc: "Start a new grading session", icon: "◆", color: GOLD, action: () => window.location.href = "/grade" },
          { label: "Print Labels", desc: "Print cert labels for graded cards", icon: "⬡", color: "#60a5fa", action: () => toast.info("Label printing coming soon") },
          { label: "Booth Mode", desc: "Quick-grade mode for live events", icon: "⊞", color: "#34d399", action: () => toast.info("Booth mode coming soon") },
        ].map(item => (
          <button
            key={item.label}
            onClick={item.action}
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: "10px", padding: "1.25rem", cursor: "pointer", textAlign: "left", transition: "border-color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = item.color + "44")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
          >
            <div style={{ fontSize: "1.4rem", marginBottom: "0.5rem", color: item.color }}>{item.icon}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#fff", marginBottom: "0.25rem" }}>{item.label}</div>
            <div style={{ fontSize: "0.72rem", color: SILVER }}>{item.desc}</div>
          </button>
        ))}
      </div>

      {/* Recent cards */}
      {recentCards.length > 0 && (
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.8rem", color: SILVER, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Recent Grades
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", overflow: "hidden" }}>
            {recentCards.map((card, i) => (
              <div key={card.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.85rem 1rem", borderBottom: i < recentCards.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ width: "36px", height: "36px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: GOLD, fontWeight: 700, flexShrink: 0 }}>
                  {card.diamondRating ?? "—"}◆
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.82rem", color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {[card.cardYear, card.cardName].filter(Boolean).join(" · ") || "Sports Card"}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: SILVER }}>
                    {card.certId ?? "No cert ID"} · {card.status?.replace(/_/g, " ").toUpperCase()}
                  </div>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1rem", color: GOLD }}>
                  {card.overallScore ? parseFloat(String(card.overallScore)).toFixed(1) : "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust line */}
      <div style={{ marginTop: "2rem", padding: "1rem", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "8px", fontSize: "0.75rem", color: SILVER, textAlign: "center" }}>
        All grades are backed by Diamond Index™ certification + verification system — QR codes, Cert IDs, and a permanent public record.
      </div>
    </div>
  );
}

// ─── Vault Tab (Grader View) ───────────────────────────────────────────────────
function VaultTab() {
  const { data: cards, isLoading } = trpc.grader.listCards.useQuery();
  const [selected, setSelected] = useState<number[]>([]);
  const batchUpdate = trpc.grader.batchUpdateStatus.useMutation({
    onSuccess: (data) => toast.success(`Updated ${data.updated} cards`),
    onError: () => toast.error("Batch update failed"),
  });

  const toggleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBatchStatus = (status: "in_vault" | "sent_to_partner" | "slab_ordered") => {
    if (selected.length === 0) return toast.info("Select cards first");
    batchUpdate.mutate({ ids: selected, status });
    setSelected([]);
  };

  if (isLoading) {
    return <div style={{ color: SILVER, padding: "2rem" }}>Loading vault...</div>;
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.4rem", color: "#fff" }}>
          My Vault — Grader View
        </div>
        {selected.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.75rem", color: GOLD, alignSelf: "center" }}>{selected.length} selected</span>
            {(["in_vault", "sent_to_partner", "slab_ordered"] as const).map(s => (
              <button key={s} onClick={() => handleBatchStatus(s)} style={{ padding: "0.4rem 0.8rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "5px", color: SILVER, cursor: "pointer", fontSize: "0.72rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}>
                → {s.replace(/_/g, " ").toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {!cards || cards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", color: SILVER }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>◆</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem" }}>No cards graded yet</div>
          <div style={{ fontSize: "0.8rem" }}>Grade your first card to populate your vault.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {cards.map(card => {
            const isSelected = selected.includes(card.id);
            return (
              <div
                key={card.id}
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${isSelected ? GOLD + "55" : "rgba(255,255,255,0.08)"}`, borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "border-color 0.15s" }}
                onClick={() => toggleSelect(card.id)}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <div style={{ width: "18px", height: "18px", border: `2px solid ${isSelected ? GOLD : "rgba(255,255,255,0.2)"}`, borderRadius: "3px", background: isSelected ? GOLD : "transparent", flexShrink: 0, marginTop: "2px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: DARK }}>
                    {isSelected && "✓"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#fff", marginBottom: "0.25rem" }}>
                      {[card.cardYear, card.cardName].filter(Boolean).join(" · ") || "Sports Card"}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: SILVER, marginBottom: "0.5rem" }}>
                      {card.certId ?? "No cert ID"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: GOLD }}>
                        {card.overallScore ? parseFloat(String(card.overallScore)).toFixed(1) : "—"}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: SILVER, background: "rgba(255,255,255,0.06)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                        {card.status?.replace(/_/g, " ").toUpperCase()}
                      </div>
                    </div>
                    {card.certId && (
                      <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.4rem" }}>
                        <a
                          href={`/verify/${card.certId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ fontSize: "0.65rem", color: "#60a5fa", textDecoration: "none" }}
                        >
                          Verify →
                        </a>
                        <button
                          onClick={e => { e.stopPropagation(); toast.info("Label printing coming soon"); }}
                          style={{ fontSize: "0.65rem", color: GOLD, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        >
                          Print Label
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Batch Grading Tab ────────────────────────────────────────────────────────
function BatchTab() {
  return (
    <div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.4rem", color: "#fff", marginBottom: "1.5rem" }}>
        Batch Grading
      </div>
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "3rem 2rem", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⊞</div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#fff", marginBottom: "0.5rem" }}>
          Batch Upload Coming Soon
        </div>
        <div style={{ fontSize: "0.82rem", color: SILVER, maxWidth: "400px", margin: "0 auto", lineHeight: 1.6 }}>
          Upload multiple card images at once for bulk grading. Ideal for booth events and large collections. Available in the next release.
        </div>
        <button
          onClick={() => window.location.href = "/grade"}
          style={{ marginTop: "1.5rem", padding: "0.75rem 2rem", background: GOLD, color: DARK, border: "none", borderRadius: "7px", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "0.85rem", letterSpacing: "0.1em" }}
        >
          GRADE ONE CARD NOW
        </button>
      </div>
    </div>
  );
}

// ─── Labels Tab ───────────────────────────────────────────────────────────────
function LabelsTab() {
  const { data: cards } = trpc.grader.listCards.useQuery();
  const certifiedCards = cards?.filter(c => c.certId) ?? [];
  const [selectedCertId, setSelectedCertId] = useState<string | null>(null);

  return (
    <div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.4rem", color: "#fff", marginBottom: "1.5rem" }}>
        Label Printing
      </div>

      {certifiedCards.length === 0 ? (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "3rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem", color: SILVER }}>⬡</div>
          <div style={{ color: SILVER, fontSize: "0.85rem" }}>No certified cards yet. Grade a card to generate a label.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
          {certifiedCards.map(card => (
            <div key={card.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "1rem" }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#fff", marginBottom: "0.25rem" }}>
                {[card.cardYear, card.cardName].filter(Boolean).join(" · ") || "Sports Card"}
              </div>
              <div style={{ fontSize: "0.68rem", color: SILVER, marginBottom: "0.75rem" }}>
                {card.certId} · Score: {card.overallScore ? parseFloat(String(card.overallScore)).toFixed(1) : "—"}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setSelectedCertId(card.certId!)}
                  style={{ flex: 1, padding: "0.5rem", background: GOLD, color: DARK, border: "none", borderRadius: "5px", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.05em" }}
                >
                  PRINT LABEL
                </button>
                <a
                  href={`/verify/${card.certId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: "0.5rem 0.75rem", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: "5px", color: "#60a5fa", textDecoration: "none", fontSize: "0.72rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                >
                  VERIFY
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Label Preview Modal */}
      <LabelPreviewModal
        certId={selectedCertId ?? undefined}
        open={!!selectedCertId}
        onClose={() => setSelectedCertId(null)}
      />
    </div>
  );
}

// ─── Earnings Tab ─────────────────────────────────────────────────────────────
function EarningsTab() {
  const { data: stats } = trpc.grader.getStats.useQuery();
  const { data: cards } = trpc.grader.listCards.useQuery();

  const tiers = [
    { range: "1–50 cards", rate: "$2.50 / card", color: SILVER },
    { range: "51–200 cards", rate: "$3.00 / card", color: "#60a5fa" },
    { range: "201–500 cards", rate: "$3.75 / card", color: GOLD },
    { range: "500+ cards", rate: "$4.50 / card", color: "#34d399" },
  ];

  const total = stats?.total ?? 0;
  const currentTierIdx = total >= 500 ? 3 : total >= 201 ? 2 : total >= 51 ? 1 : 0;

  return (
    <div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.4rem", color: "#fff", marginBottom: "1.5rem" }}>
        Earnings
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Cards Graded", value: String(total), color: GOLD },
          { label: "Est. Earnings", value: `$${stats?.estimatedEarnings ?? "0.00"}`, color: "#34d399" },
          { label: "Current Rate", value: tiers[currentTierIdx].rate.split(" / ")[0], color: "#60a5fa" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "1.25rem" }}>
            <div style={{ fontSize: "0.68rem", color: SILVER, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "0.4rem" }}>{s.label}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.6rem", color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Rate tiers */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", color: SILVER, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          Volume Rate Tiers
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
          {tiers.map((tier, i) => (
            <div key={tier.range} style={{ background: i === currentTierIdx ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${i === currentTierIdx ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: "8px", padding: "1rem" }}>
              {i === currentTierIdx && (
                <div style={{ fontSize: "0.6rem", color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
                  ◆ YOUR TIER
                </div>
              )}
              <div style={{ fontSize: "0.72rem", color: SILVER, marginBottom: "0.25rem" }}>{tier.range}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: tier.color }}>{tier.rate}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Real examples */}
      <div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", color: SILVER, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          Earnings Examples
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", overflow: "hidden" }}>
          {[
            { type: "Weekend Grader", cards: "40 cards/weekend", earn: "$100/weekend" },
            { type: "Active Dealer", cards: "150 cards/month", earn: "$450/month" },
            { type: "Grading Operation", cards: "600 cards/month", earn: "$2,700/month" },
          ].map((ex, i, arr) => (
            <div key={ex.type} style={{ display: "flex", alignItems: "center", padding: "0.9rem 1.25rem", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.82rem", color: "#fff", fontWeight: 600 }}>{ex.type}</div>
                <div style={{ fontSize: "0.68rem", color: SILVER }}>{ex.cards}</div>
              </div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1rem", color: GOLD }}>{ex.earn}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
