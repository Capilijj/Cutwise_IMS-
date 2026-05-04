import { useState, useMemo, useEffect } from "react";
import { supabase, fetchAllData, addInventory, updateInventory, addScrap, updateScrap, addScrapSale, addDelivery, updateDelivery, addSupplier, updateSupplier, addSale, updateSale } from "./supabase.js";

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const C = {
  maroonDeep:   "#1C0606",
  maroonMid:    "#6B1C1C",
  maroonBtn:    "#8B2525",
  maroonLight:  "#B03030",
  cream:        "#FAF8F5",
  white:        "#FFFFFF",
  border:       "#EDE9E3",
  borderLight:  "#F3EFE9",
  textPrimary:  "#1C1412",
  textSecond:   "#6B6560",
  textMuted:    "#AAA49E",
  rowAlt:       "#FDFCFB",
};

const font = "'DM Sans', sans-serif";

const STATUS = {
  "Delivered":  { color: "#1A6B2A", bg: "#E6F4EA", dot: "#2E8B47" },
  "In Transit": { color: "#1A4F8B", bg: "#E6EEF9", dot: "#2B6CB0" },
  "Pending":    { color: "#7A5200", bg: "#FEF3D7", dot: "#D4A017" },
  "Cancelled":  { color: "#8B1A1A", bg: "#FCE8E8", dot: "#C0392B" },
  "Available":  { color: "#1A6B2A", bg: "#E6F4EA", dot: "#2E8B47" },
  "Low Stock":  { color: "#7A5200", bg: "#FEF3D7", dot: "#D4A017" },
  "Out of Stock":{ color: "#8B1A1A", bg: "#FCE8E8", dot: "#C0392B" },
  "Sold":       { color: "#8B1A1A", bg: "#FCE8E8", dot: "#C0392B" },
  "Reserved":   { color: "#7A5200", bg: "#FEF3D7", dot: "#D4A017" },
  "Active":     { color: "#1A6B2A", bg: "#E6F4EA", dot: "#2E8B47" },
  "Inactive":   { color: "#8B1A1A", bg: "#FCE8E8", dot: "#C0392B" },
};

/* ─── SEED DATA ─────────────────────────────────────────────── */
const SEED = {
  inventory: [
    { id: "INV-001", name: "Full Grain Cowhide",  type: "Cowhide",    size: "24×36 in", qty: 48, remaining: 38, pricePerPc: 120.00, supplier: "Marikina Tannery", dateIn: "Apr 10, 2026", status: "Available" },
    { id: "INV-002", name: "Top Grain Leather",   type: "Bovine",     size: "20×30 in", qty: 30, remaining: 7,  pricePerPc: 95.00,  supplier: "LGS Leather PH",   dateIn: "Apr 12, 2026", status: "Low Stock" },
    { id: "INV-003", name: "Italian Goatskin",    type: "Goatskin",   size: "18×24 in", qty: 20, remaining: 20, pricePerPc: 210.00, supplier: "Euro Hides MNL",   dateIn: "Apr 15, 2026", status: "Available" },
    { id: "INV-004", name: "Suede Leather",       type: "Suede",      size: "22×28 in", qty: 35, remaining: 14, pricePerPc: 80.00,  supplier: "Marikina Tannery", dateIn: "Apr 18, 2026", status: "Available" },
    { id: "INV-005", name: "Nappa Leather",       type: "Lambskin",   size: "16×22 in", qty: 15, remaining: 4,  pricePerPc: 180.00, supplier: "Euro Hides MNL",   dateIn: "Apr 20, 2026", status: "Low Stock" },
    { id: "INV-006", name: "Patent Leather",      type: "Synthetic",  size: "24×36 in", qty: 25, remaining: 25, pricePerPc: 65.00,  supplier: "SynFab Traders",   dateIn: "Apr 22, 2026", status: "Available" },
    { id: "INV-007", name: "PU Leather",          type: "Synthetic",  size: "30×40 in", qty: 40, remaining: 0,  pricePerPc: 45.00,  supplier: "SynFab Traders",   dateIn: "Mar 30, 2026", status: "Out of Stock" },
    { id: "INV-008", name: "Crocodile Embossed",  type: "Embossed",   size: "18×24 in", qty: 12, remaining: 9,  pricePerPc: 350.00, supplier: "Euro Hides MNL",   dateIn: "Apr 25, 2026", status: "Available" },
  ],
  scrap: [
    { id: "SC-001", material: "Full Grain Cowhide", batch: "Batch-2026-001", weightKg: 12.5, pricePerKg: 8.50, totalValue: 106.25, dateAdded: "Mar 10, 2026", status: "Available" },
    { id: "SC-002", material: "Top Grain Leather",  batch: "Batch-2026-002", weightKg: 8.3,  pricePerKg: 7.00, totalValue: 58.10,  dateAdded: "Mar 12, 2026", status: "Available" },
    { id: "SC-003", material: "Italian Goatskin",   batch: "Batch-2026-003", weightKg: 4.2,  pricePerKg: 12.00, totalValue: 50.40, dateAdded: "Mar 15, 2026", status: "Sold" },
    { id: "SC-004", material: "Suede Leather",      batch: "Batch-2026-004", weightKg: 6.8,  pricePerKg: 6.50, totalValue: 44.20,  dateAdded: "Mar 18, 2026", status: "Available" },
    { id: "SC-005", material: "Nappa Leather",      batch: "Batch-2026-005", weightKg: 3.1,  pricePerKg: 10.00, totalValue: 31.00, dateAdded: "Mar 20, 2026", status: "Reserved" },
    { id: "SC-006", material: "Full Grain Cowhide", batch: "Batch-2026-006", weightKg: 15.7, pricePerKg: 8.50, totalValue: 133.45, dateAdded: "Mar 22, 2026", status: "Available" },
  ],
  scrapSales: [
    { id: "SS-001", material: "Italian Goatskin", batch: "Batch-2026-003", kgSold: 4.2, priceKg: 12.00, total: 50.40, buyer: "Recyclo Craft PH",  date: "Apr 01, 2026" },
    { id: "SS-002", material: "PU Leather Scraps", batch: "Batch-2026-007", kgSold: 7.5, priceKg: 4.00, total: 30.00, buyer: "Eco Bag Manila",    date: "Apr 05, 2026" },
    { id: "SS-003", material: "Suede Offcuts",     batch: "Batch-2026-008", kgSold: 3.0, priceKg: 5.50, total: 16.50, buyer: "Artisano Workshop", date: "Apr 10, 2026" },
    { id: "SS-004", material: "Patent Scraps",     batch: "Batch-2026-009", kgSold: 5.8, priceKg: 3.50, total: 20.30, buyer: "Recyclo Craft PH",  date: "Apr 20, 2026" },
    { id: "SS-005", material: "Cowhide Offcuts",   batch: "Batch-2026-010", kgSold: 9.2, priceKg: 8.00, total: 73.60, buyer: "LCF Footwear",      date: "Apr 26, 2026" },
  ],
  deliveries: [
    { id: "DEL-2026-001", customer: "Marikina Shoe Co.", order: "SO-2026-041", items: "Full Grain Cowhide – 10 pcs", address: "123 Shoe Ave, Marikina", qty: 10, date: "Apr 28, 2026", status: "Delivered" },
    { id: "DEL-2026-002", customer: "LCF Footwear",      order: "SO-2026-045", items: "Top Grain Leather – 5 pcs",  address: "45 Rizal St, Marikina",  qty: 5,  date: "Apr 29, 2026", status: "In Transit" },
    { id: "DEL-2026-003", customer: "Prime Soles Inc.",  order: "SO-2026-048", items: "Suede Leather – 8 pcs",      address: "78 Bayan Rd, Pasig",     qty: 8,  date: "Apr 30, 2026", status: "In Transit" },
    { id: "DEL-2026-004", customer: "Artisano Workshop", order: "SO-2026-051", items: "Italian Goatskin – 3 pcs",   address: "22 Craft Lane, QC",      qty: 3,  date: "May 01, 2026", status: "Pending" },
    { id: "DEL-2026-005", customer: "Sole Republic",     order: "SO-2026-053", items: "Nappa Leather – 6 pcs",     address: "9 Trade Blvd, Taguig",   qty: 6,  date: "May 01, 2026", status: "Pending" },
    { id: "DEL-2026-006", customer: "Marikina Shoe Co.", order: "SO-2026-028", items: "Full Grain Cowhide – 12 pcs",address: "123 Shoe Ave, Marikina", qty: 12, date: "Apr 22, 2026", status: "Delivered" },
    { id: "DEL-2026-007", customer: "Nueva Forma",       order: "SO-2026-033", items: "Patent Leather – 4 pcs",    address: "50 Moda St, Manila",     qty: 4,  date: "Apr 23, 2026", status: "Cancelled" },
    { id: "DEL-2026-008", customer: "LCF Footwear",      order: "SO-2026-037", items: "Suede Leather – 7 pcs",     address: "45 Rizal St, Marikina",  qty: 7,  date: "Apr 25, 2026", status: "Delivered" },
  ],
  suppliers: [
    { id: "SUP-001", name: "Marikina Tannery Corp.",   contact: "Rodel Santos",   phone: "0917-123-4567", email: "rodel@marikina-tan.ph",   address: "88 Tanner St, Marikina",  category: "Raw Leather",   status: "Active",   rating: 5, lastOrder: "Apr 18, 2026" },
    { id: "SUP-002", name: "LGS Leather Philippines",  contact: "Liza Gomez",     phone: "0918-234-5678", email: "liza@lgsleather.com.ph",   address: "12 Leather Ave, Marikina",category: "Bovine Leather",status: "Active",   rating: 4, lastOrder: "Apr 12, 2026" },
    { id: "SUP-003", name: "Euro Hides Manila",        contact: "Marco del Rosario",phone:"0919-345-6789",email: "mdr@eurohides.ph",          address: "34 Import Blvd, Pasay",   category: "Premium Hides", status: "Active",   rating: 5, lastOrder: "Apr 25, 2026" },
    { id: "SUP-004", name: "SynFab Traders Inc.",      contact: "Aries Cruz",     phone: "0920-456-7890", email: "aries@synfab.ph",           address: "67 Industrial Rd, Caloocan",category:"Synthetic",  status: "Active",   rating: 3, lastOrder: "Apr 22, 2026" },
    { id: "SUP-005", name: "Bataan Tanning Corp.",     contact: "Nelia Reyes",    phone: "0921-567-8901", email: "nelia@bataan-tan.ph",       address: "1 Bataan Export Zone",    category: "Raw Leather",   status: "Inactive", rating: 3, lastOrder: "Jan 15, 2026" },
    { id: "SUP-006", name: "Leather World Philippines",contact: "Dante Mercado",  phone: "0922-678-9012", email: "dante@leatherworld.ph",     address: "200 Commerce St, QC",     category: "Mixed",         status: "Active",   rating: 4, lastOrder: "Apr 10, 2026" },
  ],
  sales: [
    { id: "SO-2026-041", customer: "Marikina Shoe Co.", items: "Full Grain Cowhide", qty: 10, size: "24×36 in", price: 1200.00, date: "Apr 28, 2026", cutUsed: "18×30 in", remaining: "6×36 in" },
    { id: "SO-2026-045", customer: "LCF Footwear",      items: "Top Grain Leather",  qty: 5,  size: "20×30 in", price: 475.00,  date: "Apr 29, 2026", cutUsed: "20×20 in", remaining: "20×10 in" },
    { id: "SO-2026-048", customer: "Prime Soles Inc.",  items: "Suede Leather",      qty: 8,  size: "22×28 in", price: 640.00,  date: "Apr 30, 2026", cutUsed: "20×25 in", remaining: "2×28 in" },
    { id: "SO-2026-051", customer: "Artisano Workshop", items: "Italian Goatskin",   qty: 3,  size: "18×24 in", price: 630.00,  date: "May 01, 2026", cutUsed: "16×22 in", remaining: "2×24 in" },
    { id: "SO-2026-053", customer: "Sole Republic",     items: "Nappa Leather",      qty: 6,  size: "16×22 in", price: 1080.00, date: "May 01, 2026", cutUsed: "14×20 in", remaining: "2×22 in" },
    { id: "SO-2026-028", customer: "Marikina Shoe Co.", items: "Full Grain Cowhide", qty: 12, size: "24×36 in", price: 1440.00, date: "Apr 22, 2026", cutUsed: "20×36 in", remaining: "4×36 in" },
    { id: "SO-2026-033", customer: "Nueva Forma",       items: "Patent Leather",     qty: 4,  size: "24×36 in", price: 260.00,  date: "Apr 23, 2026", cutUsed: "22×36 in", remaining: "2×36 in" },
    { id: "SO-2026-037", customer: "LCF Footwear",      items: "Suede Leather",      qty: 7,  size: "22×28 in", price: 560.00,  date: "Apr 25, 2026", cutUsed: "20×28 in", remaining: "2×28 in" },
  ],
};

/* ─── REUSABLE COMPONENTS ───────────────────────────────────── */
const Badge = ({ status }) => {
  const s = STATUS[status] || { color: "#555", bg: "#EEE", dot: "#888" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:s.bg, color:s.color,
      fontSize:12, fontWeight:500, padding:"3px 10px", borderRadius:20, fontFamily:font }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, display:"inline-block" }} />
      {status}
    </span>
  );
};

const StatCard = ({ label, value, sub, icon, accent }) => (
  <div style={{ flex:1, background:C.white, borderRadius:12, border:`1px solid ${C.border}`,
    padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
    <div>
      <p style={{ margin:0, fontSize:12, color:C.textMuted, fontFamily:font, letterSpacing:0.3 }}>{label}</p>
      <p style={{ margin:"6px 0 2px", fontSize:26, fontWeight:700, color:C.textPrimary, fontFamily:font }}>{value}</p>
      <p style={{ margin:0, fontSize:12, color:C.textSecond, fontFamily:font }}>{sub}</p>
    </div>
    <div style={{ width:38, height:38, borderRadius:10, background: accent || "#FDF0E8",
      display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>{icon}</div>
  </div>
);

const TableTh = ({ children, w }) => (
  <th style={{ padding:"11px 14px", textAlign:"left", fontSize:11, fontWeight:600,
    color:C.textMuted, letterSpacing:0.6, fontFamily:font, width:w, whiteSpace:"nowrap" }}>
    {children}
  </th>
);

const Td = ({ children, bold, muted, accent, right }) => (
  <td style={{ padding:"12px 14px", fontSize:13, fontFamily:font, textAlign:right?"right":"left",
    color: accent ? C.maroonBtn : bold ? C.textPrimary : muted ? C.textMuted : C.textSecond,
    fontWeight: bold ? 600 : 400, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
    {children}
  </td>
);

const ActionBtn = ({ children, primary, danger, onClick, small }) => (
  <button onClick={onClick} style={{ display:"inline-flex", alignItems:"center", gap:6,
    padding: small ? "6px 12px" : "9px 16px", borderRadius:8, border:"none", cursor:"pointer",
    fontSize: small ? 12 : 13, fontWeight:600, fontFamily:font,
    background: primary ? C.maroonBtn : danger ? "#FCE8E8" : C.white,
    color: primary ? C.white : danger ? "#8B1A1A" : C.textSecond,
    boxShadow: primary ? "none" : `0 0 0 1px ${C.border}` }}>
    {children}
  </button>
);

const SectionHeader = ({ title, sub, action }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
    <div>
      <h1 style={{ margin:0, fontSize:21, fontWeight:700, color:C.textPrimary, fontFamily:font }}>{title}</h1>
      {sub && <p style={{ margin:"4px 0 0", fontSize:13, color:C.textMuted, fontFamily:font }}>{sub}</p>}
    </div>
    {action}
  </div>
);

const Modal = ({ title, onClose, children, width = 460 }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(10,0,0,0.45)",
    display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
    <div style={{ background:C.white, borderRadius:14, padding:"26px 30px", width,
      maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:C.textPrimary, fontFamily:font }}>{title}</h2>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer",
          fontSize:20, color:C.textMuted, lineHeight:1 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const FormField = ({ label, children }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
    <label style={{ fontSize:12, color:C.textSecond, fontFamily:font }}>{label}</label>
    {children}
  </div>
);

const Input = ({ ...props }) => (
  <input {...props} style={{ padding:"9px 12px", borderRadius:8, border:`1px solid ${C.border}`,
    fontSize:13, fontFamily:font, outline:"none", background:"#FAFAFA", ...props.style }} />
);

const Select = ({ children, ...props }) => (
  <select {...props} style={{ padding:"9px 12px", borderRadius:8, border:`1px solid ${C.border}`,
    fontSize:13, fontFamily:font, outline:"none", background:"#FAFAFA", cursor:"pointer", ...props.style }}>
    {children}
  </select>
);

const Stars = ({ n }) => (
  <span style={{ fontSize:13, letterSpacing:1 }}>
    {"★".repeat(n)}{"☆".repeat(5 - n)}
  </span>
);

/* ─── SIDEBAR ───────────────────────────────────────────────── */
const NAV = [
  { icon: "⊞", label: "Home" },
  { icon: "◫", label: "Inventory Management" },
  { icon: "♻", label: "Scrap Management" },
  { icon: "🚚", label: "Delivery System" },
  { icon: "📋", label: "Supplier Reference" },
  { icon: "📊", label: "Reports" },
  { icon: "⚙", label: "Settings" },
];

const Sidebar = ({ active, setActive }) => (
  <div style={{ width:240, background:C.maroonDeep, display:"flex", flexDirection:"column", flexShrink:0 }}>
    <div style={{ padding:"20px 20px 16px", borderBottom:`1px solid rgba(255,255,255,0.07)` }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:8, background:C.maroonBtn,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:15, fontWeight:700, color:C.white, fontFamily:font }}>O</div>
        <div>
          <p style={{ margin:0, fontSize:14, fontWeight:700, color:C.white, letterSpacing:0.5, fontFamily:font }}>OTTO SHOES</p>
          <p style={{ margin:0, fontSize:10, color:"rgba(255,255,255,0.4)", letterSpacing:0.3, fontFamily:font }}>CutWise IMS</p>
        </div>
      </div>
    </div>
    <nav style={{ flex:1, paddingTop:8 }}>
      {NAV.map(({ icon, label }) => (
        <div key={label} onClick={() => setActive(label)} style={{
          display:"flex", alignItems:"center", gap:10, padding:"10px 16px",
          borderRadius:8, cursor:"pointer", margin:"1px 8px",
          background: active === label ? C.maroonMid : "transparent",
          color: active === label ? C.white : "rgba(255,255,255,0.6)",
          fontSize:14, fontFamily:font, transition:"background 0.15s",
        }}>
          <span style={{ fontSize:15, opacity: active === label ? 1 : 0.65 }}>{icon}</span>
          {label}
        </div>
      ))}
    </nav>
    <div style={{ padding:"14px 16px", borderTop:`1px solid rgba(255,255,255,0.07)` }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:32, height:32, borderRadius:"50%", background:C.maroonMid,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:C.white }}>M</div>
        <div>
          <p style={{ margin:0, fontSize:13, fontWeight:600, color:C.white, fontFamily:font }}>Manager</p>
          <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.4)", fontFamily:font }}>Josef G. Adalim</p>
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   PAGE 1: HOME DASHBOARD
═══════════════════════════════════════════════════════════════ */
const HomePage = ({ data, navigate }) => {
  const totalInvValue = data.inventory.reduce((s, i) => s + i.remaining * i.pricePerPc, 0);
  const lowStock = data.inventory.filter(i => i.status === "Low Stock").length;
  const todaySales = data.sales.filter(s => s.date === "May 01, 2026").reduce((s, x) => s + x.price, 0);
  const pendingDel = data.deliveries.filter(d => d.status === "Pending" || d.status === "In Transit").length;

  const recentActivity = [
    ...data.sales.slice(0, 3).map(s => ({ type:"sale", icon:"💰", text:`Sale recorded for ${s.customer}`, detail:s.items, date:s.date, id:s.id })),
    ...data.deliveries.filter(d=>d.status==="In Transit").slice(0,2).map(d=>({ type:"delivery", icon:"🚚", text:`Delivery dispatched to ${d.customer}`, detail:d.items, date:d.date, id:d.id })),
  ].sort((a,b) => a.date < b.date ? 1 : -1).slice(0, 6);

  const CHART_DATA = [
    { day:"Apr 22", sales:1440 }, { day:"Apr 23", sales:260 },
    { day:"Apr 25", sales:560 }, { day:"Apr 28", sales:1200 },
    { day:"Apr 29", sales:475 }, { day:"Apr 30", sales:640 },
    { day:"May 01", sales:1710 },
  ];
  const maxSales = Math.max(...CHART_DATA.map(d => d.sales));

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"28px 32px", background:C.cream }}>
      <SectionHeader title="Dashboard" sub="Monday, May 4, 2026  —  Good morning, Manager 👋" />

      {/* KPI row */}
      <div style={{ display:"flex", gap:14, marginBottom:22 }}>
        <StatCard label="Total Inventory Value"  value={`₱${totalInvValue.toLocaleString("en-PH",{minimumFractionDigits:2})}`} sub="8 material types tracked"    icon="📦" accent="#EDF4FF" />
        <StatCard label="Sales Today"            value={`₱${todaySales.toLocaleString("en-PH",{minimumFractionDigits:2})}`}   sub="2 transactions recorded"       icon="💰" accent="#E6F4EA" />
        <StatCard label="Active Deliveries"      value={pendingDel}                                                             sub="In transit + pending"           icon="🚚" accent="#FDF0E8" />
        <StatCard label="Low Stock Alerts"       value={lowStock}                                                               sub="Need restocking soon"           icon="⚠️" accent="#FEF3D7" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:22 }}>
        {/* Sales Chart */}
        <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.border}`, padding:"20px 22px" }}>
          <p style={{ margin:"0 0 16px", fontSize:14, fontWeight:600, color:C.textPrimary, fontFamily:font }}>Sales (Last 7 Days)</p>
          <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:120 }}>
            {CHART_DATA.map(d => {
              const h = Math.round((d.sales / maxSales) * 100);
              return (
                <div key={d.day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <span style={{ fontSize:9, color:C.textMuted, fontFamily:font }}>₱{(d.sales/1000).toFixed(1)}k</span>
                  <div title={`₱${d.sales}`} style={{ width:"100%", height:`${h}%`, background:C.maroonBtn,
                    borderRadius:"4px 4px 0 0", minHeight:4, cursor:"default",
                    opacity: d.day === "May 01" ? 1 : 0.55 }} />
                  <span style={{ fontSize:9, color:C.textMuted, fontFamily:font, whiteSpace:"nowrap" }}>{d.day.replace("Apr ","").replace("May ","")}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Breakdown */}
        <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.border}`, padding:"20px 22px" }}>
          <p style={{ margin:"0 0 16px", fontSize:14, fontWeight:600, color:C.textPrimary, fontFamily:font }}>Inventory Breakdown</p>
          {data.inventory.map(item => {
            const pct = Math.round((item.remaining / item.qty) * 100);
            const barColor = pct <= 20 ? "#E24B4A" : pct <= 40 ? "#D4A017" : C.maroonBtn;
            return (
              <div key={item.id} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:12, color:C.textSecond, fontFamily:font }}>{item.name}</span>
                  <span style={{ fontSize:12, color:C.textMuted, fontFamily:font }}>{item.remaining}/{item.qty} pcs</span>
                </div>
                <div style={{ height:5, borderRadius:3, background:"#F0EDE8", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:barColor, borderRadius:3 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:18 }}>
        <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.borderLight}` }}>
            <p style={{ margin:0, fontSize:14, fontWeight:600, color:C.textPrimary, fontFamily:font }}>Recent Activity</p>
          </div>
          {recentActivity.map((a, i) => (
            <div key={i} style={{ padding:"13px 20px", borderBottom:`1px solid ${C.borderLight}`,
              display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ fontSize:18 }}>{a.icon}</span>
              <div style={{ flex:1 }}>
                <p style={{ margin:0, fontSize:13, fontWeight:500, color:C.textPrimary, fontFamily:font }}>{a.text}</p>
                <p style={{ margin:"2px 0 0", fontSize:12, color:C.textMuted, fontFamily:font }}>{a.detail} · {a.date}</p>
              </div>
              <span style={{ fontSize:11, color:C.textMuted, fontFamily:font }}>{a.id}</span>
            </div>
          ))}
        </div>

        <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.border}`, padding:"20px 22px" }}>
          <p style={{ margin:"0 0 16px", fontSize:14, fontWeight:600, color:C.textPrimary, fontFamily:font }}>Quick Actions</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { label:"Add Inventory Stock", icon:"📦", page:"Inventory Management", bg:"#EDF4FF" },
              { label:"Record a Sale",       icon:"💰", page:"Inventory Management", bg:"#E6F4EA" },
              { label:"New Delivery",        icon:"🚚", page:"Delivery System",      bg:"#FDF0E8" },
              { label:"Convert Cut-offs",    icon:"♻", page:"Scrap Management",     bg:"#F0FBF6" },
              { label:"View Reports",        icon:"📊", page:"Reports",              bg:"#FEF3D7" },
            ].map(q => (
              <button key={q.label} onClick={() => navigate(q.page)} style={{
                display:"flex", alignItems:"center", gap:12, padding:"11px 14px",
                borderRadius:8, border:`1px solid ${C.border}`, background:C.white,
                cursor:"pointer", fontFamily:font, textAlign:"left", width:"100%",
              }}>
                <span style={{ width:32, height:32, borderRadius:8, background:q.bg,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>{q.icon}</span>
                <span style={{ fontSize:13, fontWeight:500, color:C.textPrimary }}>{q.label}</span>
                <span style={{ marginLeft:"auto", fontSize:14, color:C.textMuted }}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PAGE 2: INVENTORY MANAGEMENT
═══════════════════════════════════════════════════════════════ */
const InventoryPage = ({ data, setData }) => {
  const [activeTab, setActiveTab] = useState("Stock List");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showCutModal, setShowCutModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [form, setForm] = useState({ name:"", type:"Cowhide", size:"", qty:"", pricePerPc:"", supplier:"", dateIn:"" });
  const [saleForm, setSaleForm] = useState({ customer:"", invId:"", qty:"", cutSize:"", price:"" });
  const [cutForm, setCutForm] = useState({ invId:"", origSize:"", cutSize:"" });
  const [cutResult, setCutResult] = useState(null);
  const [cutHistory, setCutHistory] = useState([]);

  const types = ["All", ...new Set(data.inventory.map(i => i.type))];
  const filtered = filterType === "All" ? data.inventory : data.inventory.filter(i => i.type === filterType);

  const totalPcs = data.inventory.reduce((s,i) => s + i.remaining, 0);
  const totalValue = data.inventory.reduce((s,i) => s + i.remaining * i.pricePerPc, 0);
  const outOfStock = data.inventory.filter(i => i.status === "Out of Stock").length;
  const available = data.inventory.filter(i => i.status === "Available").length;

  const parseDim = (s) => {
    const m = s.replace(/\s/g,"").match(/^(\d+(?:\.\d+)?)×(\d+(?:\.\d+)?)in$/i);
    return m ? { w: parseFloat(m[1]), h: parseFloat(m[2]) } : null;
  };

  const handleCutCalc = () => {
    const inv = data.inventory.find(i => i.id === cutForm.invId);
    if (!inv) return;
    const orig = parseDim(cutForm.origSize || inv.size);
    const cut = parseDim(cutForm.cutSize);
    if (!orig || !cut) { setCutResult({ error: "Invalid size format. Use: WxH in" }); return; }
    const origArea = orig.w * orig.h;
    const cutArea = cut.w * cut.h;
    if (cutArea > origArea) { setCutResult({ error: "Cut size cannot exceed original size." }); return; }
    const remArea = origArea - cutArea;
    const remPct = ((remArea / origArea) * 100).toFixed(1);
    setCutResult({
      origSize: `${orig.w}×${orig.h} in (${origArea.toFixed(0)} sq in)`,
      cutSize:  `${cut.w}×${cut.h} in (${cutArea.toFixed(0)} sq in)`,
      remaining: `${remArea.toFixed(0)} sq in (${remPct}% of original)`,
      toScrap: parseFloat(remPct) < 20,
      material: inv.name,
    });
  };

  const handleSaveCutResult = () => {
    if (!cutResult || cutResult.error) return;
    const saved = {
      id: `CUT-${Date.now()}`,
      date: "May 04, 2026",
      ...cutResult,
    };
    setCutHistory(p => [saved, ...p]);
    alert("Cutting result saved locally.");
  };

  const handleAddStock = async () => {
    if (!form.name || !form.qty || !form.pricePerPc) return;
    const qty = parseInt(form.qty);
    const newItem = {
      id: `INV-${Date.now()}`, name: form.name, type: form.type,
      size: form.size || "24×36 in", qty, remaining: qty,
      price_per_pc: parseFloat(form.pricePerPc), supplier: form.supplier,
      date_in: form.dateIn || "May 04, 2026", status: "Available",
    };
    const { data: added, error } = await addInventory(newItem);
    if (added) {
      setData(p => ({ ...p, inventory: [...p.inventory, added] }));
      setForm({ name:"", type:"Cowhide", size:"", qty:"", pricePerPc:"", supplier:"", dateIn:"" });
      setShowAddModal(false);
    } else {
      alert(`Unable to save stock entry. ${error?.message || 'Check Supabase permissions or network settings.'}`);
    }
  };

  const handleRecordSale = async () => {
    if (!saleForm.customer || !saleForm.invId || !saleForm.qty) return;
    const qty = parseInt(saleForm.qty);
    const invItem = data.inventory.find(i => i.id === saleForm.invId);
    if (!invItem || invItem.remaining < qty) return alert("Insufficient stock.");
    
    const newSale = {
      id: `SO-${Date.now()}`, customer: saleForm.customer,
      items: invItem.name, qty, size: invItem.size,
      price: parseFloat(saleForm.price) || qty * invItem.pricePerPc,
      date: "May 04, 2026", cut_used: saleForm.cutSize || invItem.size, remaining_cut: "—",
    };
    
    const newRemaining = invItem.remaining - qty;
    const newStatus = newRemaining === 0 ? "Out of Stock" : newRemaining <= 5 ? "Low Stock" : "Available";
    
    const [saleAdded, invUpdated] = await Promise.all([
      addSale(newSale),
      updateInventory(saleForm.invId, { remaining: newRemaining, status: newStatus })
    ]);
    
    if (saleAdded && invUpdated) {
      setData(p => ({
        ...p,
        sales: [saleAdded, ...p.sales],
        inventory: p.inventory.map(i => i.id === saleForm.invId ? invUpdated : i),
      }));
      setSaleForm({ customer:"", invId:"", qty:"", cutSize:"", price:"" });
      setShowSaleModal(false);
    } else {
      alert("Unable to record sale. Check Supabase permissions or network settings.");
    }
  };

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"28px 32px", background:C.cream }}>
      <SectionHeader title="Inventory Management" sub="Subsystem 1 — Track raw leather stocks in real-time"
        action={
          <div style={{ display:"flex", gap:8 }}>
            <ActionBtn onClick={() => setShowCutModal(true)}>✂ Cutting Calc</ActionBtn>
            <ActionBtn onClick={() => setShowSaleModal(true)}>💰 Record Sale</ActionBtn>
            <ActionBtn primary onClick={() => setShowAddModal(true)}>+ Add Stock</ActionBtn>
          </div>
        }
      />

      <div style={{ display:"flex", gap:14, marginBottom:22 }}>
        <StatCard label="Total Pieces Remaining" value={totalPcs.toLocaleString()}       sub="Across all materials"  icon="📦" />
        <StatCard label="Inventory Value"         value={`₱${totalValue.toLocaleString("en-PH",{minimumFractionDigits:2})}`} sub="Current stock worth" icon="💵" accent="#E6F4EA" />
        <StatCard label="Available Types"         value={available}                       sub="Ready for sale"        icon="✅" accent="#EDF4FF" />
        <StatCard label="Out of Stock"            value={outOfStock}                      sub="Needs reordering"      icon="🚨" accent="#FCE8E8" />
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:16, justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:8 }}>
          {["Stock List", "Sales Log"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding:"8px 18px", borderRadius:8, border:"none", cursor:"pointer",
              fontSize:13, fontWeight:600, fontFamily:font,
              background: activeTab === t ? C.maroonBtn : C.white,
              color: activeTab === t ? C.white : C.textSecond,
              boxShadow: activeTab === t ? "none" : `0 0 0 1px ${C.border}`,
            }}>{t}</button>
          ))}
        </div>
        {activeTab === "Stock List" && (
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <span style={{ fontSize:12, color:C.textMuted, fontFamily:font }}>Type:</span>
            {types.map(t => (
              <button key={t} onClick={() => setFilterType(t)} style={{
                padding:"5px 12px", borderRadius:20, border:"none", cursor:"pointer",
                fontSize:12, fontFamily:font,
                background: filterType === t ? C.maroonBtn : "#EEE",
                color: filterType === t ? C.white : C.textSecond,
              }}>{t}</button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      {activeTab === "Stock List" ? (
        <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
            <colgroup>
              <col style={{width:"6%"}} /><col style={{width:"18%"}} /><col style={{width:"10%"}} />
              <col style={{width:"10%"}} /><col style={{width:"7%"}} /><col style={{width:"8%"}} />
              <col style={{width:"8%"}} /><col style={{width:"14%"}} /><col style={{width:"10%"}} /><col style={{width:"9%"}} />
            </colgroup>
            <thead>
              <tr style={{ background:"#FAF7F4", borderBottom:`1px solid ${C.border}` }}>
                {["ID","NAME","TYPE","SIZE","STOCK","REMAINING","PRICE/PC","SUPPLIER","DATE IN","STATUS"].map(h => (
                  <TableTh key={h}>{h}</TableTh>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id} style={{ borderBottom:`1px solid ${C.borderLight}`, background: i%2===0?C.white:C.rowAlt }}>
                  <Td muted>{item.id}</Td>
                  <Td bold>{item.name}</Td>
                  <Td>{item.type}</Td>
                  <Td muted>{item.size}</Td>
                  <Td>{item.qty}</Td>
                  <td style={{ padding:"12px 14px" }}>
                    <span style={{ fontWeight:600, fontSize:13, fontFamily:font,
                      color: item.remaining === 0 ? "#C0392B" : item.remaining <= 5 ? "#D4A017" : C.textPrimary }}>
                      {item.remaining}
                    </span>
                  </td>
                  <Td>₱{item.pricePerPc.toFixed(2)}</Td>
                  <Td muted>{item.supplier}</Td>
                  <Td muted>{item.dateIn}</Td>
                  <td style={{ padding:"12px 14px" }}><Badge status={item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
            <colgroup>
              <col style={{width:"12%"}} /><col style={{width:"16%"}} /><col style={{width:"16%"}} />
              <col style={{width:"8%"}} /><col style={{width:"10%"}} /><col style={{width:"10%"}} />
              <col style={{width:"14%"}} /><col style={{width:"14%"}} />
            </colgroup>
            <thead>
              <tr style={{ background:"#FAF7F4", borderBottom:`1px solid ${C.border}` }}>
                {["ORDER ID","CUSTOMER","ITEMS","QTY","SIZE","PRICE","CUT USED","DATE"].map(h => (
                  <TableTh key={h}>{h}</TableTh>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.sales.map((s, i) => (
                <tr key={s.id} style={{ borderBottom:`1px solid ${C.borderLight}`, background: i%2===0?C.white:C.rowAlt }}>
                  <Td accent>{s.id}</Td>
                  <Td bold>{s.customer}</Td>
                  <Td>{s.items}</Td>
                  <Td>{s.qty}</Td>
                  <Td muted>{s.size}</Td>
                  <Td>₱{s.price.toFixed(2)}</Td>
                  <Td muted>{s.cutUsed}</Td>
                  <Td muted>{s.date}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD STOCK MODAL */}
      {showAddModal && (
        <Modal title="Add New Stock" onClose={() => setShowAddModal(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <FormField label="Material Name *">
              <Input placeholder="e.g. Full Grain Cowhide" value={form.name} onChange={e => setForm(p=>({...p, name:e.target.value}))} />
            </FormField>
            <FormField label="Type *">
              <Select value={form.type} onChange={e => setForm(p=>({...p, type:e.target.value}))}>
                {["Cowhide","Bovine","Goatskin","Suede","Lambskin","Synthetic","Embossed"].map(t => <option key={t}>{t}</option>)}
              </Select>
            </FormField>
            <FormField label="Size (W×H in)">
              <Input placeholder="e.g. 24×36 in" value={form.size} onChange={e => setForm(p=>({...p, size:e.target.value}))} />
            </FormField>
            <FormField label="Quantity (pcs) *">
              <Input type="number" placeholder="0" value={form.qty} onChange={e => setForm(p=>({...p, qty:e.target.value}))} />
            </FormField>
            <FormField label="Price per Piece (₱) *">
              <Input type="number" placeholder="0.00" value={form.pricePerPc} onChange={e => setForm(p=>({...p, pricePerPc:e.target.value}))} />
            </FormField>
            <FormField label="Supplier">
              <Input placeholder="Supplier name" value={form.supplier} onChange={e => setForm(p=>({...p, supplier:e.target.value}))} />
            </FormField>
            <FormField label="Date Received">
              <Input type="date" value={form.dateIn} onChange={e => setForm(p=>({...p, dateIn:e.target.value}))} />
            </FormField>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <ActionBtn onClick={() => setShowAddModal(false)}>Cancel</ActionBtn>
            <button onClick={handleAddStock} style={{ flex:1, padding:"10px", borderRadius:8, border:"none",
              background:C.maroonBtn, color:C.white, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:font }}>
              Save Stock Entry
            </button>
          </div>
        </Modal>
      )}

      {/* RECORD SALE MODAL */}
      {showSaleModal && (
        <Modal title="Record Sale & Leather Cutting" onClose={() => setShowSaleModal(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <FormField label="Customer Name *">
              <Input placeholder="Customer" value={saleForm.customer} onChange={e => setSaleForm(p=>({...p, customer:e.target.value}))} />
            </FormField>
            <FormField label="Select Inventory Item *">
              <Select value={saleForm.invId} onChange={e => setSaleForm(p=>({...p, invId:e.target.value}))}>
                <option value="">— Select —</option>
                {data.inventory.filter(i=>i.remaining>0).map(i => <option key={i.id} value={i.id}>{i.name} ({i.remaining} pcs)</option>)}
              </Select>
            </FormField>
            <FormField label="Quantity to Sell *">
              <Input type="number" placeholder="0" value={saleForm.qty} onChange={e => setSaleForm(p=>({...p, qty:e.target.value}))} />
            </FormField>
            <FormField label="Cut Size Requested (W×H in)">
              <Input placeholder="e.g. 18×30 in" value={saleForm.cutSize} onChange={e => setSaleForm(p=>({...p, cutSize:e.target.value}))} />
            </FormField>
            <div style={{ gridColumn:"1/-1" }}>
              <FormField label="Total Price (₱)">
                <Input type="number" placeholder="Auto-computed if left blank" value={saleForm.price} onChange={e => setSaleForm(p=>({...p, price:e.target.value}))} />
              </FormField>
            </div>
          </div>
          {saleForm.invId && (
            <div style={{ marginTop:14, padding:12, background:"#FDF8F4", borderRadius:8, border:`1px solid ${C.border}` }}>
              <p style={{ margin:0, fontSize:12, color:C.textSecond, fontFamily:font }}>
                📦 Available stock: <strong>{data.inventory.find(i=>i.id===saleForm.invId)?.remaining || 0} pcs</strong>
                &nbsp;·&nbsp; Size: <strong>{data.inventory.find(i=>i.id===saleForm.invId)?.size}</strong>
              </p>
            </div>
          )}
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <ActionBtn onClick={() => setShowSaleModal(false)}>Cancel</ActionBtn>
            <button onClick={handleRecordSale} style={{ flex:1, padding:"10px", borderRadius:8, border:"none",
              background:C.maroonBtn, color:C.white, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:font }}>
              Record Sale &amp; Deduct Inventory
            </button>
          </div>
        </Modal>
      )}

      {/* CUTTING CALC MODAL */}
      {showCutModal && (
        <Modal title="Leather Cutting Calculator" onClose={() => { setShowCutModal(false); setCutResult(null); }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ gridColumn:"1/-1" }}>
              <FormField label="Select Material">
                <Select value={cutForm.invId} onChange={e => { setCutForm(p=>({...p, invId:e.target.value, origSize:""})); setCutResult(null); }}>
                  <option value="">— Select —</option>
                  {data.inventory.map(i => <option key={i.id} value={i.id}>{i.name} — {i.size}</option>)}
                </Select>
              </FormField>
            </div>
            <FormField label="Original Leather Size (W×H in)">
              <Input placeholder="e.g. 24×36 in" value={cutForm.origSize || (data.inventory.find(i=>i.id===cutForm.invId)?.size || "")}
                onChange={e => setCutForm(p=>({...p, origSize:e.target.value}))} />
            </FormField>
            <FormField label="Customer Requested Cut Size *">
              <Input placeholder="e.g. 18×30 in" value={cutForm.cutSize} onChange={e => setCutForm(p=>({...p, cutSize:e.target.value}))} />
            </FormField>
          </div>
          <button onClick={handleCutCalc} style={{ width:"100%", marginTop:16, padding:"10px", borderRadius:8, border:"none",
            background:C.maroonBtn, color:C.white, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:font }}>
            ✂ Calculate
          </button>

          {cutResult && !cutResult.error && (
            <button onClick={handleSaveCutResult} style={{ width:"100%", marginTop:10, padding:"10px", borderRadius:8, border:"none",
              background:"#1A6B2A", color:C.white, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:font }}>
              💾 Save Cutting Result
            </button>
          )}

          {cutResult && (
            <div style={{ marginTop:16, padding:16, background: cutResult.error ? "#FCE8E8" : "#F0F8F0", borderRadius:10, border:`1px solid ${cutResult.error ? "#F5C0C0" : "#B5D9B5"}` }}>
              {cutResult.error ? (
                <p style={{ margin:0, color:"#8B1A1A", fontSize:13, fontFamily:font }}>⚠ {cutResult.error}</p>
              ) : (
                <>
                  <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:600, color:C.textPrimary, fontFamily:font }}>Cutting Results for: {cutResult.material}</p>
                  {[
                    { label:"Original Size", val:cutResult.origSize },
                    { label:"Cut Size Used", val:cutResult.cutSize },
                    { label:"Remaining Off-cut", val:cutResult.remaining },
                  ].map(row => (
                    <div key={row.label} style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ fontSize:12, color:C.textSecond, fontFamily:font }}>{row.label}:</span>
                      <span style={{ fontSize:12, fontWeight:600, color:C.textPrimary, fontFamily:font }}>{row.val}</span>
                    </div>
                  ))}
                  <div style={{ marginTop:10, padding:8, borderRadius:6, background: cutResult.toScrap ? "#FEF3D7" : "#E6F4EA" }}>
                    <p style={{ margin:0, fontSize:12, fontFamily:font, color: cutResult.toScrap ? "#7A5200" : "#1A6B2A" }}>
                      {cutResult.toScrap ? "⚠ Off-cut is too small — recommend converting to scrap inventory (per kg)."
                                        : "✅ Off-cut is usable — can be returned to reusable stock."}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {cutHistory.length > 0 && (
            <div style={{ marginTop:18, padding:16, background:C.white, borderRadius:10, border:`1px solid ${C.border}` }}>
              <p style={{ margin:"0 0 10px", fontSize:13, fontWeight:600, color:C.textPrimary, fontFamily:font }}>Saved Cutting Results</p>
              {cutHistory.map(item => (
                <div key={item.id} style={{ marginBottom:10, padding:10, background:"#FAFAFA", borderRadius:8 }}>
                  <p style={{ margin:0, fontSize:12, color:C.textMuted, fontFamily:font }}>• {item.material} — {item.date}</p>
                  <p style={{ margin:"4px 0 0", fontSize:12, color:C.textPrimary, fontFamily:font }}>{item.cutSize} cut from {item.origSize} → {item.remaining}</p>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PAGE 3: SCRAP MANAGEMENT
═══════════════════════════════════════════════════════════════ */
const ScrapPage = ({ data, setData }) => {
  const [activeTab, setActiveTab] = useState("Scrap Inventory");
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [convForm, setConvForm] = useState({ material:"", sourceInvId:"", weightKg:"", pricePerKg:"" });
  const [saleForm, setSaleForm] = useState({ scrapId:"", buyer:"", kgSold:"", priceKg:"" });

  const available = data.scrap.filter(s => s.status === "Available");
  const totalKg = available.reduce((s, x) => s + x.weightKg, 0);
  const totalValue = available.reduce((s, x) => s + x.totalValue, 0);
  const totalProfit = data.scrapSales.reduce((s, x) => s + x.total, 0);

  const handleConvert = async () => {
    if (!convForm.material || !convForm.weightKg || !convForm.pricePerKg) return;
    const wt = parseFloat(convForm.weightKg);
    const pk = parseFloat(convForm.pricePerKg);
    const newScrap = {
      id: `SC-${Date.now()}`,
      material: convForm.material,
      batch: `Batch-2026-${Date.now()}`,
      weight_kg: wt, 
      price_per_kg: pk, 
      total_value: +(wt * pk).toFixed(2),
      date_added: "May 04, 2026", 
      status: "Available",
    };
    const added = await addScrap(newScrap);
    if (added) {
      setData(p => ({ ...p, scrap: [...p.scrap, added] }));
      setConvForm({ material:"", sourceInvId:"", weightKg:"", pricePerKg:"" });
      setShowConvertModal(false);
    }
  };

  const handleSale = async () => {
    const scrapItem = data.scrap.find(s => s.id === saleForm.scrapId);
    if (!scrapItem || !saleForm.buyer || !saleForm.kgSold || !saleForm.priceKg) return;
    const kg = parseFloat(saleForm.kgSold);
    const pk = parseFloat(saleForm.priceKg);
    const newSale = {
      id: `SS-${Date.now()}`,
      material: scrapItem.material, 
      batch: scrapItem.batch,
      kg_sold: kg, 
      price_kg: pk, 
      total: +(kg * pk).toFixed(2),
      buyer: saleForm.buyer, 
      date: "May 04, 2026",
    };
    
    const [saleAdded, scrapUpdated] = await Promise.all([
      addScrapSale(newSale),
      updateScrap(saleForm.scrapId, { status: "Sold" })
    ]);
    
    if (saleAdded && scrapUpdated) {
      setData(p => ({
        ...p,
        scrapSales: [saleAdded, ...p.scrapSales],
        scrap: p.scrap.map(s => s.id === saleForm.scrapId ? scrapUpdated : s),
      }));
      setSaleForm({ scrapId:"", buyer:"", kgSold:"", priceKg:"" });
      setShowSaleModal(false);
    }
  };

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"28px 32px", background:C.cream }}>
      <SectionHeader title="Scrap Management" sub="Subsystem 1B — Manage and sell leather cut-off remnants"
        action={
          <div style={{ display:"flex", gap:8 }}>
            <ActionBtn onClick={() => setShowConvertModal(true)}>♻ Convert Cut-offs</ActionBtn>
            <ActionBtn primary onClick={() => setShowSaleModal(true)}>💵 Record Sale</ActionBtn>
          </div>
        }
      />

      <div style={{ display:"flex", gap:14, marginBottom:22 }}>
        <StatCard label="Available Scrap"  value={`${totalKg.toFixed(1)} kg`} sub={`${available.length} batches`}       icon="⚖️" />
        <StatCard label="Scrap Value"      value={`₱${totalValue.toFixed(2)}`}   sub="Estimated sellable value"          icon="💰" accent="#E6F4EA" />
        <StatCard label="Total Profit"     value={`₱${totalProfit.toFixed(2)}`}  sub={`${data.scrapSales.length} sales`} icon="📈" accent="#EDF4FF" />
        <StatCard label="Sold Batches"     value={data.scrap.filter(s=>s.status==="Sold").length} sub="Converted to revenue" icon="✅" accent="#FDF0E8" />
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {["Scrap Inventory","Sales History"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding:"8px 18px", borderRadius:8, border:"none", cursor:"pointer",
            fontSize:13, fontWeight:600, fontFamily:font,
            background: activeTab === t ? C.maroonBtn : C.white,
            color: activeTab === t ? C.white : C.textSecond,
            boxShadow: activeTab === t ? "none" : `0 0 0 1px ${C.border}`,
          }}>{t}</button>
        ))}
      </div>

      {activeTab === "Scrap Inventory" ? (
        <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
            <colgroup>
              <col style={{width:"8%"}} /><col style={{width:"18%"}} /><col style={{width:"14%"}} />
              <col style={{width:"10%"}} /><col style={{width:"10%"}} /><col style={{width:"10%"}} />
              <col style={{width:"14%"}} /><col style={{width:"10%"}} /><col style={{width:"6%"}} />
            </colgroup>
            <thead>
              <tr style={{ background:"#FAF7F4", borderBottom:`1px solid ${C.border}` }}>
                {["ID","MATERIAL TYPE","SOURCE BATCH","WEIGHT (KG)","PRICE/KG","TOTAL VALUE","DATE ADDED","STATUS","ACTIONS"].map(h => (
                  <TableTh key={h}>{h}</TableTh>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.scrap.map((s, i) => (
                <tr key={s.id} style={{ borderBottom:`1px solid ${C.borderLight}`, background: i%2===0?C.white:C.rowAlt }}>
                  <Td muted>{s.id}</Td>
                  <Td bold>{s.material}</Td>
                  <Td muted>{s.batch}</Td>
                  <Td>{s.weightKg.toFixed(1)} kg</Td>
                  <Td>₱{s.pricePerKg.toFixed(2)}</Td>
                  <Td bold>₱{s.totalValue.toFixed(2)}</Td>
                  <Td muted>{s.dateAdded}</Td>
                  <td style={{ padding:"12px 14px" }}><Badge status={s.status} /></td>
                  <td style={{ padding:"12px 14px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <span style={{ fontSize:15, cursor:"pointer", color:C.textMuted }}>✏</span>
                      <span style={{ fontSize:15, cursor:"pointer", color:C.textMuted }}>🗑</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
            <colgroup>
              <col style={{width:"9%"}} /><col style={{width:"18%"}} /><col style={{width:"14%"}} />
              <col style={{width:"9%"}} /><col style={{width:"10%"}} /><col style={{width:"10%"}} />
              <col style={{width:"18%"}} /><col style={{width:"12%"}} />
            </colgroup>
            <thead>
              <tr style={{ background:"#FAF7F4", borderBottom:`1px solid ${C.border}` }}>
                {["SALE ID","MATERIAL","BATCH","KG SOLD","PRICE/KG","TOTAL","BUYER","DATE"].map(h => (
                  <TableTh key={h}>{h}</TableTh>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.scrapSales.map((s, i) => (
                <tr key={s.id} style={{ borderBottom:`1px solid ${C.borderLight}`, background: i%2===0?C.white:C.rowAlt }}>
                  <Td accent>{s.id}</Td>
                  <Td bold>{s.material}</Td>
                  <Td muted>{s.batch}</Td>
                  <Td>{s.kgSold.toFixed(1)} kg</Td>
                  <Td>₱{s.priceKg.toFixed(2)}</Td>
                  <Td bold>₱{s.total.toFixed(2)}</Td>
                  <Td>{s.buyer}</Td>
                  <Td muted>{s.date}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showConvertModal && (
        <Modal title="Convert Cut-offs to Scrap" onClose={() => setShowConvertModal(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ gridColumn:"1/-1" }}>
              <FormField label="Material Name *">
                <Select value={convForm.material} onChange={e => setConvForm(p=>({...p, material:e.target.value}))}>
                  <option value="">— Select Source Material —</option>
                  {data.inventory.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
                </Select>
              </FormField>
            </div>
            <FormField label="Weight (kg) *">
              <Input type="number" step="0.1" placeholder="0.0" value={convForm.weightKg} onChange={e => setConvForm(p=>({...p, weightKg:e.target.value}))} />
            </FormField>
            <FormField label="Price per kg (₱) *">
              <Input type="number" step="0.5" placeholder="0.00" value={convForm.pricePerKg} onChange={e => setConvForm(p=>({...p, pricePerKg:e.target.value}))} />
            </FormField>
          </div>
          {convForm.weightKg && convForm.pricePerKg && (
            <div style={{ marginTop:12, padding:10, background:"#F0F8F0", borderRadius:8 }}>
              <p style={{ margin:0, fontSize:13, color:"#1A6B2A", fontFamily:font }}>
                Estimated scrap value: <strong>₱{(parseFloat(convForm.weightKg||0) * parseFloat(convForm.pricePerKg||0)).toFixed(2)}</strong>
              </p>
            </div>
          )}
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <ActionBtn onClick={() => setShowConvertModal(false)}>Cancel</ActionBtn>
            <button onClick={handleConvert} style={{ flex:1, padding:"10px", borderRadius:8, border:"none",
              background:C.maroonBtn, color:C.white, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:font }}>
              Add to Scrap Inventory
            </button>
          </div>
        </Modal>
      )}

      {showSaleModal && (
        <Modal title="Record Scrap Sale" onClose={() => setShowSaleModal(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ gridColumn:"1/-1" }}>
              <FormField label="Select Scrap Batch *">
                <Select value={saleForm.scrapId} onChange={e => setSaleForm(p=>({...p, scrapId:e.target.value}))}>
                  <option value="">— Select —</option>
                  {data.scrap.filter(s=>s.status==="Available").map(s => (
                    <option key={s.id} value={s.id}>{s.batch} — {s.material} ({s.weightKg} kg)</option>
                  ))}
                </Select>
              </FormField>
            </div>
            <FormField label="Buyer Name *">
              <Input placeholder="Buyer" value={saleForm.buyer} onChange={e => setSaleForm(p=>({...p, buyer:e.target.value}))} />
            </FormField>
            <FormField label="Kg Sold *">
              <Input type="number" step="0.1" placeholder="0.0" value={saleForm.kgSold} onChange={e => setSaleForm(p=>({...p, kgSold:e.target.value}))} />
            </FormField>
            <div style={{ gridColumn:"1/-1" }}>
              <FormField label="Price per kg (₱) *">
                <Input type="number" step="0.5" placeholder="0.00" value={saleForm.priceKg} onChange={e => setSaleForm(p=>({...p, priceKg:e.target.value}))} />
              </FormField>
            </div>
            {saleForm.kgSold && saleForm.priceKg && (
              <div style={{ gridColumn:"1/-1", padding:10, background:"#F0F8F0", borderRadius:8 }}>
                <p style={{ margin:0, fontSize:13, color:"#1A6B2A", fontFamily:font }}>
                  Total Sale: <strong>₱{(parseFloat(saleForm.kgSold||0) * parseFloat(saleForm.priceKg||0)).toFixed(2)}</strong>
                </p>
              </div>
            )}
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <ActionBtn onClick={() => setShowSaleModal(false)}>Cancel</ActionBtn>
            <button onClick={handleSale} style={{ flex:1, padding:"10px", borderRadius:8, border:"none",
              background:C.maroonBtn, color:C.white, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:font }}>
              Confirm Scrap Sale
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PAGE 4: DELIVERY SYSTEM
═══════════════════════════════════════════════════════════════ */
const DeliveryPage = ({ data, setData }) => {
  const [activeTab, setActiveTab] = useState("Active Deliveries");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedDel, setSelectedDel] = useState(null);
  const [form, setForm] = useState({ customer:"", order:"", items:"", address:"", qty:"", date:"" });

  const active = data.deliveries.filter(d => d.status==="In Transit" || d.status==="Pending");
  const history = data.deliveries.filter(d => d.status==="Delivered" || d.status==="Cancelled");
  const tableData = activeTab === "Active Deliveries" ? active : history;
  const statuses = activeTab === "Active Deliveries" ? ["All","In Transit","Pending"] : ["All","Delivered","Cancelled"];
  const filtered = filterStatus === "All" ? tableData : tableData.filter(d => d.status === filterStatus);

  const handleRecord = async () => {
    if (!form.customer || !form.order || !form.items || !form.qty) return;
    const newDel = {
      id: `DEL-${Date.now()}`,
      customer: form.customer, 
      order_ref: form.order, 
      items: form.items,
      address: form.address, 
      qty: parseInt(form.qty), 
      date: form.date || "May 04, 2026", 
      status: "Pending",
    };
    const added = await addDelivery(newDel);
    if (added) {
      setData(p => ({ ...p, deliveries: [added, ...p.deliveries] }));
      setForm({ customer:"", order:"", items:"", address:"", qty:"", date:"" });
      setShowModal(false);
    }
  };

  const updateStatus = async (id, s) => {
    const updated = await updateDelivery(id, { status: s });
    if (updated) {
      setData(p => ({ ...p, deliveries: p.deliveries.map(d => d.id === id ? { ...d, status: s } : d) }));
      setSelectedDel(null);
    }
  };

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"28px 32px", background:C.cream }}>
      <SectionHeader title="Delivery System" sub="Subsystem 3 — Track and manage outgoing deliveries"
        action={<ActionBtn primary onClick={() => setShowModal(true)}>+ Record Delivery</ActionBtn>}
      />

      <div style={{ display:"flex", gap:14, marginBottom:22 }}>
        <StatCard label="Total Deliveries"    value={data.deliveries.length}                              sub={`${active.length} active`}      icon="📦" />
        <StatCard label="In Transit"          value={data.deliveries.filter(d=>d.status==="In Transit").length} sub="Currently moving"          icon="🚚" accent="#EDF4FF" />
        <StatCard label="Pending Dispatch"    value={data.deliveries.filter(d=>d.status==="Pending").length}    sub="Awaiting pickup"            icon="⏳" accent="#FEF3D7" />
        <StatCard label="Delivered"           value={data.deliveries.filter(d=>d.status==="Delivered").length}  sub="Successfully completed"     icon="✅" accent="#E6F4EA" />
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ display:"flex", gap:8 }}>
          {["Active Deliveries","Delivery History"].map(t => (
            <button key={t} onClick={() => { setActiveTab(t); setFilterStatus("All"); }} style={{
              padding:"8px 18px", borderRadius:8, border:"none", cursor:"pointer",
              fontSize:13, fontWeight:600, fontFamily:font,
              background: activeTab===t ? C.maroonBtn : C.white,
              color: activeTab===t ? C.white : C.textSecond,
              boxShadow: activeTab===t ? "none" : `0 0 0 1px ${C.border}`,
            }}>{t}</button>
          ))}
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <span style={{ fontSize:12, color:C.textMuted, fontFamily:font }}>Filter:</span>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding:"5px 12px", borderRadius:20, border:"none", cursor:"pointer",
              fontSize:12, fontFamily:font,
              background: filterStatus===s ? C.maroonBtn : "#EEE",
              color: filterStatus===s ? C.white : C.textSecond,
            }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
          <colgroup>
            <col style={{width:"14%"}} /><col style={{width:"15%"}} /><col style={{width:"12%"}} />
            <col style={{width:"22%"}} /><col style={{width:"6%"}} /><col style={{width:"12%"}} />
            <col style={{width:"11%"}} /><col style={{width:"8%"}} />
          </colgroup>
          <thead>
            <tr style={{ background:"#FAF7F4", borderBottom:`1px solid ${C.border}` }}>
              {["DELIVERY ID","CUSTOMER","LINKED ORDER","ITEMS","QTY","DATE","STATUS","ACTIONS"].map(h => (
                <TableTh key={h}>{h}</TableTh>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding:36, textAlign:"center", color:C.textMuted, fontSize:13, fontFamily:font }}>No deliveries found.</td></tr>
            )}
            {filtered.map((d, i) => (
              <tr key={d.id} style={{ borderBottom:`1px solid ${C.borderLight}`, background: i%2===0?C.white:C.rowAlt }}>
                <Td accent>{d.id}</Td>
                <Td bold>{d.customer}</Td>
                <Td muted>{d.order}</Td>
                <Td>{d.items}</Td>
                <Td>{d.qty}</Td>
                <Td muted>{d.date}</Td>
                <td style={{ padding:"12px 14px" }}><Badge status={d.status} /></td>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", gap:8 }}>
                    <span onClick={() => setSelectedDel(d)} style={{ fontSize:15, cursor:"pointer", color:C.textMuted }} title="Update status">✏</span>
                    <span style={{ fontSize:15, cursor:"pointer", color:C.textMuted }} title="Delete">🗑</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ margin:"10px 0 0", fontSize:12, color:C.textMuted, fontFamily:font }}>Showing {filtered.length} of {tableData.length} entries</p>

      {showModal && (
        <Modal title="Record New Delivery" onClose={() => setShowModal(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ gridColumn:"1/-1" }}>
              <FormField label="Customer Name *"><Input placeholder="Customer" value={form.customer} onChange={e => setForm(p=>({...p,customer:e.target.value}))} /></FormField>
            </div>
            <FormField label="Linked Order No. *"><Input placeholder="SO-2026-XXX" value={form.order} onChange={e => setForm(p=>({...p,order:e.target.value}))} /></FormField>
            <FormField label="Quantity *"><Input type="number" value={form.qty} onChange={e => setForm(p=>({...p,qty:e.target.value}))} /></FormField>
            <div style={{ gridColumn:"1/-1" }}>
              <FormField label="Items Description *"><Input placeholder="e.g. Full Grain Cowhide – 10 pcs" value={form.items} onChange={e => setForm(p=>({...p,items:e.target.value}))} /></FormField>
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <FormField label="Delivery Address *"><Input placeholder="Street, City" value={form.address} onChange={e => setForm(p=>({...p,address:e.target.value}))} /></FormField>
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <FormField label="Dispatch Date"><Input type="date" value={form.date} onChange={e => setForm(p=>({...p,date:e.target.value}))} /></FormField>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <ActionBtn onClick={() => setShowModal(false)}>Cancel</ActionBtn>
            <button onClick={handleRecord} style={{ flex:1, padding:"10px", borderRadius:8, border:"none",
              background:C.maroonBtn, color:C.white, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:font }}>
              Save Delivery Record
            </button>
          </div>
        </Modal>
      )}

      {selectedDel && (
        <Modal title="Update Delivery Status" onClose={() => setSelectedDel(null)} width={380}>
          <p style={{ margin:"0 0 4px", fontSize:13, fontWeight:600, color:C.textPrimary, fontFamily:font }}>{selectedDel.id}</p>
          <p style={{ margin:"0 0 16px", fontSize:12, color:C.textMuted, fontFamily:font }}>{selectedDel.customer} — {selectedDel.items}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {["Pending","In Transit","Delivered","Cancelled"].map(s => (
              <button key={s} onClick={() => updateStatus(selectedDel.id, s)} style={{
                padding:"10px 14px", borderRadius:8, cursor:"pointer", textAlign:"left",
                fontFamily:font, fontSize:13, fontWeight:500,
                border: selectedDel.status === s ? `2px solid ${C.maroonBtn}` : `1px solid ${C.border}`,
                background: selectedDel.status === s ? "#FDF0E8" : C.white,
                color: C.textPrimary, display:"flex", alignItems:"center", gap:10,
              }}>
                <Badge status={s} />
                {selectedDel.status === s && <span style={{ fontSize:12, color:C.textMuted }}>← current</span>}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PAGE 5: SUPPLIER REFERENCE
═══════════════════════════════════════════════════════════════ */
const SupplierPage = ({ data, setData }) => {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [form, setForm] = useState({ name:"", contact:"", phone:"", email:"", address:"", category:"Raw Leather", status:"Active" });

  const filtered = filterStatus === "All" ? data.suppliers : data.suppliers.filter(s => s.status === filterStatus);

  const handleAdd = async () => {
    if (!form.name) return;
    const newSup = { 
      id: `SUP-${Date.now()}`, 
      ...form, 
      rating: 3, 
      last_order: "May 04, 2026" 
    };
    const added = await addSupplier(newSup);
    if (added) {
      setData(p => ({ ...p, suppliers: [...p.suppliers, added] }));
      setForm({ name:"", contact:"", phone:"", email:"", address:"", category:"Raw Leather", status:"Active" });
      setShowModal(false);
    }
  };

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"28px 32px", background:C.cream }}>
      <SectionHeader title="Supplier Reference" sub="Manage leather and materials suppliers"
        action={<ActionBtn primary onClick={() => setShowModal(true)}>+ Add Supplier</ActionBtn>}
      />

      <div style={{ display:"flex", gap:14, marginBottom:22 }}>
        <StatCard label="Total Suppliers"  value={data.suppliers.length}                             sub="In directory"    icon="🏭" />
        <StatCard label="Active Suppliers" value={data.suppliers.filter(s=>s.status==="Active").length} sub="Currently engaged" icon="✅" accent="#E6F4EA" />
        <StatCard label="5-Star Suppliers" value={data.suppliers.filter(s=>s.rating===5).length}     sub="Top rated"       icon="⭐" accent="#FEF3D7" />
        <StatCard label="Categories"       value={new Set(data.suppliers.map(s=>s.category)).size}   sub="Material types"  icon="📂" accent="#EDF4FF" />
      </div>

      <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:16 }}>
        <span style={{ fontSize:12, color:C.textMuted, fontFamily:font }}>Filter:</span>
        {["All","Active","Inactive"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            padding:"5px 14px", borderRadius:20, border:"none", cursor:"pointer",
            fontSize:12, fontFamily:font,
            background: filterStatus===s ? C.maroonBtn : "#EEE",
            color: filterStatus===s ? C.white : C.textSecond,
          }}>{s}</button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:14 }}>
        {filtered.map(sup => (
          <div key={sup.id} onClick={() => setSelected(sup)} style={{
            background:C.white, borderRadius:12, border:`1px solid ${C.border}`,
            padding:"18px 20px", cursor:"pointer",
            borderLeft: sup.status === "Active" ? `4px solid ${C.maroonBtn}` : `4px solid #CCC`,
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <div>
                <p style={{ margin:0, fontSize:15, fontWeight:700, color:C.textPrimary, fontFamily:font }}>{sup.name}</p>
                <p style={{ margin:"2px 0 0", fontSize:12, color:C.textSecond, fontFamily:font }}>{sup.category}</p>
              </div>
              <Badge status={sup.status} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
              {[
                { label:"Contact",    val: sup.contact },
                { label:"Phone",      val: sup.phone },
                { label:"Last Order", val: sup.lastOrder },
                { label:"Rating",     val: <Stars n={sup.rating} /> },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p style={{ margin:0, fontSize:11, color:C.textMuted, fontFamily:font }}>{label}</p>
                  <p style={{ margin:"1px 0 0", fontSize:13, color:C.textPrimary, fontFamily:font }}>{val}</p>
                </div>
              ))}
            </div>
            <p style={{ margin:0, fontSize:12, color:C.textMuted, fontFamily:font }}>📍 {sup.address}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="Add New Supplier" onClose={() => setShowModal(false)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ gridColumn:"1/-1" }}>
              <FormField label="Company Name *"><Input placeholder="Company name" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} /></FormField>
            </div>
            <FormField label="Contact Person"><Input placeholder="Name" value={form.contact} onChange={e => setForm(p=>({...p,contact:e.target.value}))} /></FormField>
            <FormField label="Phone"><Input placeholder="09XX-XXX-XXXX" value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))} /></FormField>
            <FormField label="Email"><Input type="email" placeholder="email@domain.com" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} /></FormField>
            <FormField label="Category">
              <Select value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))}>
                {["Raw Leather","Bovine Leather","Premium Hides","Synthetic","Mixed"].map(c => <option key={c}>{c}</option>)}
              </Select>
            </FormField>
            <div style={{ gridColumn:"1/-1" }}>
              <FormField label="Address"><Input placeholder="Street, City" value={form.address} onChange={e => setForm(p=>({...p,address:e.target.value}))} /></FormField>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <ActionBtn onClick={() => setShowModal(false)}>Cancel</ActionBtn>
            <button onClick={handleAdd} style={{ flex:1, padding:"10px", borderRadius:8, border:"none",
              background:C.maroonBtn, color:C.white, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:font }}>
              Save Supplier
            </button>
          </div>
        </Modal>
      )}

      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {[
              { label:"Supplier ID",    val:selected.id },
              { label:"Category",       val:selected.category },
              { label:"Contact Person", val:selected.contact },
              { label:"Phone",          val:selected.phone },
              { label:"Email",          val:selected.email, full:true },
              { label:"Address",        val:selected.address, full:true },
              { label:"Status",         val:<Badge status={selected.status} /> },
              { label:"Rating",         val:<Stars n={selected.rating} /> },
              { label:"Last Order",     val:selected.lastOrder },
            ].map(({ label, val, full }) => (
              <div key={label} style={{ gridColumn: full ? "1/-1" : undefined }}>
                <p style={{ margin:"0 0 3px", fontSize:11, color:C.textMuted, fontFamily:font }}>{label}</p>
                <p style={{ margin:0, fontSize:13, color:C.textPrimary, fontFamily:font }}>{val}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PAGE 6: REPORTS
═══════════════════════════════════════════════════════════════ */
const ReportsPage = ({ data }) => {
  const [period, setPeriod] = useState("Monthly");
  const [reportTab, setReportTab] = useState("Sales Summary");

  const totalSalesRevenue = data.sales.reduce((s, x) => s + x.price, 0);
  const totalQtySold = data.sales.reduce((s, x) => s + x.qty, 0);
  const totalScrapRevenue = data.scrapSales.reduce((s, x) => s + x.total, 0);
  const totalRevenue = totalSalesRevenue + totalScrapRevenue;

  const itemSales = data.sales.reduce((acc, s) => {
    acc[s.items] = (acc[s.items] || 0) + s.price;
    return acc;
  }, {});
  const sorted = Object.entries(itemSales).sort((a,b) => b[1]-a[1]);
  const maxItemSale = sorted[0]?.[1] || 1;

  const customerSales = data.sales.reduce((acc, s) => {
    acc[s.customer] = (acc[s.customer] || { revenue:0, orders:0 });
    acc[s.customer].revenue += s.price;
    acc[s.customer].orders += 1;
    return acc;
  }, {});
  const topCustomers = Object.entries(customerSales).sort((a,b) => b[1].revenue - a[1].revenue);

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"28px 32px", background:C.cream }}>
      <SectionHeader title="Reports & Analytics" sub="Subsystem 4 — Management summaries and data insights"
        action={
          <div style={{ display:"flex", gap:6 }}>
            {["Daily","Weekly","Monthly"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding:"7px 16px", borderRadius:8, border:"none", cursor:"pointer",
                fontSize:13, fontFamily:font, fontWeight:600,
                background: period===p ? C.maroonBtn : C.white,
                color: period===p ? C.white : C.textSecond,
                boxShadow: period===p ? "none" : `0 0 0 1px ${C.border}`,
              }}>{p}</button>
            ))}
          </div>
        }
      />

      {/* Summary KPIs */}
      <div style={{ display:"flex", gap:14, marginBottom:22 }}>
        <StatCard label={`${period} Sales Revenue`}    value={`₱${totalSalesRevenue.toLocaleString("en-PH",{minimumFractionDigits:2})}`}  sub={`${data.sales.length} transactions`} icon="💰" />
        <StatCard label="Total Qty Sold"               value={totalQtySold}                                                                 sub="Pieces"                              icon="📦" accent="#EDF4FF" />
        <StatCard label="Scrap Revenue"                value={`₱${totalScrapRevenue.toFixed(2)}`}                                          sub={`${data.scrapSales.length} sales`}   icon="♻" accent="#E6F4EA" />
        <StatCard label="Total Revenue"                value={`₱${totalRevenue.toLocaleString("en-PH",{minimumFractionDigits:2})}`}         sub="Sales + Scrap combined"              icon="📈" accent="#FEF3D7" />
      </div>

      {/* Report tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:18 }}>
        {["Sales Summary","Inventory Status","Fast vs Slow Items","Top Customers"].map(t => (
          <button key={t} onClick={() => setReportTab(t)} style={{
            padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer",
            fontSize:12, fontWeight:600, fontFamily:font,
            background: reportTab===t ? C.maroonBtn : C.white,
            color: reportTab===t ? C.white : C.textSecond,
            boxShadow: reportTab===t ? "none" : `0 0 0 1px ${C.border}`,
          }}>{t}</button>
        ))}
      </div>

      {reportTab === "Sales Summary" && (
        <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.borderLight}` }}>
            <p style={{ margin:0, fontSize:14, fontWeight:600, color:C.textPrimary, fontFamily:font }}>Sales Transactions — {period}</p>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
            <colgroup>
              <col style={{width:"12%"}} /><col style={{width:"18%"}} /><col style={{width:"16%"}} />
              <col style={{width:"8%"}} /><col style={{width:"10%"}} /><col style={{width:"10%"}} /><col style={{width:"14%"}} /><col style={{width:"12%"}} />
            </colgroup>
            <thead>
              <tr style={{ background:"#FAF7F4", borderBottom:`1px solid ${C.border}` }}>
                {["ORDER ID","CUSTOMER","ITEMS","QTY","SIZE","PRICE","CUT USED","DATE"].map(h => <TableTh key={h}>{h}</TableTh>)}
              </tr>
            </thead>
            <tbody>
              {data.sales.map((s, i) => (
                <tr key={s.id} style={{ borderBottom:`1px solid ${C.borderLight}`, background: i%2===0?C.white:C.rowAlt }}>
                  <Td accent>{s.id}</Td><Td bold>{s.customer}</Td><Td>{s.items}</Td>
                  <Td>{s.qty}</Td><Td muted>{s.size}</Td>
                  <Td bold>₱{s.price.toFixed(2)}</Td><Td muted>{s.cutUsed}</Td><Td muted>{s.date}</Td>
                </tr>
              ))}
              <tr style={{ background:"#FAF7F4", borderTop:`2px solid ${C.border}` }}>
                <td colSpan={3} style={{ padding:"12px 14px", fontSize:13, fontWeight:600, color:C.textPrimary, fontFamily:font }}>TOTAL</td>
                <td style={{ padding:"12px 14px", fontSize:13, fontWeight:600, color:C.textPrimary, fontFamily:font }}>{totalQtySold}</td>
                <td colSpan={1} />
                <td style={{ padding:"12px 14px", fontSize:13, fontWeight:700, color:C.maroonBtn, fontFamily:font }}>₱{totalSalesRevenue.toFixed(2)}</td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {reportTab === "Inventory Status" && (
        <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
            <colgroup>
              <col style={{width:"6%"}} /><col style={{width:"20%"}} /><col style={{width:"10%"}} />
              <col style={{width:"10%"}} /><col style={{width:"10%"}} /><col style={{width:"12%"}} />
              <col style={{width:"14%"}} /><col style={{width:"10%"}} /><col style={{width:"8%"}} />
            </colgroup>
            <thead>
              <tr style={{ background:"#FAF7F4", borderBottom:`1px solid ${C.border}` }}>
                {["ID","NAME","TYPE","STOCK","REMAINING","VALUE","SUPPLIER","DATE IN","STATUS"].map(h => <TableTh key={h}>{h}</TableTh>)}
              </tr>
            </thead>
            <tbody>
              {data.inventory.map((item, i) => (
                <tr key={item.id} style={{ borderBottom:`1px solid ${C.borderLight}`, background: i%2===0?C.white:C.rowAlt }}>
                  <Td muted>{item.id}</Td><Td bold>{item.name}</Td><Td>{item.type}</Td>
                  <Td>{item.qty}</Td>
                  <td style={{ padding:"12px 14px", fontFamily:font, fontSize:13,
                    color: item.remaining===0 ? "#C0392B" : item.remaining<=5 ? "#D4A017" : C.textPrimary,
                    fontWeight:600 }}>{item.remaining}</td>
                  <Td bold>₱{(item.remaining * item.pricePerPc).toFixed(2)}</Td>
                  <Td muted>{item.supplier}</Td><Td muted>{item.dateIn}</Td>
                  <td style={{ padding:"12px 14px" }}><Badge status={item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportTab === "Fast vs Slow Items" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:16 }}>
          <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.border}`, padding:"20px 24px" }}>
            <p style={{ margin:"0 0 18px", fontSize:14, fontWeight:600, color:C.textPrimary, fontFamily:font }}>Revenue by Material (Fast → Slow)</p>
            {sorted.map(([name, revenue], idx) => {
              const pct = Math.round((revenue / maxItemSale) * 100);
              const label = idx === 0 ? "🔥 Fast" : idx >= sorted.length - 1 ? "🐢 Slow" : "";
              return (
                <div key={name} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:13, color:C.textPrimary, fontFamily:font, fontWeight:500 }}>{name}</span>
                      {label && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20,
                        background: idx===0 ? "#FEF3D7" : "#F0F0F0", color: idx===0 ? "#7A5200" : "#777", fontFamily:font }}>{label}</span>}
                    </div>
                    <span style={{ fontSize:13, fontWeight:600, color:C.textPrimary, fontFamily:font }}>₱{revenue.toFixed(2)}</span>
                  </div>
                  <div style={{ height:8, borderRadius:4, background:"#F0EDE8", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, borderRadius:4,
                      background: idx===0 ? C.maroonBtn : idx===sorted.length-1 ? "#CCC" : C.maroonLight }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {reportTab === "Top Customers" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
          {topCustomers.map(([customer, stats], i) => (
            <div key={customer} style={{ background:C.white, borderRadius:12, border:`1px solid ${C.border}`, padding:"18px 20px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:"#FDF0E8",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:15, fontWeight:700, color:C.maroonBtn, fontFamily:font }}>
                  {customer.charAt(0)}
                </div>
                <div>
                  <p style={{ margin:0, fontSize:14, fontWeight:700, color:C.textPrimary, fontFamily:font }}>{customer}</p>
                  <p style={{ margin:"2px 0 0", fontSize:12, color:C.textMuted, fontFamily:font }}>Rank #{i+1} customer</p>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div style={{ padding:"10px 14px", background:C.cream, borderRadius:8 }}>
                  <p style={{ margin:0, fontSize:11, color:C.textMuted, fontFamily:font }}>Total Revenue</p>
                  <p style={{ margin:"4px 0 0", fontSize:18, fontWeight:700, color:C.textPrimary, fontFamily:font }}>₱{stats.revenue.toFixed(2)}</p>
                </div>
                <div style={{ padding:"10px 14px", background:C.cream, borderRadius:8 }}>
                  <p style={{ margin:0, fontSize:11, color:C.textMuted, fontFamily:font }}>Orders</p>
                  <p style={{ margin:"4px 0 0", fontSize:18, fontWeight:700, color:C.textPrimary, fontFamily:font }}>{stats.orders}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PAGE 7: SETTINGS
═══════════════════════════════════════════════════════════════ */
const SettingsPage = () => {
  const [profile, setProfile] = useState({ name:"Josef G. Adalim", role:"Production Lead", email:"manager@ottoshoes.com.ph", branch:"Marikina City" });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const SettingSection = ({ title, children }) => (
    <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.border}`, marginBottom:18, overflow:"hidden" }}>
      <div style={{ padding:"14px 22px", borderBottom:`1px solid ${C.borderLight}`, background:"#FAF7F4" }}>
        <p style={{ margin:0, fontSize:14, fontWeight:600, color:C.textPrimary, fontFamily:font }}>{title}</p>
      </div>
      <div style={{ padding:"20px 22px" }}>{children}</div>
    </div>
  );

  const ToggleSetting = ({ label, sub, defaultOn }) => {
    const [on, setOn] = useState(defaultOn);
    return (
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.borderLight}` }}>
        <div>
          <p style={{ margin:0, fontSize:13, fontWeight:500, color:C.textPrimary, fontFamily:font }}>{label}</p>
          {sub && <p style={{ margin:"2px 0 0", fontSize:12, color:C.textMuted, fontFamily:font }}>{sub}</p>}
        </div>
        <div onClick={() => setOn(v => !v)} style={{
          width:44, height:24, borderRadius:12, background: on ? C.maroonBtn : "#DDD",
          cursor:"pointer", position:"relative", transition:"background 0.2s",
        }}>
          <div style={{ position:"absolute", top:3, left: on ? 23 : 3, width:18, height:18,
            borderRadius:"50%", background:C.white, transition:"left 0.2s" }} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"28px 32px", background:C.cream }}>
      <SectionHeader title="Settings" sub="Configure your CutWise IMS preferences" />

      <div style={{ maxWidth:700 }}>
        <SettingSection title="User Profile">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {[
              { label:"Full Name",    key:"name" },
              { label:"Role / Title", key:"role" },
              { label:"Email",        key:"email" },
              { label:"Branch",       key:"branch" },
            ].map(({ label, key }) => (
              <FormField key={key} label={label}>
                <Input value={profile[key]} onChange={e => setProfile(p => ({...p, [key]:e.target.value}))} />
              </FormField>
            ))}
          </div>
          <div style={{ marginTop:16 }}>
            <ActionBtn primary onClick={handleSave}>
              {saved ? "✓ Saved!" : "Save Changes"}
            </ActionBtn>
          </div>
        </SettingSection>

        <SettingSection title="Notifications">
          <ToggleSetting label="Low Stock Alerts" sub="Notify when inventory falls below threshold" defaultOn={true} />
          <ToggleSetting label="Delivery Status Updates" sub="Notify on delivery status changes" defaultOn={true} />
          <ToggleSetting label="New Sales Notifications" sub="Alert when a new sale is recorded" defaultOn={false} />
          <ToggleSetting label="Scrap Inventory Full" sub="Alert when scrap inventory reaches capacity" defaultOn={true} />
        </SettingSection>

        <SettingSection title="Inventory Thresholds">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <FormField label="Low Stock Threshold (pcs)"><Input type="number" defaultValue={5} /></FormField>
            <FormField label="Critical Stock Threshold (pcs)"><Input type="number" defaultValue={2} /></FormField>
            <FormField label="Default Currency"><Select defaultValue="PHP"><option>PHP</option><option>USD</option></Select></FormField>
            <FormField label="Date Format"><Select defaultValue="MMM DD, YYYY"><option>MMM DD, YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option></Select></FormField>
          </div>
        </SettingSection>

        <SettingSection title="System Information">
          {[
            { label:"System Name",    val:"CutWise IMS" },
            { label:"Version",        val:"v1.0.0 (Prototype)" },
            { label:"Client",         val:"SOG Manufacturing Corporation / OTTO Shoes" },
            { label:"Tech Stack",     val:"React + Vite · Django REST · Supabase · Tailwind CSS" },
            { label:"Last Updated",   val:"May 04, 2026" },
          ].map(({ label, val }) => (
            <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${C.borderLight}` }}>
              <span style={{ fontSize:13, color:C.textSecond, fontFamily:font }}>{label}</span>
              <span style={{ fontSize:13, fontWeight:500, color:C.textPrimary, fontFamily:font }}>{val}</span>
            </div>
          ))}
        </SettingSection>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [activePage, setActivePage] = useState("Home");
  const [data, setData] = useState({ inventory: [], scrap: [], scrapSales: [], sales: [], deliveries: [], suppliers: [] });
  const [loading, setLoading] = useState(true);

  // Fetch data from Supabase on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchAllData();
        // If all data is empty, assume Supabase failed and use seed data
        const hasData = Object.values(result).some(arr => arr.length > 0);
        if (!hasData) {
          setData(SEED);
        } else {
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch from Supabase, using seed data:', error);
        setData(SEED);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet" />
      <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:font }}>
        <Sidebar active={activePage} setActive={setActivePage} />
        {loading ? (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:C.cream }}>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:18, fontWeight:600, color:C.textPrimary, fontFamily:font, marginBottom:10 }}>Loading...</p>
              <p style={{ fontSize:14, color:C.textMuted, fontFamily:font }}>Fetching data from Supabase</p>
            </div>
          </div>
        ) : (
          <>
            {activePage === "Home" && <HomePage data={data} navigate={setActivePage} />}
            {activePage === "Inventory Management" && <InventoryPage data={data} setData={setData} />}
            {activePage === "Scrap Management" && <ScrapPage data={data} setData={setData} />}
            {activePage === "Delivery System" && <DeliveryPage data={data} setData={setData} />}
            {activePage === "Supplier Reference" && <SupplierPage data={data} setData={setData} />}
            {activePage === "Reports" && <ReportsPage data={data} />}
            {activePage === "Settings" && <SettingsPage />}
          </>
        )}
      </div>
    </>
  );
}
