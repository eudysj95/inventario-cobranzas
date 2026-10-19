import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConfig } from "../../api/config";
import { useProduct, useProductMutations, quantityAdjustmentBody, useVariants, useVariantMutations, createVariant, variantAlert } from "../../api/products";
import { formatCurrency } from "../../lib/format";
import { Badge } from "../../components/ui/Badge";
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

  // Variantes del producto (solo tiene sentido en edición). Los tests de
  // unidad mockean api/products sin estos hooks, da lo cual se guardan con
  // un valor vacío para no romper el render bajo mock.
  const editProductId = isEdit ? (product?.id ?? productId) : null;
  const { data: variants = [], isPending: variantsPending } = useVariants
    ? useVariants(editProductId)
    : { data: [], isPending: false };
  const {
    create: createVariantM,
    setActive: setVariantActiveM,
  } = useVariantMutations
    ? useVariantMutations()
    : { create: async () => undefined, setActive: async () => undefined };

  // Fetch product data when in edit mode and we have an ID
  const { data: productData, isPending: isLoadingProduct } = useProduct(productId);

  // Use fetched product data in edit mode, fallback to initialProduct prop
  const product = isEdit ? (productData?.product ?? initialProduct) : initialProduct;

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [quantity, setQuantity] = useState(product ? String(product.quantity) : "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newVariant, setNewVariant] = useState<{
    name: string;
    sku: string;
    stock: string;
    attributes: { name: string; value: string }[];
  }>({
    name: "",
    sku: "",
    stock: "",
    attributes: [{ name: "", value: "" }],
  });
  const [addingVariant, setAddingVariant] = useState(false);
  const [togglingVariant, setTogglingVariant] = useState<string | null>(null);

  // Reset form when product data loads (in edit mode)
  useEffect(() => {
    if (isEdit && product && !isLoadingProduct) {
      setName(product.name ?? "");
      setDescription(product.description ?? "");
      setPrice(String(product.price));
      setQuantity(String(product.quantity));
    }
  }, [product, isEdit, isLoadingProduct]);

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
      if (isEdit && productId && product) {
        const patch: any = {};
        if (values.name.trim() !== product.name) patch.name = values.name.trim();
        if (values.description.trim() !== (product.description ?? "")) {
          patch.description = values.description.trim() || null;
        }
        if (values.price !== product.price) patch.price = values.price;
        Object.assign(patch, quantityAdjustmentBody(product.quantity ?? 0, values.quantity));
        
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
          {isEdit && isLoadingProduct ? "Cargando producto…" : isEdit ? `Editar producto: ${product?.name ?? "—"}` : "Nuevo producto"}
        </h2>
        <Button variant="secondary" onClick={handleCancel} disabled={isLoadingProduct}>
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
            {isEdit && product && (
              <div className="form-row" style={{ marginBottom: "var(--space-3)", padding: "var(--space-2)", background: "var(--color-bg)", borderRadius: "var(--radius-md)" }}>
                <strong style={{ fontSize: "var(--text-sm)" }}>Estado actual: </strong>
                <span className="chip chip-info">{product.quantity > 0 ? "Disponible" : "Sin stock"}</span>
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
                  disabled={submitting || isLoadingProduct}
                  placeholder="Ej: Remera negra talle M"
                />
              </Field>

              <Field label="Descripción (opcional)" hint="Detalles, talles, colores, etc.">
                <Input
                  id="product-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting || isLoadingProduct}
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
                    disabled={submitting || isLoadingProduct}
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
                    disabled={submitting || isLoadingProduct}
                    placeholder="0"
                  />
                </Field>
              </div>

              {isEdit && product && (
                <p className="form-hint" style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", margin: 0 }}>
                  El stock es un ajuste: ingrese un valor mayor al stock actual ({product.quantity}) para
                  reponer unidades, o menor para quitarlas. El stock nunca puede ser menor a cero.
                </p>
              )}

              {isEdit && product && (
                <div
                  style={{
                    marginTop: "var(--space-4)",
                    padding: "var(--space-3)",
                    background: "var(--color-bg)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                      marginBottom: "var(--space-2)",
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: "var(--text-sm)" }}>Variantes</h3>
                    <span className="chip chip-info" style={{ fontSize: "var(--text-xs)" }}>
                      Precio hereda del padre
                    </span>
                  </div>
                  <p
                    className="form-hint"
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-secondary)",
                      margin: "0 0 var(--space-2)",
                    }}
                  >
                    Stock y alerta (mínimo/crítico) por variante. Las variantes
                    inactivas se excluyen del stock general del producto.
                  </p>
                  {variants.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                      {variants.map((variant) => {
                        const alert = variantAlert(variant);
                        return (
                          <div
                            key={variant.id}
                            style={{
                              display: "flex",
                              gap: "var(--space-1)",
                              alignItems: "center",
                              flexWrap: "wrap",
                              fontSize: "var(--text-sm)",
                            }}
                          >
                            <span style={{ minWidth: "110px" }}>{variant.name}</span>
                            {variant.sku && (
                              <span
                                style={{
                                  fontSize: "var(--text-xs)",
                                  color: "var(--color-text-secondary)",
                                }}
                              >
                                {variant.sku}
                              </span>
                            )}
                            <span
                              style={{
                                fontSize: "var(--text-xs)",
                                color: "var(--color-text-secondary)",
                              }}
                            >
                              {variant.attributes
                                .map((a) => `${a.attribute_name}: ${a.attribute_value}`)
                                .join(" · ") || "—"}
                            </span>
                            <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                              Stock {variant.stock}
                            </span>
                            {alert ? (
                              <Badge
                                variant={alert === "critical" ? "danger" : "warning"}
                                size="sm"
                                title={
                                  alert === "critical" ? "Stock crítico" : "Stock mínimo"
                                }
                              >
                                {alert === "critical" ? "Crítico" : "Mínimo"}
                              </Badge>
                            ) : null}
                            <Button
                              type="button"
                              variant={variant.active ? "secondary" : "primary"}
                              size="sm"
                              disabled={togglingVariant === variant.id || addingVariant}
                              onClick={() => handleVariantToggle(variant)}
                              aria-label={
                                variant.active
                                  ? `Desactivar ${variant.name}`
                                  : `Activar ${variant.name}`
                              }
                            >
                              {togglingVariant === variant.id
                                ? "…"
                                : variant.active
                                  ? "Activo"
                                  : "Inactivo"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-secondary)",
                        margin: 0,
                      }}
                    >
                      Sin variantes aún. Agregá la primera abajo.
                    </p>
                  )}
                  <div
                    style={{
                      marginTop: "var(--space-2)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--space-1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "var(--space-1)",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <Field
                        label="Nombre de la variante"
                        required
                        error={
                          error &&
                          (error.includes("variante") ||
                            error.includes("nombre de la variante"))
                            ? error
                            : undefined
                        }
                      >
                        <Input
                          id="variant-name"
                          value={newVariant.name}
                          onChange={(e) =>
                            setNewVariant({ ...newVariant, name: e.target.value })
                          }
                          disabled={submitting || addingVariant || variantsPending}
                          placeholder="Ej: Talle M"
                        />
                      </Field>
                      <Field label="SKU (opcional)">
                        <Input
                          id="variant-sku"
                          value={newVariant.sku}
                          onChange={(e) =>
                            setNewVariant({ ...newVariant, sku: e.target.value })
                          }
                          disabled={submitting || addingVariant || variantsPending}
                          placeholder="SKU"
                        />
                      </Field>
                      <Field
                        label="Stock inicial"
                        required
                        style={{ flex: 1 }}
                        error={
                          error && error.includes("stock") ? error : undefined
                        }
                      >
                        <Input
                          id="variant-stock"
                          type="number"
                          min="0"
                          step="1"
                          value={newVariant.stock}
                          onChange={(e) =>
                            setNewVariant({ ...newVariant, stock: e.target.value })
                          }
                          disabled={submitting || addingVariant || variantsPending}
                          placeholder="0"
                        />
                      </Field>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "var(--space-1)",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      {newVariant.attributes.map((attr, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            gap: "var(--space-1)",
                            alignItems: "center",
                          }}
                        >
                          <Input
                            value={attr.name}
                            onChange={(e) =>
                              handleVariantAttributeChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            disabled={submitting || addingVariant || variantsPending}
                            placeholder="Nombre (talla, color…)"
                          />
                          <Input
                            value={attr.value}
                            onChange={(e) =>
                              handleVariantAttributeChange(
                                index,
                                "value",
                                e.target.value
                              )
                            }
                            disabled={submitting || addingVariant || variantsPending}
                            placeholder="Valor (M, Rojo…)"
                          />
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            disabled={
                              newVariant.attributes.length <= 1 ||
                              submitting ||
                              addingVariant
                            }
                            onClick={() => removeAttributeRow(index)}
                          >
                            −
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        size="sm"
                        disabled={submitting || addingVariant || variantsPending}
                        onClick={addAttributeRow}
                      >
                        + Atributo
                      </Button>
                    </div>
                    <Button
                      type="button"
                      disabled={submitting || addingVariant || variantsPending}
                      onClick={handleAddVariant}
                    >
                      {addingVariant ? (
                        <>
                          <Spinner
                            style={{
                              width: "16px",
                              height: "16px",
                              borderWidth: "2px",
                            }}
                            aria-hidden="true"
                          />
                          Agregando…
                        </>
                      ) : (
                        "Agregar variante"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", paddingTop: "var(--space-4)" }}>
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={submitting || isLoadingProduct}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || isLoadingProduct}>
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