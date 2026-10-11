import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createCustomer, updateCustomer } from "../../api/customers";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { Field } from "../../components/forms";

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface CustomerFormProps {
  mode: "new" | "edit";
  initialCustomer?: Customer | null;
  onSubmit?: () => void;
}

function validate(values: { name: string; phone: string }) {
  if (!values.name || !values.name.trim()) return "El nombre del cliente es obligatorio.";
  return null;
}

export default function CustomerForm({ mode, initialCustomer, onSubmit }: CustomerFormProps) {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = mode === "edit";
  const customerId = params.id || initialCustomer?.id;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && initialCustomer) {
      setName(initialCustomer.name);
      setPhone(initialCustomer.phone);
    } else {
      setName("");
      setPhone("");
    }
  }, [isEdit, initialCustomer]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const values = { name, phone };
    const validationError = validate(values);
    if (validationError) {
      setError(validationError);
      setSubmitting(false);
      return;
    }

    try {
      if (isEdit && customerId) {
        await updateCustomer(customerId, { name: values.name.trim(), phone: values.phone.trim() });
      } else {
        await createCustomer(values.name.trim(), values.phone.trim() || null);
      }
      if (onSubmit) onSubmit();
      navigate("/clientes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/clientes");
  }

  function handleClearPhone() {
    setPhone("");
  }

  return (
    <div style={{ padding: "var(--space-4) 0", maxWidth: "48rem" }}>
      <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "var(--text-2xl)" }}>{isEdit ? "Editar cliente" : "Nuevo cliente"}</h2>
        <Button variant="secondary" onClick={handleCancel}>Volver</Button>
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
            <Field label="Nombre" required error={error && error.includes("nombre") ? error : undefined}>
              <Input
                id="customer-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                disabled={submitting}
                placeholder="Ej: Juan Pérez"
              />
            </Field>

            <Field label="Teléfono (opcional)">
              <div className="input-group" style={{ display: "flex", gap: "var(--space-2)" }}>
                <Input
                  id="customer-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={submitting}
                  placeholder="Ej: +54 9 11 1234-5678"
                  style={{ flex: 1 }}
                />
                {phone && (
                  <Button type="button" variant="secondary" size="sm" onClick={handleClearPhone} disabled={submitting} style={{ minHeight: "var(--touch-target)" }}>
                    Limpiar
                  </Button>
                )}
              </div>
            </Field>
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
              ) : isEdit ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}