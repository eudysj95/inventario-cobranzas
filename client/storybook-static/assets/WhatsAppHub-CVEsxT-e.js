import{j as r}from"./jsx-runtime-D_zvdyIk.js";import{r as f,R as x}from"./index-UiW3gZKV.js";import{r as y}from"./index-3b7XovMV.js";function v({content:e,children:a,position:c="top",delay:h=200}){const[i,m]=f.useState(!1),l=f.useRef(),s=f.useRef(null),d=()=>{l.current=setTimeout(()=>m(!0),h)},p=()=>{l.current&&clearTimeout(l.current),m(!1)},u=o=>{o.key==="Escape"&&p()},w=x.cloneElement(a,{ref:s,onMouseEnter:o=>{var t,n;d(),(n=(t=a.props).onMouseEnter)==null||n.call(t,o)},onMouseLeave:o=>{var t,n;p(),(n=(t=a.props).onMouseLeave)==null||n.call(t,o)},onFocus:o=>{var t,n;d(),(n=(t=a.props).onFocus)==null||n.call(t,o)},onBlur:o=>{var t,n;p(),(n=(t=a.props).onBlur)==null||n.call(t,o)},onKeyDown:o=>{var t,n;u(o),(n=(t=a.props).onKeyDown)==null||n.call(t,o)},"aria-describedby":i?"tooltip-content":void 0}),b=i?r.jsx("div",{id:"tooltip-content",role:"tooltip",className:`tooltip tooltip-${c} absolute z-[var(--z-tooltip)] px-2 py-1 text-xs text-white bg-text rounded shadow-lg whitespace-nowrap animate-fade-in`,style:T(c),children:e}):null;return r.jsxs(r.Fragment,{children:[w,b&&y.createPortal(b,document.body)]})}function T(e){return{top:{bottom:"100%",left:"50%",transform:"translateX(-50%)",marginBottom:"4px"},bottom:{top:"100%",left:"50%",transform:"translateX(-50%)",marginTop:"4px"},left:{right:"100%",top:"50%",transform:"translateY(-50%)",marginRight:"4px"},right:{left:"100%",top:"50%",transform:"translateY(-50%)",marginLeft:"4px"}}[e]}v.__docgenInfo={description:`Tooltip - A floating tooltip component with hover/focus triggers

Shows on hover or focus of the child element. Supports four positions
and configurable delay. Uses portal for proper stacking context.

@example
\`\`\`tsx
<Tooltip content="Delete this item" position="top">
  <IconButton aria-label="Delete" icon={<TrashIcon />} />
</Tooltip>
<Tooltip content="Edit settings" position="right" delay={300}>
  <Button variant="ghost">Settings</Button>
</Tooltip>
\`\`\`

@component
@category Primitives`,methods:[],displayName:"Tooltip",props:{content:{required:!0,tsType:{name:"string"},description:""},children:{required:!0,tsType:{name:"ReactElement"},description:""},position:{required:!1,tsType:{name:"union",raw:'"top" | "bottom" | "left" | "right"',elements:[{name:"literal",value:'"top"'},{name:"literal",value:'"bottom"'},{name:"literal",value:'"left"'},{name:"literal",value:'"right"'}]},description:"",defaultValue:{value:'"top"',computed:!1}},delay:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"200",computed:!1}}}};const g={collection:e=>`Hola ${e.customerName??""}, tu pago de ${e.amount??""} vence el ${e.dueDate??""}.`,saleConfirmation:e=>`Gracias por tu compra ${e.orderId??""}. Total: ${e.amount??""}.`,apartadoReminder:e=>`Recordatorio: tu apartado ${e.apartadoId??""} vence el ${e.dueDate??""}.`,custom:e=>""};function A(e){return e.replace(/\D/g,"")}function W(e,a){return`https://wa.me/${A(e)}?text=${encodeURIComponent(a)}`}function $({phone:e,message:a,variant:c="fab",prefillData:h={},template:i,className:m=""}){const l=f.useMemo(()=>i&&i!=="custom"&&g[i]?g[i](h):a??"",[i,h,a]),s=f.useMemo(()=>!e||!l?null:W(e,l),[e,l]),d={fab:"whatsapp-fab btn btn-primary rounded-full p-3 shadow-lg fixed bottom-4 right-4 z-50 animate-pulse hover:scale-105 transition-transform",inline:"whatsapp-inline btn btn-ghost btn-sm p-2",button:"whatsapp-button btn btn-primary gap-2"},p=r.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2","aria-hidden":"true",children:r.jsx("path",{d:"M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"})});return c==="fab"?r.jsx(v,{content:"Contactar por WhatsApp",position:"left",children:r.jsx("a",{href:s??"#",target:"_blank",rel:"noopener noreferrer",className:`${d.fab} ${m}`,"aria-label":"Contactar por WhatsApp","data-wa-event":"click","data-testid":"whatsapp-fab",onClick:u=>{s||u.preventDefault()},children:p})}):c==="inline"?r.jsx("a",{href:s??"#",target:"_blank",rel:"noopener noreferrer",className:`${d.inline} ${m}`,"aria-label":"Contactar por WhatsApp","data-wa-event":"click","data-testid":"whatsapp-inline",onClick:u=>{s||u.preventDefault()},children:p}):r.jsxs("a",{href:s??"#",target:"_blank",rel:"noopener noreferrer",className:`${d.button} ${m}`,"aria-label":"Contactar por WhatsApp","data-wa-event":"click","data-testid":"whatsapp-button",onClick:u=>{s||u.preventDefault()},children:[p,r.jsx("span",{children:"WhatsApp"})]})}$.__docgenInfo={description:`WhatsAppHub - WhatsApp contact component with FAB, inline, and button variants

Provides a consistent way to initiate WhatsApp conversations with pre-filled messages
using templates or custom messages. Generates wa.me deep links that open in new tabs.

Variants:
- **fab**: Fixed bottom-right floating action button with pulse animation and tooltip
- **inline**: Icon-only button (32px) for table rows and compact spaces
- **button**: Full button with "WhatsApp" label for forms and modals

@example
\`\`\`tsx
// FAB variant
<WhatsAppHub phone="+5491123456789" variant="fab" />

// Inline with template
<WhatsAppHub
  phone="+5491123456789"
  variant="inline"
  template="collection"
  prefillData={{ customerName: "Juan", amount: "$1.000", dueDate: "15/08/2026" }}
/>

// Button variant with custom message
<WhatsAppHub
  phone="+5491123456789"
  variant="button"
  message="Hola, quiero información"
/>
\`\`\`

@component
@category WhatsApp`,methods:[],displayName:"WhatsAppHub",props:{phone:{required:!0,tsType:{name:"string"},description:""},message:{required:!1,tsType:{name:"string"},description:""},variant:{required:!1,tsType:{name:"union",raw:'"fab" | "inline" | "button"',elements:[{name:"literal",value:'"fab"'},{name:"literal",value:'"inline"'},{name:"literal",value:'"button"'}]},description:"",defaultValue:{value:'"fab"',computed:!1}},prefillData:{required:!1,tsType:{name:"Record",elements:[{name:"string"},{name:"string"}],raw:"Record<string, string>"},description:"",defaultValue:{value:"{}",computed:!1}},template:{required:!1,tsType:{name:"union",raw:'"collection" | "saleConfirmation" | "apartadoReminder" | "custom"',elements:[{name:"literal",value:'"collection"'},{name:"literal",value:'"saleConfirmation"'},{name:"literal",value:'"apartadoReminder"'},{name:"literal",value:'"custom"'}]},description:""},className:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}}}};export{$ as W};
