import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConfig } from "../../api/config";
import { useProducts } from "../../api/products";
import { formatCurrency } from "../../lib/format";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { Field } from "../../components/forms";
import CustomerSelect from "../../features/customer/CustomerSelect";

const EMPTY_LINE = { productId: "", units: "", price: undefined };

function validate(values: { customerId: string; lines: any[] }) {
  if (!values.customerId) return "Debe seleccionar un cliente.";
  for (const [i, line] of values.lines.entries()) {
    if (!line.productId) return `La línea ${i + 1} debe tener un producto.`;
    if (!Number.isInteger(Number(line.units)) || Number(line.units) <= 0) {
      return `La línea ${i + 1} debe tener unidades enteras mayores a cero.`;
    }
  }
  return null;
}

export default function CashSaleForm({ onSubmit, onCancel, prefillProductId }: { onSubmit: (data: any) => Promise<void>; onCancel: () => void; prefillProductId?: string | null }) {
  const { data: configData } = useConfig();
  const config = configData ?? { currencySymbol: "$", currencyLocale: "es-AR" };
  const { data: products = [] } = useProducts({});
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState([{ ...EMPTY_LINE, productId: prefillProductId || "" }]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateLine(index: number, field: string, value: any) {
    setLines((prev) => prev.map((line, i) => i === index ? { ...line, [field]: field === "units" ? (value === "" ? "" : Number(value)) : field === "price" ? (value === "" || value === null ? undefined : Number(value)) : value } : line));
  }

  function addLine() { setLines((prev) => [...prev, { ...EMPTY_LINE }]); }
  function removeLine(index: number) { setLines((prev) => prev.filter((_, i) => i !== index)); }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const values = { customerId, lines };
    const validationError = validate(values);
    if (validationError) { setError(validationError); return; }
    setSubmitting(true);
    try { await onSubmit(values); navigate("/venta"); }
    catch (err) { setError(err instanceof Error ? err.message : "Ocurrió un error inesperado."); setSubmitting(false); }
  }

  return (
    <div style={{ padding: "var(--space-4) 0", maxWidth: "48rem" }}>
      <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "var(--text-2xl)" }}>Venta de contado</h2>
        <Button variant="secondary" onClick={onCancel}>Volver</Button>
      </header>
      {error && <div className="alert alert-error mb-4" role="alert"><span>{error}</span></div>}
      <Card>
        <form onSubmit={handleSubmit} noValidate>
          <div className="card-body">
            <CustomerSelect initialCustomerId={customerId} onSelect={setCustomerId} allowCreate={true} />
            <div style={{ marginTop: "var(--space-4)" }}>
              <h3 className="mb-3" style={{ fontSize: "var(--text-lg)" }}>Líneas</h3>
              {lines.map((line, index) => (
                <div key={index} className="card p-3 mb-3" style={{ border: "1px solid var(--color-border)" }}>
                  <div className="form-row" style={{ gap: "var(--space-3)", flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div className="form-row" style={{ flex: "1 1 200px", flexDirection: "column", gap: "var(--space-1)" }}>
                      <label className="label">Producto</label>
                      <select value={line.productId} onChange={(e) => updateLine(index, "productId", e.target.value)} disabled={submitting} className="input select">
                        <option value="">Seleccionar…</option>
                        {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.available_units} disp.)</option>)}
                      </select>
                    </div>
                    <div className="form-row" style={{ flex: "0 1 100px", flexDirection: "column", gap: "var(--space-1)" }}>
                      <label className="label">Unidades</label>
                      <Input type="number" min="1" step="1" value={line.units} onChange={(e) => updateLine(index, "units", e.target.value)} disabled={submitting} />
                    </div>
                    <div className="form-row" style={{ flex: "1 1 140px", flexDirection: "column", gap: "var(--space-1)" }}>
                      <label className="label">Precio (opcional)</label>
                      <Input type="number" min="0.01" step="0.01" placeholder="Catálogo" value={line.price ?? ""} onChange={(e) => updateLine(index, "price", e.target.value)} disabled={submitting} />
                    </div>
                    <Button type="button" variant="danger" size="sm" onClick={() => removeLine(index)} disabled={submitting || lines.length === 1} aria-label={`Quitar línea ${index + 1}`}>Quitar</Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="secondary" size="sm" onClick={addLine} disabled={submitting}>Agregar línea</Button>
            </div>
          </div>
          <div className="card-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", paddingTop: "var(--space-4)" }}>
            <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>{submitting ? <><Spinner style={{ width: "16px", height: "16px", borderWidth: "2px" }} /> Guardando…</> : "Registrar venta"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}