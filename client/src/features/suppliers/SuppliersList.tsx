import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useConfig } from "../../api/config";
import { useSuppliers } from "../../api/suppliers";
import { useSupplierDebtMutations, useSupplierDebts, useSupplierDebtsDue } from "../../api/supplier-debts";
import { formatCurrency, formatDate } from "../../lib/format";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { Card } from "../../components/ui/Card";
import { Chip } from "../../components/ui/Chip";

const STATUS_FILTERS = [
  ["", "Todos los estados"],
  ["open", "Abiertas"],
  ["closed", "Cerradas"],
];

const HORIZON_OPTIONS = [7, 15, 30, 60];

const DEBT_STATUS_CHIP_MAP = { open: "warning", closed: "neutral" };
const DUE_FLAG_CHIP_MAP = { overdue: "danger", soon: "info" };

export default function SuppliersList() {
  const { data: configData } = useConfig();
  const config = configData ?? { currencySymbol: "$", currencyLocale: "es-AR" };
  const { create, pay } = useSupplierDebtMutations();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [horizonDays, setHorizonDays] = useState(7);
  const [formOpen, setFormOpen] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const { data: suppliers = [], isPending: suppliersPending } = useSuppliers(search);
  const { data: debts = [], isPending: debtsPending } = useSupplierDebts(status);
  const { data: due = [], isPending: duePending } = useSupplierDebtsDue(horizonDays);

  async function handleCreate(body: any) {
    setBannerError(null);
    await create(body);
    setFormOpen(false);
  }

  async function handlePay(debt: any, amount: number) {
    setBannerError(null);
    try {
      await pay(debt.id, amount);
      setPayingId(null);
    } catch (err) {
      throw err;
    }
  }

  const filteredSuppliers = suppliers.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section style={{ padding: "var(--space-4) 0" }}>
      <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "var(--text-2xl)" }}>Proveedores</h2>
        <Button onClick={() => setFormOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ marginRight: "var(--space-1)" }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva deuda
        </Button>
      </header>

      {bannerError && (
        <div className="alert alert-error mb-4" role="alert"><span>{bannerError}</span></div>
      )}

      <div className="flex flex-wrap gap-3 mb-4" style={{ alignItems: "flex-end" }}>
        <div className="form-row" style={{ flex: 1, minWidth: "200px", flexDirection: "column", gap: "var(--space-1)" }}>
          <label htmlFor="suppliers-search" className="label">Proveedor</label>
          <Input id="suppliers-search" type="search" placeholder="Buscar…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="form-row" style={{ flexDirection: "column", gap: "var(--space-1)", minWidth: "160px" }}>
          <label htmlFor="suppliers-status" className="label">Estado</label>
          <select id="suppliers-status" value={status} onChange={(e) => setStatus(e.target.value)} className="input select">
            {STATUS_FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </div>

      {suppliersPending ? (
        <div className="loading"><Spinner /> Cargando proveedores…</div>
      ) : filteredSuppliers.length === 0 ? (
        <p className="empty-state mb-4">Sin proveedores registrados.</p>
      ) : (
        <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Proveedores">
          {filteredSuppliers.map((supplier: any) => (
            <span key={supplier.id} className="chip chip-success" title={supplier.name} role="listitem" style={{ maxWidth: "288px" }}>
              {supplier.name}
            </span>
          ))}
        </div>
      )}

      <h3 className="mb-3" style={{ fontSize: "var(--text-lg)" }}>Deudas de proveedores</h3>

      {debtsPending ? (
        <p className="loading">Cargando deudas…</p>
      ) : debts.length === 0 ? (
        <p className="empty-state mb-6">No hay deudas que coincidan con el filtro.</p>
      ) : (
        <Card style={{ overflow: "hidden", marginBottom: "var(--space-6)" }}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Proveedor</th>
                  <th scope="col">Monto</th>
                  <th scope="col">Saldo</th>
                  <th scope="col">Vencimiento</th>
                  <th scope="col">Estado</th>
                  <th scope="col" style={{ width: "120px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {debts.map((debt: any) => (
                  <DebtRow key={debt.id} debt={debt} config={config} paying={payingId === debt.id} onPayClick={() => { setBannerError(null); setPayingId(debt.id); }} onCancelPay={() => setPayingId(null)} onSubmitPay={handlePay} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <h3 className="mb-3" style={{ fontSize: "var(--text-lg)" }}>Próximos vencimientos</h3>
      <div className="flex flex-wrap gap-3 mb-4" style={{ alignItems: "flex-end" }}>
        <div className="form-row" style={{ flexDirection: "column", gap: "var(--space-1)", minWidth: "140px" }}>
          <label htmlFor="suppliers-horizon" className="label">Horizonte</label>
          <select id="suppliers-horizon" value={horizonDays} onChange={(e) => setHorizonDays(Number(e.target.value))} className="input select">
            {HORIZON_OPTIONS.map((days) => <option key={days} value={days}>{days} días</option>)}
          </select>
        </div>
      </div>

      {duePending ? (
        <p className="loading">Cargando vencimientos…</p>
      ) : due.length === 0 ? (
        <p className="empty-state mb-6">No hay vencimientos en el horizonte.</p>
      ) : (
        <Card style={{ overflow: "hidden" }}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Proveedor</th>
                  <th scope="col">Monto</th>
                  <th scope="col">Saldo</th>
                  <th scope="col">Vencimiento</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {due.map((debt: any) => (
                  <tr key={debt.id}>
                    <td style={{ fontWeight: "var(--font-weight-medium)" }}>{debt.supplier_name}</td>
                    <td>{formatCurrency(debt.amount, config)}</td>
                    <td>{formatCurrency(debt.balance, config)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDate(debt.due_date, config)}</td>
                    <td>
                      <Chip variant={debt.overdue ? "danger" : "info"}>
                        {debt.overdue ? "Vencida" : "Próxima"}
                      </Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {formOpen && (
        <SupplierDebtForm suppliers={suppliers} onSubmit={handleCreate} onCancel={() => setFormOpen(false)} />
      )}
    </section>
  );
}

function DebtRow({ debt, config, paying, onPayClick, onCancelPay, onSubmitPay }: any) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) { setError("El monto debe ser un número mayor a cero."); return; }
    if (value > debt.balance) { setError("El pago supera el saldo restante de la deuda."); return; }
    setSubmitting(true);
    try { await onSubmitPay(debt, value); setAmount(""); }
    catch (err) { setError(err instanceof Error ? err.message : "Ocurrió un error inesperado."); }
    finally { setSubmitting(false); }
  }

  if (paying) {
    return (
      <tr style={{ background: "var(--color-surface-hover)" }}>
        <td colSpan={6} style={{ padding: 0 }}>
          <form className="flex flex-wrap gap-3 p-3" style={{ alignItems: "flex-end" }} onSubmit={handleSubmit}>
            <div className="form-row" style={{ flex: 1, minWidth: "200px", flexDirection: "column", gap: "var(--space-1)" }}>
              <label htmlFor={`pay-${debt.id}`} className="label">Importe del pago</label>
              <Input id={`pay-${debt.id}`} type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required disabled={submitting} autoFocus />
            </div>
            {error && <p className="form-error" role="alert" style={{ flexBasis: "100%" }}>{error}</p>}
            <div className="form-actions" style={{ marginLeft: "auto" }}>
              <Button type="submit" disabled={submitting}>{submitting ? "Guardando…" : "Registrar pago"}</Button>
              <Button type="button" variant="secondary" onClick={onCancelPay} disabled={submitting}>Cancelar</Button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td style={{ fontWeight: "var(--font-weight-medium)" }}>{debt.supplier_name}</td>
      <td>{formatCurrency(debt.amount, config)}</td>
      <td>{formatCurrency(debt.balance, config)}</td>
      <td style={{ whiteSpace: "nowrap" }}>{formatDate(debt.due_date, config)}</td>
      <td><Chip variant={DEBT_STATUS_CHIP_MAP[debt.status] || "neutral"}>{debt.status === "open" ? "Abierta" : "Cerrada"}</Chip></td>
      <td>{debt.status === "open" && <Button type="button" size="sm" onClick={onPayClick}>Pagar</Button>}</td>
    </tr>
  );
}

function SupplierDebtForm({ suppliers, onSubmit, onCancel }: any) {
  const [supplierName, setSupplierName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!supplierName.trim()) { setError("El nombre del proveedor es obligatorio."); return; }
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) { setError("El monto debe ser un número mayor a cero."); return; }
    if (!dueDate) { setError("La fecha de vencimiento es obligatoria."); return; }
    setSubmitting(true);
    try { await onSubmit({ supplierName, amount, dueDate }); setSupplierName(""); setAmount(""); setDueDate(""); }
    catch (err) { setError(err instanceof Error ? err.message : "Ocurrió un error inesperado."); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Nueva deuda de proveedor">
      <form id="supplier-debt-form" className="modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h3 className="modal-title">Nueva deuda de proveedor</h3>
          <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={submitting} aria-label="Cerrar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></Button>
        </div>
        <div className="modal-body">
          {error && <p className="form-error" role="alert">{error}</p>}
          <label htmlFor="supplier-name" className="label">Nombre del proveedor
            <Input id="supplier-name" type="text" list="suppliers-list" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} required disabled={submitting} autoFocus />
            <datalist id="suppliers-list">{suppliers.map((s: any) => <option key={s.id} value={s.name} />)}</datalist>
          </label>
          <p className="form-hint">Si el proveedor no existe, se crea automáticamente al registrar la deuda.</p>
          <div className="form-row" style={{ gap: "var(--space-3)" }}>
            <label htmlFor="supplier-debt-amount" className="label" style={{ flex: 1 }}>Monto <Input id="supplier-debt-amount" type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required disabled={submitting} /></label>
            <label htmlFor="supplier-debt-due" className="label" style={{ flex: 1 }}>Fecha de vencimiento <Input id="supplier-debt-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required disabled={submitting} /></label>
          </div>
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>Cancelar</Button>
          <Button type="submit" disabled={submitting}>{submitting ? <><Spinner style={{ width: "16px", height: "16px", borderWidth: "2px" }} /> Guardando…</> : "Registrar deuda"}</Button>
        </div>
      </form>
    </div>
  );
}