import { useState } from "react";
import Sidebar from "./components/Sidebar";
import SalesForm from "./components/SalesForm";
import TransactionsTable from "./components/TransactionsTable";

const C = {
  maroonDark:  "#1C0606",
  maroonMid:   "#6B1C1C",
  maroonBtn:   "#8B2525",
  maroonLight: "#B03A3A",
  cream:       "#FAF8F5",
  creamCard:   "#FFFFFF",
  creamBorder: "#EDE8E1",
  creamDim:    "#F5F2EE",
  textDark:    "#1C0606",
  textMid:     "#4A3030",
  textLight:   "#8C7A7A",
  success:     "#1A6B2A",
  successBg:   "#E6F4EA",
  warning:     "#7A5200",
  warningBg:   "#FEF3D7",
  error:       "#B00020",
  errorBg:     "#FDECEA",
  gold:        "#C9A84C",
};

const font = "'Georgia', 'Times New Roman', serif";
const fontSans = "'Trebuchet MS', 'Segoe UI', sans-serif";

function genId(len) {
  return `TXN-2026-${String(len + 1).padStart(3, "0")}`;
}

function now() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function StatCard({ label, value, sub, icon }) {
  return (
    <div style={{
      backgroundColor: C.creamCard,
      borderRadius: 14,
      padding: "22px 24px",
      boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
      border: `1px solid ${C.creamBorder}`,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      transition: "box-shadow 0.2s, transform 0.2s",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${C.maroonDark}, ${C.maroonBtn})`,
        borderRadius: "14px 14px 0 0",
      }} />

      {/* Label + icon row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontSize: "0.68rem", color: C.textLight, fontFamily: fontSans,
          textTransform: "uppercase", letterSpacing: 1.5, fontWeight: "600",
        }}>{label}</span>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: `linear-gradient(135deg, ${C.maroonMid}, ${C.maroonBtn})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, boxShadow: `0 3px 10px rgba(139,37,37,0.28)`,
        }}>{icon}</div>
      </div>

      {/* Big readable number */}
      <div>
        <div style={{
          fontSize: "clamp(1.55rem, 3vw, 1.9rem)",
          fontWeight: "700",
          color: C.textDark,
          fontFamily: font,
          lineHeight: 1,
          letterSpacing: "-0.5px",
        }}>{value}</div>
        {sub && (
          <div style={{
            fontSize: "0.72rem", color: C.textLight,
            fontFamily: fontSans, marginTop: 6,
          }}>{sub}</div>
        )}
      </div>
    </div>
  );
}

function Toast({ msg, type }) {
  if (!msg) return null;
  const styles = {
    success: { bg: C.successBg, color: C.success, border: "#2E8B4730" },
    warning: { bg: C.warningBg, color: C.warning, border: "#D4A01730" },
    error:   { bg: C.errorBg,   color: C.error,   border: "#C0392B30" },
  };
  const s = styles[type] || styles.success;
  const icons = { success: "✓", warning: "⚠", error: "✕" };
  return (
    <div style={{
      padding: "12px 18px", borderRadius: 9, marginBottom: 20,
      backgroundColor: s.bg, color: s.color,
      fontFamily: fontSans, fontWeight: "600", fontSize: "0.875rem",
      display: "flex", alignItems: "center", gap: 10,
      border: `1px solid ${s.border}`,
      animation: "slideDown 0.3s ease",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    }}>
      <span style={{ fontSize: "1rem", flexShrink: 0 }}>{icons[type] || "✓"}</span>
      {msg}
    </div>
  );
}

// SVG stat card icons
const StatIcons = {
  revenue: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v20M8 7h6a3 3 0 0 1 0 6H8m0 2h7" />
    </svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

export default function SalesManagementApp() {
  const [transactions, setTransactions] = useState([]);
  const [editingTxn,   setEditingTxn]   = useState(null);
  const [toast,        setToast]        = useState({ msg: "", type: "success" });
  const [activeNav,    setActiveNav]    = useState("sales");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 4000);
  };

  const handleSave = (data) => {
    if (editingTxn) {
      setTransactions(prev => prev.map(t =>
        t.id === editingTxn.id ? { ...t, ...data, timestamp: now() } : t
      ));
      setEditingTxn(null);
      showToast(`Transaction ${editingTxn.id} updated successfully.`, "success");
    } else {
      const newTxn = { id: genId(transactions.length), ...data, timestamp: now() };
      setTransactions(prev => [newTxn, ...prev]);
      showToast(`Transaction ${newTxn.id} saved and recorded.`, "success");
    }
  };

  const handleDelete = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (editingTxn?.id === id) setEditingTxn(null);
    showToast(`Transaction ${id} removed.`, "warning");
  };

  const totalRevenue    = transactions.reduce((s, t) => s + t.total, 0);
  const completedCount  = transactions.filter(t => t.status === "Completed").length;
  const pendingCount    = transactions.filter(t => t.status === "Pending").length;

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      width: "100%",
      backgroundColor: C.cream,
      fontFamily: fontSans,
    }}>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        input:focus, select:focus {
          border-color: ${C.maroonBtn} !important;
          box-shadow: 0 0 0 3px rgba(139,37,37,0.1);
        }
        button:hover { opacity: 0.85; }
        .stat-card:hover {
          box-shadow: 0 4px 18px rgba(0,0,0,0.11) !important;
          transform: translateY(-1px);
        }
        .stat-card { transition: box-shadow 0.2s, transform 0.2s; }

        /* Main responsive layout */
        .main-content {
          flex: 1;
          padding: 36px 40px;
          overflow-y: auto;
          min-width: 0;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        .form-table-grid {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 26px;
          align-items: start;
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 900px) {
          .form-table-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .main-content {
            padding: 80px 18px 28px !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Sidebar active={activeNav} onNav={setActiveNav} />

      <main className="main-content">
        {/* Header */}
        <header style={{ marginBottom: 28 }}>
          <div style={{
            display: "flex", alignItems: "flex-start",
            justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: "clamp(1.3rem, 2.5vw, 1.75rem)",
                fontFamily: font, color: C.textDark, fontWeight: "bold",
                letterSpacing: "-0.3px", lineHeight: 1.2,
              }}>
                Sales Transactions Control
              </h1>
              <p style={{
                margin: "5px 0 0", color: C.textLight,
                fontSize: "0.8rem", letterSpacing: 0.3, fontFamily: fontSans,
              }}>
                Otto Shoes — CutWise Inventory Management System
              </p>
            </div>
            <div style={{
              padding: "7px 16px", borderRadius: 20,
              background: C.creamCard,
              border: `1px solid ${C.creamBorder}`,
              fontSize: "0.78rem", color: C.textMid,
              fontFamily: fontSans, whiteSpace: "nowrap",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}>
              {new Date().toLocaleDateString("en-PH", { dateStyle: "long" })}
            </div>
          </div>
        </header>

        {/* Stat Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <StatCard
              label="Total Revenue"
              value={`₱ ${totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              sub={`${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}`}
              icon={StatIcons.revenue}
            />
          </div>
          <div className="stat-card">
            <StatCard
              label="Completed Sales"
              value={completedCount}
              sub="successfully recorded"
              icon={StatIcons.check}
            />
          </div>
          <div className="stat-card">
            <StatCard
              label="Pending Orders"
              value={pendingCount}
              sub="awaiting confirmation"
              icon={StatIcons.clock}
            />
          </div>
        </div>

        <Toast msg={toast.msg} type={toast.type} />

        <div className="form-table-grid">
          <SalesForm
            onSave={handleSave}
            editingTxn={editingTxn}
            onCancelEdit={() => setEditingTxn(null)}
          />
          <TransactionsTable
            transactions={transactions}
            onEdit={setEditingTxn}
            onDelete={handleDelete}
          />
        </div>
      </main>
    </div>
  );
}