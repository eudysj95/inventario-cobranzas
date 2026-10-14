import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{r as q}from"./index-UiW3gZKV.js";import"./_commonjsHelpers-CqkleIqs.js";const r=q.forwardRef(({size:z="md",variant:w="primary",label:j="Loading...",className:L="",...I},N)=>{const k={sm:"w-4 h-4 border-[2px]",md:"w-6 h-6 border-[2px]",lg:"w-8 h-8 border-[3px]"},T={primary:"border-border border-t-primary",white:"border-white/30 border-t-white"};return e.jsxs("div",{ref:N,role:"status","aria-live":"polite",className:`flex items-center justify-center ${L}`,...I,children:[e.jsx("svg",{className:`${k[z]} ${T[w]} rounded-full animate-spin`,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",children:e.jsx("circle",{cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"3",strokeLinecap:"round"})}),e.jsx("span",{className:"sr-only",children:j})]})});r.displayName="Spinner";r.__docgenInfo={description:`Spinner - A loading spinner component

Displays an animated circular spinner for loading states.
Supports multiple sizes and color variants.

@example
\`\`\`tsx
<Spinner size="md" variant="primary" label="Loading data" />
<Spinner size="sm" /> // Inline in buttons
<Spinner size="lg" variant="white" /> // On dark backgrounds
\`\`\`

@component
@category Primitives`,methods:[],displayName:"Spinner",props:{size:{required:!1,tsType:{name:"union",raw:'"sm" | "md" | "lg"',elements:[{name:"literal",value:'"sm"'},{name:"literal",value:'"md"'},{name:"literal",value:'"lg"'}]},description:"",defaultValue:{value:'"md"',computed:!1}},variant:{required:!1,tsType:{name:"union",raw:'"primary" | "white"',elements:[{name:"literal",value:'"primary"'},{name:"literal",value:'"white"'}]},description:"",defaultValue:{value:'"primary"',computed:!1}},label:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Loading..."',computed:!1}},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["HTMLAttributes"]};const C={title:"Primitives/Spinner",component:r,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{size:{control:{type:"select"},options:["sm","md","lg"]}}},a={args:{}},s={args:{size:"sm"}},n={args:{size:"lg"}},t={render:()=>e.jsxs("button",{type:"button",disabled:!0,children:[e.jsx(r,{size:"sm"})," Loading..."]})},i={render:()=>e.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"center"},children:[e.jsx(r,{size:"sm"}),e.jsx("span",{children:"Loading data..."})]})};var o,l,d;a.parameters={...a.parameters,docs:{...(o=a.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {}
}`,...(d=(l=a.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};var p,m,c;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...(c=(m=s.parameters)==null?void 0:m.docs)==null?void 0:c.source}}};var u,g,f;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    size: 'lg'
  }
}`,...(f=(g=n.parameters)==null?void 0:g.docs)==null?void 0:f.source}}};var x,y,v;t.parameters={...t.parameters,docs:{...(x=t.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <button type="button" disabled><Spinner size="sm" /> Loading...</button>
}`,...(v=(y=t.parameters)==null?void 0:y.docs)==null?void 0:v.source}}};var b,h,S;i.parameters={...i.parameters,docs:{...(b=i.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  }}><Spinner size="sm" /><span>Loading data...</span></div>
}`,...(S=(h=i.parameters)==null?void 0:h.docs)==null?void 0:S.source}}};const D=["Default","Small","Large","InButton","Inline"];export{a as Default,t as InButton,i as Inline,n as Large,s as Small,D as __namedExportsOrder,C as default};
