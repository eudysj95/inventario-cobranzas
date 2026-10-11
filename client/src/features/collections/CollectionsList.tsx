import { useState } from "react";
import { useConfig } from "../../api/config";
import { collectionTypeLabel, groupDueCustomers, useCollectionsDue } from "../../api/collections";
import { buildCollectionMessage, buildWaLink, PHONE_REQUIRED_TEXT } from "../../lib/whatsapp";
import { formatCurrency, formatDate } from "../../lib/format";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Chip } from "../../components/ui/Chip";
import { WhatsAppHub } from "../../components/whatsapp/WhatsAppHub";

const HORIZON_OPTIONS = [7, 15, 30, 60];
const TYPE_CHIP_MAP = { apartado: "danger", credit: "success" };

export default function CollectionsList() {
  const { data: configData } = useConfig();
  const config = configData ?? { currencySymbol: "$", currencyLocale: "es-AR" };
  const [horizonDays, setHorizonDays] = useState(7);
  const { data: customers = [], isPending, isError } = useCollectionsDue(horizonDays);
  const { overdue, upcoming } = groupDueCustomers(customers);

  return (
    <section style={{ padding: "var(--space-4) 0" }}>
      <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "var(--text-2xl)" }}>Cobranzas</h2>
      </header>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-wrap gap-3 mb-4" style={{ alignItems: "flex-end" }}>
        <div className="form-row" style={{ flexDirection: "column", gap: "var(--space-1)", minWidth: "140px" }}>
          <label htmlFor="collections-horizon" className="label">Horizonte</label>
          <select id="collections-horizon" value={horizonDays} onChange={(e) => setHorizonDays(Number(e.target.value))} className="input select">
            {HORIZON_OPTIONS.map((days) => <option key={days} value={days}>{days} días</option>)}
          </select>
        </div>
        <p className="form-hint" style={{ margin: 0, alignSelf: "flex-end" }}>Vencimientos dentro del horizonte, incluidos los vencidos.</p>
      </form>

      {isPending ? <p className="loading">Cargando cobranzas…</p> : isError ? <p className="alert alert-error" role="alert">No se pudieron cargar las cobranzas.</p> : customers.length === 0 ? <p className="empty-state">No hay vencimientos en el horizonte seleccionado.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {overdue.length > 0 && <DueGroup title="Vencidos" customers={overdue} config={config} />}
          {upcoming.length > 0 && <DueGroup title="Próximos vencimientos" customers={upcoming} config={config} />}
        </div>
      )}
    </section>
  );
}

function DueGroup({ title, customers, config }: { title: string; customers: any[]; config: any }) {
  return (
    <div>
      <h3 className="mb-3" style={{ fontSize: "var(--text-xl)", color: "var(--color-text)" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {customers.map((customer) => <CustomerCard key={customer.customerId} customer={customer} config={config} />)}
      </div>
    </div>
  );
}

function CustomerCard({ customer, config }: { customer: any; config: any }) {
  const message = buildCollectionMessage(customer.name, customer.items, config);
  const link = buildWaLink(customer.phone, message);

  return (
    <Card>
      <div className="card-body">
        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap" style={{ alignItems: "center" }}>
          <h4 style={{ margin: 0 }}>{customer.name}</h4>
          {customer.overdue && <Chip variant="danger">Vencido</Chip>}
        </div>
        <p className="form-hint mb-2">Teléfono: {customer.phone || "Sin teléfono registrado"}</p>
        <p className="mb-3">Total pendiente: <strong>{formatCurrency(customer.totalOpen, config)}</strong></p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {customer.items.map((item: any, index: number) => (
            <li key={`${item.type}-${item.dueDate}-${index}`} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <Chip variant={TYPE_CHIP_MAP[item.type] || "neutral"} style={{ minWidth: "88px", textAlign: "center" }}>
                {collectionTypeLabel(item.type)}
              </Chip>
              <span>{formatCurrency(item.amount, config)}</span>
              <span className="form-hint" style={{ whiteSpace: "nowrap" }}>{item.dueDate ? formatDate(item.dueDate, config) : "—"}</span>
            </li>
          ))}
        </ul>
        {link ? (
          <a className="btn btn-success mt-3" href={link} target="_blank" rel="noopener noreferrer" title="Enviar recordatorio por WhatsApp">
            <WhatsAppHub phone={customer.phone} variant="inline" template="collection" prefillData={{ customerName: customer.name, amount: formatCurrency(customer.totalOpen, config), dueDate: customer.items[0]?.dueDate ? formatDate(customer.items[0].dueDate, config) : "" }} />
            Recordar por WhatsApp
          </a>
        ) : (
          <p className="form-hint mt-3" role="status" style={{ fontStyle: "italic", color: "var(--color-text-muted)" }}>{PHONE_REQUIRED_TEXT}</p>
        )}
      </div>
    </Card>
  );
}