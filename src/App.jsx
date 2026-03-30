import { useState, useEffect } from "react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const defaultTenants = [
  { id: 1772793791069, name: "Lorenz",                  unit: "EPK",  room: "1", amount: 2000, expiry: "2026-03-21" },
  { id: 1772793836316, name: "Justin",                  unit: "EPK",  room: "2", amount: 1500, expiry: "2026-11-30" },
  { id: 1772793883536, name: "Mathieu",                 unit: "EPK",  room: "3", amount: 1500, expiry: "2026-07-21" },
  { id: 1772793920344, name: "Clarissa",                unit: "EPK",  room: "4", amount:  800, expiry: "2027-01-13" },
  { id: 1772793952112, name: "Bala",                    unit: "EPK",  room: "5", amount: 1000, expiry: "2027-01-14" },
  { id: 2000000000001, name: "Rajpal Suveer Kamaljeet", unit: "DPVB", room: "1", amount: 2200, expiry: "2026-04-22" },
  { id: 2000000000002, name: "Chua Ker Yung",           unit: "DPVB", room: "5", amount:  950, expiry: "2026-06-27" },
  { id: 2000000000003, name: "Li Junhao",               unit: "DPVB", room: "2", amount: 1600, expiry: "2026-09-25" },
  { id: 2000000000004, name: "Hong Hanhua",             unit: "DPVB", room: "3", amount: 1400, expiry: "2026-10-10" },
  { id: 2000000000005, name: "Do Manh Dung",            unit: "DPVB", room: "4", amount: 1000, expiry: "2026-11-06" },
  { id: 2000000000006, name: "Vlasov Dmitrii",          unit: "DPVC", room: "2", amount: 1550, expiry: "2026-05-31" },
  { id: 2000000000007, name: "Wang Peng",               unit: "DPVC", room: "3", amount: 1300, expiry: "2026-11-16" },
  { id: 2000000000008, name: "Leong Siang Wai",         unit: "DPVC", room: "5", amount:  950, expiry: "2026-08-01" },
  { id: 2000000000009, name: "Wei Yizhuo",              unit: "DPVC", room: "1", amount: 2200, expiry: "2026-08-08" },
  { id: 2000000000010, name: "Liao Yizhen",             unit: "DPVC", room: "4", amount: 1000, expiry: "2026-08-23" },
];

function getKey(month, year) { return `rental-${year}-${month}`; }

function leaseStatus(expiry) {
  if (!expiry) return null;
  const today = new Date();
  today.setHours(0,0,0,0);
  const exp = new Date(expiry);
  const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0)   return { label: "EXPIRED",        color: "#dc2626", bg: "#fee2e2", border: "#fca5a5", days: diffDays };
  if (diffDays <= 30) return { label: "EXPIRING SOON",  color: "#d97706", bg: "#fef3c7", border: "#fcd34d", days: diffDays };
  return                     { label: "ACTIVE",          color: "#16a34a", bg: "#dcfce7", border: "#86efac", days: diffDays };
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function RentalTracker() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [tenants, setTenants] = useState(defaultTenants);
  const [payments, setPayments] = useState({});
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: "", unit: "", room: "", amount: "", expiry: "" });
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingExpiry, setEditingExpiry] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);

  const storageKey = getKey(selectedMonth, selectedYear);

  useEffect(() => {
    function load() {
      setLoading(true);
      try {
        const res = localStorage.getItem(storageKey);
        if (res) setPayments(JSON.parse(res));
        else setPayments({});
      } catch { setPayments({}); }
      try {
        const t = localStorage.getItem("rental-tenants");
        if (t) setTenants(JSON.parse(t));
      } catch {}
      setLoading(false);
    }
    load();
  }, [storageKey]);

  function saveTenants(updated) {
    setTenants(updated);
    localStorage.setItem("rental-tenants", JSON.stringify(updated));
  }

  function togglePayment(id) {
    const updated = { ...payments, [id]: !payments[id] };
    setPayments(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setSaveMsg("Saved ✓");
    setTimeout(() => setSaveMsg(""), 1500);
  }

  function addTenant() {
    if (!newTenant.name || !newTenant.unit) return;
    const t = { id: Date.now(), name: newTenant.name, unit: newTenant.unit, room: newTenant.room || "", amount: Number(newTenant.amount) || 0, expiry: newTenant.expiry || "" };
    saveTenants([...tenants, t]);
    setNewTenant({ name: "", unit: "", room: "", amount: "", expiry: "" });
    setShowAddTenant(false);
  }

  function removeTenant(id) {
    saveTenants(tenants.filter(t => t.id !== id));
  }

  function updateExpiry(id, expiry) {
    const updated = tenants.map(t => t.id === id ? { ...t, expiry } : t);
    saveTenants(updated);
    setEditingExpiry(null);
    setSaveMsg("Saved ✓");
    setTimeout(() => setSaveMsg(""), 1500);
  }

  function updateRoom(id, room) {
    const updated = tenants.map(t => t.id === id ? { ...t, room } : t);
    saveTenants(updated);
    setEditingRoom(null);
    setSaveMsg("Saved ✓");
    setTimeout(() => setSaveMsg(""), 1500);
  }

  const paidCount = tenants.filter(t => payments[t.id]).length;
  const expiredCount = tenants.filter(t => leaseStatus(t.expiry)?.label === "EXPIRED").length;
  const expiringSoonCount = tenants.filter(t => leaseStatus(t.expiry)?.label === "EXPIRING SOON").length;
  const totalExpected = tenants.reduce((s, t) => s + t.amount, 0);
  const totalCollected = tenants.filter(t => payments[t.id]).reduce((s, t) => s + t.amount, 0);

  const filteredTenants = tenants.filter(t => {
    if (filter === "paid")     return !!payments[t.id];
    if (filter === "unpaid")   return !payments[t.id];
    if (filter === "expired")  return leaseStatus(t.expiry)?.label === "EXPIRED";
    if (filter === "expiring") return leaseStatus(t.expiry)?.label === "EXPIRING SOON";
    return true;
  });

  const years = [selectedYear - 1, selectedYear, selectedYear + 1];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f3ef", fontFamily: "'DM Mono', 'Courier New', monospace", color: "#1a1a2e", padding: "2rem" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card { background: #ffffff; border: 1px solid #e0dbd2; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .badge-paid { background: #dcfce7; color: #16a34a; border: 1px solid #86efac; }
        .badge-unpaid { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
        .tenant-row { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.2rem; transition: background 0.2s; cursor: pointer; }
        .tenant-row:hover { background: #faf8f5; }
        .toggle { width: 44px; height: 24px; border-radius: 12px; border: none; cursor: pointer; transition: background 0.3s; position: relative; flex-shrink: 0; }
        .toggle.on { background: #22c55e; }
        .toggle.off { background: #cbd5e1; }
        .toggle::after { content: ''; position: absolute; width: 18px; height: 18px; background: white; border-radius: 50%; top: 3px; transition: left 0.3s; }
        .toggle.on::after { left: 23px; }
        .toggle.off::after { left: 3px; }
        .month-btn { padding: 0.35rem 0.7rem; border-radius: 6px; border: 1px solid #ddd6cc; background: transparent; color: #888; cursor: pointer; font-family: inherit; font-size: 0.75rem; transition: all 0.2s; }
        .month-btn.active { background: #b5872a; color: #fff; border-color: #b5872a; font-weight: 600; }
        .month-btn:hover:not(.active) { border-color: #aaa; color: #444; background: #f5f0e8; }
        .add-btn { background: #b5872a; color: #fff; border: none; border-radius: 8px; padding: 0.5rem 1.1rem; font-family: inherit; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
        .del-btn { background: transparent; border: none; color: #bbb; cursor: pointer; font-size: 1rem; padding: 0.2rem 0.4rem; border-radius: 4px; }
        .del-btn:hover { color: #dc2626; background: #fee2e2; }
        input, input[type="date"] { background: #faf8f5; border: 1px solid #ddd6cc; border-radius: 6px; color: #1a1a2e; font-family: inherit; font-size: 0.85rem; padding: 0.5rem 0.8rem; width: 100%; }
        input:focus { outline: none; border-color: #b5872a; }
        .stat-card { flex: 1; min-width: 120px; }
        .progress-bar { height: 4px; background: #e8e2d8; border-radius: 2px; overflow: hidden; margin-top: 0.5rem; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #b5872a, #22c55e); border-radius: 2px; transition: width 0.5s ease; }
        select { background: #faf8f5; border: 1px solid #ddd6cc; border-radius: 6px; color: #1a1a2e; font-family: inherit; font-size: 0.8rem; padding: 0.3rem 0.6rem; cursor: pointer; }
        .set-expiry-btn { background: transparent; border: 1px dashed #ddd6cc; border-radius: 4px; color: #bbb; cursor: pointer; font-family: inherit; font-size: 0.62rem; padding: 0.1rem 0.4rem; transition: all 0.2s; }
        .set-expiry-btn:hover { border-color: #b5872a; color: #b5872a; }
        .row-divider { border-bottom: 1px solid #f0ece5; }
        .row-divider:last-child { border-bottom: none; }
      `}</style>

      <div style={{ maxWidth: 740, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 900, color: "#b5872a", letterSpacing: "-0.5px" }}>Rent Ledger</h1>
          <p style={{ color: "#999", fontSize: "0.78rem", marginTop: "0.2rem", letterSpacing: "0.05em" }}>MONTHLY PAYMENT TRACKER</p>
        </div>

        {/* Alert Banners */}
        {(expiredCount > 0 || expiringSoonCount > 0) && (
          <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap", marginBottom: "1.2rem" }}>
            {expiredCount > 0 && (
              <div onClick={() => setFilter("expired")} style={{ flex: 1, minWidth: 200, background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "0.7rem 1rem", display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
                <span style={{ fontSize: "1.1rem" }}>⚠️</span>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#dc2626" }}>{expiredCount} Lease{expiredCount > 1 ? "s" : ""} Expired</div>
                  <div style={{ fontSize: "0.62rem", color: "#ef4444" }}>Click to view · renewal needed</div>
                </div>
              </div>
            )}
            {expiringSoonCount > 0 && (
              <div onClick={() => setFilter("expiring")} style={{ flex: 1, minWidth: 200, background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 10, padding: "0.7rem 1rem", display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
                <span style={{ fontSize: "1.1rem" }}>🔔</span>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#d97706" }}>{expiringSoonCount} Expiring Within 30 Days</div>
                  <div style={{ fontSize: "0.62rem", color: "#f59e0b" }}>Click to view · contact tenant</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Month/Year Selector */}
        <div className="card" style={{ padding: "1rem 1.2rem", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            {MONTHS.map((m, i) => (
              <button key={m} className={`month-btn ${selectedMonth === i ? "active" : ""}`} onClick={() => setSelectedMonth(i)}>{m}</button>
            ))}
          </div>
          {saveMsg && <span style={{ color: "#16a34a", fontSize: "0.75rem", marginLeft: "auto" }}>{saveMsg}</span>}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.2rem", flexWrap: "wrap" }}>
          {[
            { label: "COLLECTED",   value: `$${totalCollected.toLocaleString()}`,              sub: `of $${totalExpected.toLocaleString()}` },
            { label: "PAID",        value: `${paidCount} / ${tenants.length}`,                 sub: "tenants" },
            { label: "OUTSTANDING", value: `$${(totalExpected - totalCollected).toLocaleString()}`, sub: "remaining" },
          ].map(s => (
            <div key={s.label} className="card stat-card" style={{ padding: "1rem 1.2rem" }}>
              <div style={{ fontSize: "0.62rem", letterSpacing: "0.1em", color: "#aaa", marginBottom: "0.3rem" }}>{s.label}</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 500, color: s.label === "OUTSTANDING" && (totalExpected - totalCollected) > 0 ? "#dc2626" : "#1a1a2e" }}>{s.value}</div>
              <div style={{ fontSize: "0.72rem", color: "#aaa" }}>{s.sub}</div>
              {s.label === "PAID" && (
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${tenants.length ? (paidCount / tenants.length) * 100 : 0}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tenant List */}
        <div className="card" style={{ marginBottom: "1.2rem", overflow: "hidden" }}>

          {/* Filter Tabs + Add Button */}
          <div style={{ padding: "0.8rem 1.2rem", borderBottom: "1px solid #f0ece5", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              {[
                { key: "all",      label: `All (${tenants.length})`,                   activeColor: "#b5872a" },
                { key: "paid",     label: `✓ Paid (${paidCount})`,                     activeColor: "#16a34a" },
                { key: "unpaid",   label: `✗ Unpaid (${tenants.length - paidCount})`,  activeColor: "#dc2626" },
                { key: "expiring", label: `🔔 Soon (${expiringSoonCount})`,             activeColor: "#d97706" },
                { key: "expired",  label: `⚠️ Expired (${expiredCount})`,               activeColor: "#991b1b" },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{
                  padding: "0.28rem 0.7rem", borderRadius: 6, border: "1px solid",
                  fontFamily: "inherit", fontSize: "0.7rem", cursor: "pointer", fontWeight: filter === f.key ? 600 : 400,
                  background: filter === f.key ? f.activeColor : "transparent",
                  color: filter === f.key ? "#fff" : "#888",
                  borderColor: filter === f.key ? f.activeColor : "#ddd6cc",
                  transition: "all 0.2s",
                }}>{f.label}</button>
              ))}
            </div>
            <button className="add-btn" onClick={() => setShowAddTenant(v => !v)}>+ Add Tenant</button>
          </div>

          {/* Add Tenant Form */}
          {showAddTenant && (
            <div style={{ padding: "1rem 1.2rem", borderBottom: "1px solid #f0ece5", background: "#faf8f5", display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: 2, minWidth: 110 }}>
                <div style={{ fontSize: "0.65rem", color: "#aaa", marginBottom: 4 }}>NAME</div>
                <input placeholder="Jane Doe" value={newTenant.name} onChange={e => setNewTenant(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div style={{ flex: 1, minWidth: 60 }}>
                <div style={{ fontSize: "0.65rem", color: "#aaa", marginBottom: 4 }}>UNIT</div>
                <input placeholder="1A" value={newTenant.unit} onChange={e => setNewTenant(p => ({ ...p, unit: e.target.value }))} />
              </div>
              <div style={{ flex: 1, minWidth: 60 }}>
                <div style={{ fontSize: "0.65rem", color: "#aaa", marginBottom: 4 }}>ROOM NO.</div>
                <input placeholder="101" value={newTenant.room} onChange={e => setNewTenant(p => ({ ...p, room: e.target.value }))} />
              </div>
              <div style={{ flex: 1, minWidth: 85 }}>
                <div style={{ fontSize: "0.65rem", color: "#aaa", marginBottom: 4 }}>RENT ($)</div>
                <input placeholder="1200" type="number" value={newTenant.amount} onChange={e => setNewTenant(p => ({ ...p, amount: e.target.value }))} />
              </div>
              <div style={{ flex: 1, minWidth: 130 }}>
                <div style={{ fontSize: "0.65rem", color: "#aaa", marginBottom: 4 }}>LEASE EXPIRY</div>
                <input type="date" value={newTenant.expiry} onChange={e => setNewTenant(p => ({ ...p, expiry: e.target.value }))} />
              </div>
              <button className="add-btn" onClick={addTenant}>Save</button>
            </div>
          )}

          {/* Tenant Rows */}
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#999", fontSize: "0.8rem" }}>Loading…</div>
          ) : filteredTenants.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#999", fontSize: "0.8rem" }}>
              {tenants.length === 0   ? "No tenants yet. Add one above."
                : filter === "unpaid"  ? "🎉 All tenants have paid!"
                : filter === "expired" ? "✅ No expired leases."
                : filter === "expiring"? "✅ No leases expiring soon."
                : "No paid tenants yet."}
            </div>
          ) : filteredTenants.map(tenant => {
            const paid = !!payments[tenant.id];
            const status = leaseStatus(tenant.expiry);
            const isEditingThis = editingExpiry === tenant.id;

            return (
              <div key={tenant.id} className="row-divider">
                <div className="tenant-row" onClick={() => togglePayment(tenant.id)}>
                  <button className={`toggle ${paid ? "on" : "off"}`} onClick={e => { e.stopPropagation(); togglePayment(tenant.id); }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "#1a1a2e" }}>{tenant.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "#aaa", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.2rem" }}>
                      <span>Unit {tenant.unit}</span>
                      {/* Room number — click to edit */}
                      <span style={{ color: "#ddd" }}>·</span>
                      {editingRoom === tenant.id ? (
                        <span onClick={e => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          <input
                            defaultValue={tenant.room}
                            placeholder="e.g. 101"
                            style={{ width: 70, fontSize: "0.7rem", padding: "0.15rem 0.4rem" }}
                            onBlur={e => updateRoom(tenant.id, e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter") updateRoom(tenant.id, e.target.value);
                              if (e.key === "Escape") setEditingRoom(null);
                            }}
                            autoFocus
                          />
                          <span style={{ fontSize: "0.6rem", color: "#bbb" }}>↵ save · Esc cancel</span>
                        </span>
                      ) : tenant.room ? (
                        <span
                          title="Click to edit room number"
                          onClick={e => { e.stopPropagation(); setEditingRoom(tenant.id); }}
                          style={{ background: "#f0ece5", color: "#888", borderRadius: 4, padding: "0.05rem 0.4rem", fontSize: "0.62rem", fontWeight: 600, cursor: "pointer", border: "1px dashed transparent", transition: "all 0.2s" }}
                          onMouseEnter={e => { e.target.style.borderColor = "#b5872a"; e.target.style.color = "#b5872a"; }}
                          onMouseLeave={e => { e.target.style.borderColor = "transparent"; e.target.style.color = "#888"; }}
                        >
                          Room {tenant.room} ✎
                        </span>
                      ) : (
                        <button className="set-expiry-btn" onClick={e => { e.stopPropagation(); setEditingRoom(tenant.id); }}>
                          + Room no.
                        </button>
                      )}
                      <span style={{ color: "#ddd" }}>·</span>

                      {/* Expiry badge / edit */}
                      {isEditingThis ? (
                        <span onClick={e => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          <input
                            type="date"
                            defaultValue={tenant.expiry}
                            style={{ width: 130, fontSize: "0.7rem", padding: "0.15rem 0.4rem" }}
                            onBlur={e => updateExpiry(tenant.id, e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter") updateExpiry(tenant.id, e.target.value);
                              if (e.key === "Escape") setEditingExpiry(null);
                            }}
                            autoFocus
                          />
                          <span style={{ fontSize: "0.6rem", color: "#bbb" }}>↵ save · Esc cancel</span>
                        </span>
                      ) : status ? (
                        <span
                          title="Click to edit expiry date"
                          onClick={e => { e.stopPropagation(); setEditingExpiry(tenant.id); }}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "0.25rem",
                            fontSize: "0.62rem", padding: "0.1rem 0.45rem", borderRadius: 4,
                            background: status.bg, color: status.color, border: `1px solid ${status.border}`,
                            fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          {status.label === "ACTIVE"
                            ? `📋 Expires ${formatDate(tenant.expiry)}`
                            : status.label === "EXPIRING SOON"
                            ? `⚡ ${status.days}d left · ${formatDate(tenant.expiry)}`
                            : `❌ Expired ${formatDate(tenant.expiry)}`}
                        </span>
                      ) : (
                        <button className="set-expiry-btn" onClick={e => { e.stopPropagation(); setEditingExpiry(tenant.id); }}>
                          + Set lease expiry
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: "right", marginRight: "0.5rem", flexShrink: 0 }}>
                    <div style={{ fontSize: "0.95rem", color: "#b5872a" }}>${tenant.amount.toLocaleString()}</div>
                    <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.5rem", borderRadius: 4 }} className={paid ? "badge-paid" : "badge-unpaid"}>
                      {paid ? "PAID" : "UNPAID"}
                    </span>
                  </div>

                  <button className="del-btn" onClick={e => { e.stopPropagation(); removeTenant(tenant.id); }}>✕</button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: "0.65rem", color: "#bbb", textAlign: "center" }}>
          Click a row or toggle to mark payment · Click room or expiry to edit · Data saved automatically
        </div>
      </div>
    </div>
  );
}
