// Application shell (task 6.1): branding is config-driven. businessName,
// currency and the instance WhatsApp number come from GET /api/config
// (public endpoint, client/src/api/config.js) — never hardcoded. While the
// boot fetch is pending or failed, neutral defaults render (LOW-risk
// fallback per design) and a fetch failure is surfaced as a warning banner
// ("fail visible").
//
// The instance WhatsApp number below is display/contact ONLY. Customer
// wa.me collection links (slice 6.5) MUST use the customer's phone from the
// record, never this number.
//
// Feature routes (auth, inventory, apartados, credit, collections,
// suppliers) are added in later slices.

import { useEffect } from 'react';
import { DEFAULT_CONFIG, useConfig } from './api/config.js';

export default function App() {
  const { data, isError } = useConfig();
  const config = data ?? DEFAULT_CONFIG;

  useEffect(() => {
    document.title = config.businessName;
  }, [config.businessName]);

  // Display/contact link to the instance WhatsApp number (digits only for
  // wa.me). Never feeds customer collection links.
  const whatsappHref = config.whatsappNumber
    ? `https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}`
    : null;

  return (
    <div>
      <header>
        <h1>{config.businessName}</h1>
        {isError && (
          <p role="alert">
            No se pudo cargar la configuración del negocio; se muestran valores por defecto.
          </p>
        )}
      </header>
      <p>Sistema de inventario y cobranzas</p>
      {whatsappHref && (
        <p>
          <a href={whatsappHref} title="Contactar por WhatsApp">
            {config.whatsappNumber}
          </a>
        </p>
      )}
    </div>
  );
}
