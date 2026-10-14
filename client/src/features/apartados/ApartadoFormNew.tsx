import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useConfig } from "../../api/config";
import { useProducts } from "../../api/products";
import { buildApartadoBody } from "../../api/apartados";
import { formatCurrency } from "../../lib/format";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { Field } from "../../components/forms";
import CustomerSelect from "../../features/customer/CustomerSelect";

function validate(values: { customerId: string; productId: string; units: string; agreedPrice: string; dueDate: string }) {
  if (!values.customerId) return "Debe seleccionar un cliente.";
  if (!values.productId) return "Debe seleccionar un producto.";
  if (!Number.isInteger(Number(values.units)) || Number(values.units) <= 0) return "Las unidades deben ser un número entero mayor a cero.";
  if (!Number.isFinite(Number(values.agreedPrice)) || Number(values.agreedPrice) <= 0) return "El precio acordado debe ser un número mayor a cero.";
  if (!values.dueDate) return "La fecha de vencimiento es obligatoria.";
  return null;
}

export default function ApartadoForm({ onSubmit, onCancel, prefillProductId }: { onSubmit: (data: any) => Promise<void>; onCancel: () => void; prefillProductId?: string | null }) {
  const { data: configData } = useConfig();
  const config = configData ?? { currencySymbol: "$", currencyLocale: "es-AR" };
  const { data: products = [] } = useProducts({});
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState(prefillProductId || "");
  const [units, setUnits] = useState("");
  const [agreedPrice, setAgreedPrice] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto-fill agreedPrice with product's catalog price when product changes
  useEffect(() => {
    if (productId) {
      const product = products.find(p => p.id === productId);
      if (product?.price) {
        setAgreedPrice(String(product.price));
      }
    } else {
      setAgreedPrice("");
    }
  }, [productId, products]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const values = { customerId, productId, units, agreedPrice, dueDate };
    const validationError = validate(values);
    if (validationError) { setError(validationError); return; }
    setSubmitting(true);
    try { await onSubmit(buildApartadoBody(values)); navigate("/apartados"); }
    catch (err) { setError(err instanceof Error ? err.message : "Ocurrió un error inesperado."); setSubmitting(false); }
  }

  return (
    <div style={{ padding: "var(--space-4) 0", maxWidth: "48rem" }}>
      <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "var(--text-2xl)" }}>Nuevo apartado</h2>
        <Button variant="secondary" onClick={onCancel}>Volver</Button>
      </header>
      {error && <div className="alert alert-error mb-4" role="alert"><span>{error}</span></div>}
      <Card>
        <form onSubmit={handleSubmit} noValidate>
          <div className="card-body">
            <CustomerSelect initialCustomerId={customerId} onSelect={setCustomerId} allowCreate={true} />
            <Field label="Producto" required>
              <select value={productId} onChange={(e) => setProductId(e.target.value)} disabled={submitting} className="input select" required>
                <option value="">Seleccionar…</option>
                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.available_units} disp.)</option>)}
              </select>
            </Field>
            <div className="form-row" style={{ gap: "var(--space-3)" }}>
              <Field label="Unidades" required style={{ flex: 1 }}>
                <Input type="number" min="1" step="1" value={units} onChange={(e) => setUnits(e.target.value)} disabled={submitting} placeholder="1" required />
              </Field>
              <Field label="Precio acordado (total)" required style={{ flex: 1 }}>
                <Input type="number" min="0.01" step="0.01" value={agreedPrice} onChange={(e) => setAgreedPrice(e.target.value)} disabled={submitting} placeholder="0.00" required />
              </Field>
            </div>
            <Field label="Fecha de vencimiento" required>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={submitting} required />
            </Field>
          </div>
          <div className="card-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", paddingTop: "var(--space-4)" }}>
            <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>{submitting ? <><Spinner style={{ width: "16px", height: "16px", borderWidth: "2px" }} /> Guardando…</> : "Guardar"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}