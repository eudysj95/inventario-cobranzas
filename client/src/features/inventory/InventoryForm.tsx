import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConfig } from "../../api/config";
import { useProductMutations, quantityAdjustmentBody } from "../../api/products";
import { formatCurrency } from "../../lib/format";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { Field } from "../../components/forms";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
}

interface InventoryFormProps {
  mode: "new" | "edit";
  product?: Product | null;
  onSubmit?: (payload: { mode: "create"; body: any } | { mode: "edit"; id: string; patch: any }) => Promise<void>;
}

function validate(values: { name: string; price: number; quantity: number }) {
  if (values.name.trim() === "") return "El nombre del producto es obligatorio.";
  if (!Number.isFinite(values.price) || values.price < 0) {
    return "El precio debe ser un número mayor o igual a cero.";
  }
  if (!Number.isInteger(values.quantity) || values.quantity < 0) {
    return "La cantidad debe ser un número entero mayor o igual a cero.";
  }
  return null;
}

export default function InventoryForm({ mode, product: initialProduct, onSubmit }: InventoryFormProps) {
  const navigate = useNavigate();
  const params = useParams();
  const { data: configData } = useConfig();
  const config = configData ?? { currencySymbol: "$", currencyLocale: "es-AR" };
  const { create, update } = useProductMutations();

  const isEdit = mode === "edit";
  const productId = params.id || initialProduct?.id;

  const [name, setName] = useState(initialProduct?.name ?? "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [price, setPrice] = useState(initialProduct ? String(initialProduct.price) : "");
  const [quantity, setQuantity] = useState(initialProduct ? String(initialProduct.quantity) : "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const values = {
      name,
      description,
      price: price === "" ? (isEdit ? null : 0) : Number(price),
      quantity: quantity === "" ? (isEdit ? null : 0) : Number(quantity),
    };

    const validationError = validate(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && productId) {
        const patch: any = {};
        if (values.name.trim() !== initialProduct?.name) patch.name = values.name.trim();
        if (values.description.trim() !== (initialProduct?.description ?? "")) {
          patch.description = values.description.trim() || null;
        }
        if (values.price !== initialProduct?.price) patch.price = values.price;
        Object.assign(patch, quantityAdjustmentBody(initialProduct?.quantity ?? 0, values.quantity));
        
        if (Object.keys(patch).length > 0) {
          await update(productId, patch);
        }
        if (onSubmit) {
          await onSubmit({ mode: "edit", id: productId, patch });
        }
      } else {
        const body = {
          name: values.name.trim(),
          description: values.description.trim() || null,
          price: values.price,
          quantity: values.quantity,
        };
        await create(body);
        if (onSubmit) {
          await onSubmit({ mode: "create", body });
        }
      }
      navigate("/inventory");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/inventory");
  }

  return (
    <div style={{ padding: "var(--space-4) 0", maxWidth: "48rem" }}>
      <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "var(--text-2xl)" }}>
          {isEdit ? `Editar producto: ${initialProduct?.name}` : "Nuevo producto"}
        </h2>
        <Button variant="secondary" onClick={handleCancel}>
          Volver
        </Button>
      </header>

      {error && (
        <div className="alert alert-error mb-4" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} noValidate>
          <div className="card-body">
            {isEdit && (
              <div className="form-row" style={{ marginBottom: "var(--space-3)", padding: "var(--space-2)", background: "var(--color-bg)", borderRadius: "var(--radius-md)" }}>
                <strong style={{ fontSize: "var(--text-sm)" }}>Estado actual: </strong>
                <span className="chip chip-info">{initialProduct?.quantity > 0 ? "Disponible" : "Sin stock"}</span>
              </div>
            )}

            <div className="form-row" style={{ flexDirection: "column", gap: "var(--space-3)" }}>
              <Field label="Nombre" required hint="Ej: Remera negra talle M" error={error && error.includes("nombre") ? error : undefined}>
                <Input
                  id="product-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  disabled={submitting}
                  placeholder="Ej: Remera negra talle M"
                />
              </Field>

              <Field label="Descripción (opcional)" hint="Detalles, talles, colores, etc.">
                <Input
                  id="product-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                  placeholder="Detalles, talles, colores, etc."
                />
              </Field>

              <div className="form-row" style={{ gap: "var(--space-3)" }}>
                <Field label="Precio" required style={{ flex: 1 }} error={error && error.includes("precio") ? error : undefined}>
                  <Input
                    id="product-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={submitting}
                    placeholder="0.00"
                  />
                </Field>
                <Field label={isEdit ? "Stock (cantidad objetivo)" : "Stock inicial"} required style={{ flex: 1 }} error={error && error.includes("cantidad") ? error : undefined}>
                  <Input
                    id="product-quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={submitting}
                    placeholder="0"
                  />
                </Field>
              </div>

              {isEdit && initialProduct && (
                <p className="form-hint" style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", margin: 0 }}>
                  El stock es un ajuste: ingrese un valor mayor al stock actual ({initialProduct.quantity}) para
                  reponer unidades, o menor para quitarlas. El stock nunca puede ser menor a cero.
                </p>
              )}
            </div>
          </div>

          <div className="card-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", paddingTop: "var(--space-4)" }}>
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner style={{ width: "16px", height: "16px", borderWidth: "2px" }} aria-hidden="true" />
                  Guardando…
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}