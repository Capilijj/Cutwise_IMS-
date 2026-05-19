import { useState } from "react";

const C = {
  maroonDark:  "#1C0606",
  maroonMid:   "#6B1C1C",
  creamCard:   "#FFFFFF",
  creamBorder: "#EDE8E1",
  creamDim:    "#F5F2EE",
  textDark:    "#1C0606",
  textMid:     "#4A3030",
  textLight:   "#8C7A7A",
  error:       "#B00020",
  errorBg:     "#FDECEA",
};

const font = "'Georgia', 'Times New Roman', serif";
const fontSans = "'Trebuchet MS', 'Segoe UI', sans-serif";

function Badge({ status }) {
  const map = {
    Completed: { bg: "#E6F4EA", color: "#1A6B2A", dot: "#2E8B47" },
    Pending:   { bg: "#FEF3D7", color: "#7A5200", dot: "#D4A017" },
    Cancelled: { bg: "#FDECEA", color: "#8B1A1A", dot: "#C0392B" },
  };
  const s = map[status] || map.Completed;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: "0.72rem", fontFamily: fontSans, fontWeight: "600",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

export default function TransactionsTable({ transactions, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("timestamp");
  const [sortDir, setSortDir] = useState("desc");

  const filtered = transactions
    .filter(t =>
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.customer.toLowerCase().includes(search.toLowerCase()) ||
      t.itemType.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === "timestamp") {
        va = new Date(va);
        vb = new Date(vb);
      } else if (typeof va === "string") {
        va = va.toLowerCase();
        vb = vb.toLowerCase();
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const thStyle = (field) => ({
    padding: "11px 10px", textAlign: "left",
    fontSize: "0.72rem", fontFamily: fontSans, fontWeight: "700",
    color: C.textLight, textTransform: "uppercase", letterSpacing: 0.8,
    borderBottom: `2px solid ${C.creamBorder}`, cursor: "pointer",
    userSelect: "none", whiteSpace: "nowrap",
    color: sortField === field ? C.maroonMid : C.textLight,
  });

  const sortArrow = (field) => sortField === field ? (sortDir === "asc" ? "^" : "v") : "";

  return (
    <section style={{
      backgroundColor: C.creamCard, borderRadius: 12,
      boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: `1px solid ${C.creamBorder}`,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "18px 22px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
        borderBottom: `1px solid ${C.creamBorder}`,
        flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.05rem", color: C.maroonMid, fontFamily: font, fontWeight: "bold" }}>
            Past Transactions Ledger
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: C.textLight, fontFamily: fontSans }}>
            {filtered.length} record{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <input
          type="text"
          placeholder="Search ID, customer, or material..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: "8px 14px", borderRadius: 8,
            border: `1px solid ${C.creamBorder}`, fontSize: "0.83rem",
            fontFamily: fontSans, width: 260, outline: "none",
            backgroundColor: C.creamDim,
          }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: C.creamDim }}>
              <th style={thStyle("id")}        onClick={() => handleSort("id")}>        Txn ID{sortArrow("id")}</th>
              <th style={thStyle("customer")}   onClick={() => handleSort("customer")}>  Customer{sortArrow("customer")}</th>
              <th style={thStyle("itemType")}   onClick={() => handleSort("itemType")}>  Material{sortArrow("itemType")}</th>
              <th style={thStyle("quantity")}>  Qty x Price</th>
              <th style={thStyle("total")}      onClick={() => handleSort("total")}>     Total{sortArrow("total")}</th>
              <th style={thStyle("timestamp")}  onClick={() => handleSort("timestamp")}> Timestamp{sortArrow("timestamp")}</th>
              <th style={thStyle("status")}     onClick={() => handleSort("status")}>    Status{sortArrow("status")}</th>
              <th style={{ ...thStyle(""), cursor: "default" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map((txn, i) => (
              <tr key={txn.id} style={{
                borderBottom: `1px solid ${C.creamBorder}`,
                backgroundColor: i % 2 === 0 ? "#fff" : C.creamDim,
                transition: "background 0.1s",
              }}>
                <td style={{ padding: "12px 10px", fontWeight: "700", color: C.maroonMid, fontFamily: fontSans, fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                  {txn.id}
                </td>
                <td style={{ padding: "12px 10px", fontFamily: fontSans, fontSize: "0.85rem", color: C.textDark }}>
                  {txn.customer}
                </td>
                <td style={{ padding: "12px 10px", fontFamily: fontSans, fontSize: "0.82rem" }}>
                  <div style={{ color: C.textDark, fontWeight: "500" }}>{txn.itemType}</div>
                  <div style={{ color: C.textLight, fontSize: "0.72rem" }}>Size: {txn.size}</div>
                </td>
                <td style={{ padding: "12px 10px", fontFamily: fontSans, fontSize: "0.82rem", color: C.textMid, whiteSpace: "nowrap" }}>
                  {txn.quantity} kg @ ₱ {txn.unitPrice.toFixed(2)}
                </td>
                <td style={{ padding: "12px 10px", fontWeight: "700", fontFamily: font, fontSize: "0.95rem", color: C.textDark, whiteSpace: "nowrap" }}>
                  ₱ {txn.total.toFixed(2)}
                </td>
                <td style={{ padding: "12px 10px", fontFamily: fontSans, fontSize: "0.75rem", color: C.textLight, whiteSpace: "nowrap" }}>
                  {txn.timestamp}
                </td>
                <td style={{ padding: "12px 10px" }}>
                  <Badge status={txn.status} />
                </td>
                <td style={{ padding: "12px 10px", whiteSpace: "nowrap" }}>
                  <button onClick={() => onEdit(txn)} style={{
                    padding: "4px 10px", borderRadius: 5, marginRight: 6,
                    border: `1px solid ${C.creamBorder}`, background: "#fff",
                    cursor: "pointer", fontSize: "0.75rem", fontFamily: fontSans,
                    color: C.maroonMid, fontWeight: "600",
                  }}>Edit</button>
                  <button onClick={() => onDelete(txn.id)} style={{
                    padding: "4px 10px", borderRadius: 5,
                    border: `1px solid #FDECEA`, background: "#FDECEA",
                    cursor: "pointer", fontSize: "0.75rem", fontFamily: fontSans,
                    color: C.error, fontWeight: "600",
                  }}>Delete</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} style={{
                  padding: "40px", textAlign: "center",
                  color: C.textLight, fontFamily: fontSans, fontSize: "0.88rem",
                }}>
                  No transactions match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}