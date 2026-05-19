import { useState, useEffect } from "react";

const C = {
  maroonDark:  "#1C0606",
  maroonMid:   "#6B1C1C",
  maroonBtn:   "#8B2525",
  maroonLight: "#B03A3A",
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

const ITEM_TYPES = [
  "Full Grain Cowhide",
  "Top Grain Leather",
  "Italian Goatskin",
  "Suede Leather",
  "Nappa Leather",
  "Patent Leather",
];

export default function SalesForm({ onSave, editingTxn, onCancelEdit }) {
  const isEdit = !!editingTxn;
  const [customer,  setCustomer]  = useState("");
  const [itemType,  setItemType]  = useState(ITEM_TYPES[0]);
  const [size,      setSize]      = useState("");
  const [quantity,  setQuantity]  = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [status,    setStatus]    = useState("Completed");
  const [errors,    setErrors]    = useState({});

  useEffect(() => {
    if (editingTxn) {
      setCustomer(editingTxn.customer ?? "");
      setItemType(editingTxn.itemType ?? ITEM_TYPES[0]);
      setSize(editingTxn.size ?? "");
      setQuantity(editingTxn.quantity ?? "");
      setUnitPrice(editingTxn.unitPrice ?? "");
      setStatus(editingTxn.status ?? "Completed");
      setErrors({});
    } else {
      setCustomer("");
      setItemType(ITEM_TYPES[0]);
      setSize("");
      setQuantity("");
      setUnitPrice("");
      setStatus("Completed");
      setErrors({});
    }
  }, [editingTxn]);

  const total = (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0);

  const validate = () => {
    const e = {};
    if (!customer.trim())                         e.customer  = "Customer name is required.";
    if (!size.trim())                             e.size      = "Size / Batch is required.";
    if (!quantity || parseFloat(quantity) <= 0)   e.quantity  = "Enter a valid quantity.";
    if (!unitPrice || parseFloat(unitPrice) <= 0) e.unitPrice = "Enter a valid unit price.";
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    onSave({
      customer, itemType, size,
      quantity:  parseFloat(quantity),
      unitPrice: parseFloat(unitPrice),
      total,
      status,
    });

    if (!isEdit) {
      setCustomer(""); setSize(""); setQuantity(""); setUnitPrice("");
      setStatus("Completed"); setErrors({});
    }
  };

  const fieldStyle = (errKey) => ({
    width: "100%", padding: "9px 12px", borderRadius: 7,
    border: errors[errKey] ? `1.5px solid ${C.error}` : `1px solid ${C.creamBorder}`,
    backgroundColor: errors[errKey] ? C.errorBg : "#fff",
    fontSize: "0.88rem", fontFamily: fontSans, color: C.textDark,
    boxSizing: "border-box", outline: "none",
    transition: "border-color 0.15s",
  });

  const labelStyle = {
    display: "block", marginBottom: 5,
    fontSize: "0.78rem", fontWeight: "600",
    color: C.textMid, fontFamily: fontSans,
    textTransform: "uppercase", letterSpacing: 0.5,
  };

  return (
    <section style={{
      backgroundColor: C.creamCard, borderRadius: 12, padding: "26px 24px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: `1px solid ${C.creamBorder}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.05rem", color: C.maroonMid, fontFamily: font, fontWeight: "bold" }}>
            {isEdit ? "Edit Transaction" : "Record New Sale"}
          </h2>
          <p style={{ margin: "3px 0 0", fontSize: "0.75rem", color: C.textLight, fontFamily: fontSans }}>
            {isEdit ? `Editing ${editingTxn.id}` : "Sales Management"}
          </p>
        </div>
        {isEdit && (
          <button onClick={onCancelEdit} style={{
            padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.creamBorder}`,
            background: "#fff", cursor: "pointer", fontSize: "0.78rem",
            color: C.textMid, fontFamily: fontSans,
          }}>Cancel</button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Customer Name *</label>
          <input type="text" value={customer} onChange={e => setCustomer(e.target.value)}
            placeholder="Client / Company Name" style={fieldStyle("customer")} />
          {errors.customer && <span style={{ color: C.error, fontSize: "0.75rem", fontFamily: fontSans }}>{errors.customer}</span>}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Leather Item Type</label>
          <select value={itemType} onChange={e => setItemType(e.target.value)} style={fieldStyle()}>
            {ITEM_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Size / Batch Allocation *</label>
          <input type="text" value={size} onChange={e => setSize(e.target.value)}
            placeholder="e.g. Batch-2026-05" style={fieldStyle("size")} />
          {errors.size && <span style={{ color: C.error, fontSize: "0.75rem", fontFamily: fontSans }}>{errors.size}</span>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Quantity (KG) *</label>
            <input type="number" step="0.01" min="0" value={quantity}
              onChange={e => setQuantity(e.target.value)} placeholder="0.00" style={fieldStyle("quantity")} />
            {errors.quantity && <span style={{ color: C.error, fontSize: "0.72rem", fontFamily: fontSans }}>{errors.quantity}</span>}
          </div>
          <div>
            <label style={labelStyle}>Unit Price / KG *</label>
            <input type="number" step="0.01" min="0" value={unitPrice}
              onChange={e => setUnitPrice(e.target.value)} placeholder="₱ 0.00" style={fieldStyle("unitPrice")} />
            {errors.unitPrice && <span style={{ color: C.error, fontSize: "0.72rem", fontFamily: fontSans }}>{errors.unitPrice}</span>}
          </div>
        </div>

        {isEdit && (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={fieldStyle()}>
              <option>Completed</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
          </div>
        )}

        <div style={{
          background: `linear-gradient(135deg, ${C.maroonDark}, ${C.maroonMid})`,
          borderRadius: 8, padding: "14px 16px", marginBottom: 18,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem", fontFamily: fontSans, textTransform: "uppercase", letterSpacing: 1 }}>
            Computed Total
          </span>
          <span style={{ color: "#fff", fontSize: "1.3rem", fontFamily: font, fontWeight: "bold" }}>
            ₱ {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <button type="submit" style={{
          width: "100%", padding: "11px", borderRadius: 8,
          background: `linear-gradient(135deg, ${C.maroonBtn}, ${C.maroonLight})`,
          color: "#fff", border: "none", fontWeight: "bold", cursor: "pointer",
          fontSize: "0.9rem", fontFamily: fontSans, letterSpacing: 0.5,
          boxShadow: `0 3px 10px rgba(139,37,37,0.35)`,
          transition: "opacity 0.15s",
        }}>
          {isEdit ? "Save Changes" : "Save Transaction"}
        </button>
      </form>
    </section>
  );
}