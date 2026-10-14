import{j as e}from"./jsx-runtime-D_zvdyIk.js";function r({children:t,className:a=""}){return e.jsx("div",{className:`form-layout ${a}`,"data-testid":"form-layout",children:t})}r.Sidebar=function({children:a,className:n=""}){return e.jsx("aside",{className:`form-layout-sidebar ${n}`,"data-testid":"form-layout-sidebar",role:"complementary","aria-label":"Formulario",children:a})};r.Panel=function({children:a,className:n=""}){return e.jsx("section",{className:`form-layout-panel ${n}`,"data-testid":"form-layout-panel",role:"region","aria-label":"Resumen",children:a})};r.__docgenInfo={description:`FormLayout - A two-column layout for forms with sidebar (fields) and panel (preview/summary)

Desktop (≥768px): Two-column grid - sidebar 70%, panel 30%
Mobile (<768px): Stacked - sidebar on top, panel below

@example
\`\`\`tsx
<FormLayout>
  <FormLayout.Sidebar>
    <Field label="Name"><Input /></Field>
  </FormLayout.Sidebar>
  <FormLayout.Panel>
    <PreviewSummary />
  </FormLayout.Panel>
</FormLayout>
\`\`\``,methods:[{name:"Sidebar",docblock:"FormLayout.Sidebar - The form fields column (70% on desktop, full width on mobile)",modifiers:["static"],params:[{name:'{ children, className = "" }: FormLayoutSectionProps',optional:!1,type:{name:"FormLayoutSectionProps",alias:"FormLayoutSectionProps"}}],returns:null,description:"FormLayout.Sidebar - The form fields column (70% on desktop, full width on mobile)"},{name:"Panel",docblock:"FormLayout.Panel - The preview/summary column (30% on desktop, full width on mobile)",modifiers:["static"],params:[{name:'{ children, className = "" }: FormLayoutSectionProps',optional:!1,type:{name:"FormLayoutSectionProps",alias:"FormLayoutSectionProps"}}],returns:null,description:"FormLayout.Panel - The preview/summary column (30% on desktop, full width on mobile)"}],displayName:"FormLayout",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""},className:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}}}};const y={title:"Forms/FormLayout",component:r,parameters:{layout:"centered"},tags:["autodocs"]},o={args:{children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[e.jsxs("label",{children:["Name ",e.jsx("input",{type:"text",placeholder:"Enter name"})]}),e.jsxs("label",{children:["Email ",e.jsx("input",{type:"email",placeholder:"Enter email"})]}),e.jsxs("label",{children:["Phone ",e.jsx("input",{type:"tel",placeholder:"Enter phone"})]})]})}},l={args:{children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[e.jsxs("label",{children:["Product Name ",e.jsx("input",{type:"text",placeholder:"Product name"})]}),e.jsxs("label",{children:["Price ",e.jsx("input",{type:"number",placeholder:"0.00",step:"0.01"})]}),e.jsxs("label",{children:["Description ",e.jsx("textarea",{placeholder:"Product description",rows:3})]})]})}};var i,s,m;o.parameters={...o.parameters,docs:{...(i=o.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    children: <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
        <label>Name <input type="text" placeholder="Enter name" /></label>
        <label>Email <input type="email" placeholder="Enter email" /></label>
        <label>Phone <input type="tel" placeholder="Enter phone" /></label>
      </div>
  }
}`,...(m=(s=o.parameters)==null?void 0:s.docs)==null?void 0:m.source}}};var d,p,c;l.parameters={...l.parameters,docs:{...(d=l.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    children: <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
        <label>Product Name <input type="text" placeholder="Product name" /></label>
        <label>Price <input type="number" placeholder="0.00" step="0.01" /></label>
        <label>Description <textarea placeholder="Product description" rows={3} /></label>
      </div>
  }
}`,...(c=(p=l.parameters)==null?void 0:p.docs)==null?void 0:c.source}}};const b=["Default","WithPreview"];export{o as Default,l as WithPreview,b as __namedExportsOrder,y as default};
