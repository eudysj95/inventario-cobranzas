import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConfig } from "../../api/config";
import { useCustomers, useCustomer } from "../../api/customers";
import { buildPaymentBody, usePaymentMutations } from "../../api/payments";
import { formatCurrency, formatDate } from "../../lib/format";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { Chip } from "../../components/ui/Chip";
import { Field } from "../../components/forms";

export default function PaymentForm({ onCancel }: { onCancel: () => void }) {
  const { data: configData } = useConfig();
  const config = configData ?? { currencySymbol: "$", currencyLocale: "es-AR" };
  const { data: customers = [], isPending: customersPending } = useCustomers("");
  const { create } = usePaymentMutations();
  const navigate = useNavigate();

  const [customerId, setCustomerId] = useState("");
  const { data: detail, isPending: detailPending, isError: detailError } = useCustomer(customerId || null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const openDebts = detail?.open_debts ?? [];
  const totalOpen = openDebts.reduce((sum: number, debt: any) => sum + Number(debt.balance), 0);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) { setError("El monto debe ser un número mayor a cero."); return; }
    if (openDebts.length === 0) { setError("El cliente no tiene deudas abiertas."); return; }
    if (Math.round(value * 100) > Math.round(totalOpen * 100)) { setError("El pago supera el saldo total del cliente."); return; }
    setSubmitting(true);
    try { const res = await create(buildPaymentBody(customerId, value, note)); setResult(res); setAmount(""); setNote(""); }
    catch (err) { setError(err instanceof Error ? err.message : "Ocurrió un error inesperado."); }
    finally { setSubmitting(false); }
  }

  return (
    <section style={{ padding: "var(--space-4) 0" }}>
      <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "var(--text-2xl)" }}>Cobros</h2>
        <Button variant="secondary" onClick={onCancel}>Volver</Button>
      </header>

      <form onSubmit={(e) => e.preventDefault()} className="mb-4">
        <div className="form-row" style={{ flex: 1, minWidth: "280px", flexDirection: "column", gap: "var(--space-1)", maxWidth: "384px" }}>
          <label htmlFor="payments-customer" className="label">Cliente</label>
          <select id="payments-customer" value={customerId} onChange={(e) => { setCustomerId(e.target.value); setError(null); setResult(null); }} disabled={customersPending} className="input select">
            <option value="">Seleccionar…</option>
            {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name} — saldo {formatCurrency(c.open_balance, config)}</option>)}
          </select>
        </div>
      </form>

      {customerId && detailPending && <p className="loading">Cargando deudas del cliente…</p>}
      {customerId && detailError && <p className="alert alert-error" role="alert">No se pudieron cargar las deudas del cliente.</p>}

      {customerId && !detailPending && !detailError && (
        <Card style={{ maxWidth: "48rem" }}>
          <div className="card-body">
            {openDebts.length === 0 ? <p className="empty-state">El cliente no tiene deudas abiertas.</p> : (
              <>
                <div className="table-wrap mb-4">
                  <table className="table">
                    <thead><tr><th scope="col">Producto</th><th scope="col">Unidades</th><th scope="col">Monto</th><th scope="col">Saldo</th><th scope="col">Vencimiento</th></tr></thead>
                    <tbody>
                      {openDebts.map((debt: any) => (
                        <tr key={debt.id}>
                          <td>{debt.product_name}</td><td>{debt.units}</td><td>{formatCurrency(debt.amount, config)}</td>
                          <td>{formatCurrency(debt.balance, config)}</td>
                          <td style={{ whiteSpace: "nowrap" }}>{debt.due_date ? formatDate(debt.due_date, config) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot><tr><td colSpan={3} style={{ fontWeight: "var(--font-weight-semibold)" }}>Saldo total pendiente</td><td style={{ fontWeight: "var(--font-weight-semibold)" }}>{formatCurrency(totalOpen, config)}</td><td /></tr></tfoot>
                  </table>
                </div>
                {openDebts.length > 0 && (
                  <form className="card p-4" style={{ background: "var(--color-surface-hover)", borderRadius: "var(--radius-md)", maxWidth: "384px" }} onSubmit={handleSubmit}>
                    <h3 className="mb-3" style={{ fontSize: "var(--text-lg)" }}>Registrar pago (abono)</h3>
                    {error && <p className="form-error mb-3" role="alert">{error}</p>}
                    <div className="form-row" style={{ gap: "var(--space-3)", flexDirection: "column" }}>
                      <Field label="Monto" required>
                        <Input id="payments-amount" type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required disabled={submitting} />
                      </Field>
                      <Field label="Nota (opcional)">
                        <Input id="payments-note" type="text" value={note} onChange={(e) => setNote(e.target.value)} disabled={submitting} />
                      </Field>
                    </div>
                    <div className="form-actions mt-3" style={{ marginLeft: "auto" }}>
                      <Button type="submit" disabled={submitting}>{submitting ? <><Spinner style={{ width: "16px", height: "16px", borderWidth: "2px" }} /> Guardando…</> : "Registrar pago"}</Button>
                    </div>
                  </form>
                )}
                {result && <AllocationsResult result={result} debts={openDebts} config={config} />}
              </>
            )}
          </div>
        </Card>
      )}
    </section>
  );
}

function AllocationsResult({ result, debts, config }: { result: any; debts: any[]; config: any }) {
  const byId = new Map(debts.map((d) => [d.id, d]));
  return (
    <div className="card mt-4 alert alert-success" style={{ maxWidth: "32rem" }} role="status">
      <div className="card-body">
        <h3 className="mb-2">Pago registrado</h3>
        <p className="mb-2">{formatCurrency(result.payment.amount, config)} aplicado a {result.allocations.length} {result.allocations.length === 1 ? "deuda" : "deudas"} (FIFO).</p>
        <ul style={{ margin: 0, paddingLeft: "var(--space-5)" }}>
          {result.allocations.map((alloc: any) => {
            const debt = byId.get(alloc.debt_id);
            return <li key={alloc.debt_id}>{debt ? debt.product_name : "Deuda"} — {formatCurrency(alloc.amount, config)}</li>;
          })}
        </ul>
      </div>
    </div>
  );
}