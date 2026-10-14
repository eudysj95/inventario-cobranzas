import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{r as W}from"./index-UiW3gZKV.js";import"./_commonjsHelpers-CqkleIqs.js";const c=W.forwardRef(({label:m,variant:A="neutral",size:P="md",onRemove:l,disabled:d=!1,className:V="",..._},E)=>{const M=["chip",`chip-${A}`,P==="sm"&&"chip-sm",l&&"flex items-center gap-1",V].filter(Boolean).join(" ");return e.jsxs("span",{ref:E,className:M,..._,children:[m,l&&e.jsx("button",{type:"button",className:"p-0.5 rounded hover:bg-black/10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary",onClick:l,disabled:d,"aria-label":`Remove ${m}`,tabIndex:d?-1:0,children:e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2","aria-hidden":"true",children:e.jsx("path",{d:"M18 6L6 18M6 6l12 12"})})})]})});c.displayName="Chip";c.__docgenInfo={description:`Chip - An interactive tag/filter component wrapping the .chip utility classes

Can be used as a removable tag, filter, or category label.
Shows a remove button when onRemove callback is provided.

@example
\`\`\`tsx
<Chip label="React" variant="primary" onRemove={handleRemove} />
<Chip label="TypeScript" variant="info" />
<Chip label="Design" variant="success" size="sm" />
\`\`\`

@component
@category Primitives`,methods:[],displayName:"Chip",props:{label:{required:!0,tsType:{name:"string"},description:""},variant:{required:!1,tsType:{name:"union",raw:'"primary" | "success" | "warning" | "danger" | "info" | "neutral"',elements:[{name:"literal",value:'"primary"'},{name:"literal",value:'"success"'},{name:"literal",value:'"warning"'},{name:"literal",value:'"danger"'},{name:"literal",value:'"info"'},{name:"literal",value:'"neutral"'}]},description:"",defaultValue:{value:'"neutral"',computed:!1}},size:{required:!1,tsType:{name:"union",raw:'"sm" | "md"',elements:[{name:"literal",value:'"sm"'},{name:"literal",value:'"md"'}]},description:"",defaultValue:{value:'"md"',computed:!1}},onRemove:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["HTMLAttributes"]};const H={title:"Primitives/Chip",component:c,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["default","success","warning","danger","info"]},size:{control:{type:"select"},options:["sm","md"]},removable:{control:"boolean"}}},a={args:{children:"Chip"}},r={args:{children:"Approved",variant:"success"}},n={args:{children:"Pending",variant:"warning"}},s={args:{children:"Rejected",variant:"danger"}},t={args:{children:"Info",variant:"info"}},o={args:{children:"Small",size:"sm"}},i={args:{children:"Removable",removable:!0,onRemove:()=>{}}};var p,u,g;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    children: 'Chip'
  }
}`,...(g=(u=a.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var v,f,h;r.parameters={...r.parameters,docs:{...(v=r.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    children: 'Approved',
    variant: 'success'
  }
}`,...(h=(f=r.parameters)==null?void 0:f.docs)==null?void 0:h.source}}};var b,y,S;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    children: 'Pending',
    variant: 'warning'
  }
}`,...(S=(y=n.parameters)==null?void 0:y.docs)==null?void 0:S.source}}};var w,x,R;s.parameters={...s.parameters,docs:{...(w=s.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    children: 'Rejected',
    variant: 'danger'
  }
}`,...(R=(x=s.parameters)==null?void 0:x.docs)==null?void 0:R.source}}};var C,j,T;t.parameters={...t.parameters,docs:{...(C=t.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    children: 'Info',
    variant: 'info'
  }
}`,...(T=(j=t.parameters)==null?void 0:j.docs)==null?void 0:T.source}}};var q,I,N;o.parameters={...o.parameters,docs:{...(q=o.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    children: 'Small',
    size: 'sm'
  }
}`,...(N=(I=o.parameters)==null?void 0:I.docs)==null?void 0:N.source}}};var k,z,D;i.parameters={...i.parameters,docs:{...(k=i.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    children: 'Removable',
    removable: true,
    onRemove: () => {}
  }
}`,...(D=(z=i.parameters)==null?void 0:z.docs)==null?void 0:D.source}}};const O=["Default","Success","Warning","Danger","Info","Small","Removable"];export{s as Danger,a as Default,t as Info,i as Removable,o as Small,r as Success,n as Warning,O as __namedExportsOrder,H as default};
