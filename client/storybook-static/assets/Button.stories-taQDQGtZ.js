import{j as r}from"./jsx-runtime-D_zvdyIk.js";import{B as e}from"./Button-COGFzxFC.js";import"./index-UiW3gZKV.js";import"./_commonjsHelpers-CqkleIqs.js";const dr={title:"Primitives/Button",component:e,parameters:{layout:"centered",docs:{description:{component:"A versatile button component wrapping the .btn utility classes. Supports multiple variants, sizes, and states."}}},tags:["autodocs"],argTypes:{variant:{control:"select",options:["primary","secondary","danger","ghost","success"],description:"Visual style variant"},size:{control:"select",options:["sm","md","lg"],description:"Button size"},disabled:{control:"boolean",description:"Whether the button is disabled"},loading:{control:"boolean",description:"Whether the button shows loading state"},fullWidth:{control:"boolean",description:"Whether the button takes full width"},href:{control:"text",description:"If provided, renders as anchor element"},onClick:{action:"clicked"}}},s={args:{children:"Primary Button",variant:"primary"}},a={args:{children:"Secondary Button",variant:"secondary"}},t={args:{children:"Danger Button",variant:"danger"}},n={args:{children:"Ghost Button",variant:"ghost"}},o={args:{children:"Success Button",variant:"success"}},i={args:{children:"Small Button",size:"sm"}},c={args:{children:"Large Button",size:"lg"}},d={args:{children:"Disabled Button",disabled:!0}},l={args:{children:"Loading...",loading:!0}},u={args:{children:"Full Width Button",fullWidth:!0},decorators:[tr=>r.jsx("div",{style:{width:"300px"},children:r.jsx(tr,{})})]},m={args:{children:"Link Button",href:"/example",variant:"ghost"}},p={render:()=>r.jsxs("div",{className:"flex flex-wrap gap-2",children:[r.jsx(e,{variant:"primary",children:"Primary"}),r.jsx(e,{variant:"secondary",children:"Secondary"}),r.jsx(e,{variant:"danger",children:"Danger"}),r.jsx(e,{variant:"ghost",children:"Ghost"}),r.jsx(e,{variant:"success",children:"Success"})]})},g={render:()=>r.jsxs("div",{className:"flex items-center gap-2",children:[r.jsx(e,{size:"sm",children:"Small"}),r.jsx(e,{size:"md",children:"Medium"}),r.jsx(e,{size:"lg",children:"Large"})]})},h={render:()=>r.jsxs(e,{variant:"primary",children:[r.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",className:"mr-2",children:r.jsx("path",{d:"M12 5v14M19 12H5"})}),"Add Item"]})};var v,B,S;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    children: "Primary Button",
    variant: "primary"
  }
}`,...(S=(B=s.parameters)==null?void 0:B.docs)==null?void 0:S.source}}};var x,y,f;a.parameters={...a.parameters,docs:{...(x=a.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    children: "Secondary Button",
    variant: "secondary"
  }
}`,...(f=(y=a.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};var j,b,z;t.parameters={...t.parameters,docs:{...(j=t.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    children: "Danger Button",
    variant: "danger"
  }
}`,...(z=(b=t.parameters)==null?void 0:b.docs)==null?void 0:z.source}}};var L,W,k;n.parameters={...n.parameters,docs:{...(L=n.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    children: "Ghost Button",
    variant: "ghost"
  }
}`,...(k=(W=n.parameters)==null?void 0:W.docs)==null?void 0:k.source}}};var w,D,A;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    children: "Success Button",
    variant: "success"
  }
}`,...(A=(D=o.parameters)==null?void 0:D.docs)==null?void 0:A.source}}};var P,G,M;i.parameters={...i.parameters,docs:{...(P=i.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    children: "Small Button",
    size: "sm"
  }
}`,...(M=(G=i.parameters)==null?void 0:G.docs)==null?void 0:M.source}}};var N,I,F;c.parameters={...c.parameters,docs:{...(N=c.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    children: "Large Button",
    size: "lg"
  }
}`,...(F=(I=c.parameters)==null?void 0:I.docs)==null?void 0:F.source}}};var C,V,E;d.parameters={...d.parameters,docs:{...(C=d.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    children: "Disabled Button",
    disabled: true
  }
}`,...(E=(V=d.parameters)==null?void 0:V.docs)==null?void 0:E.source}}};var H,_,O;l.parameters={...l.parameters,docs:{...(H=l.parameters)==null?void 0:H.docs,source:{originalSource:`{
  args: {
    children: "Loading...",
    loading: true
  }
}`,...(O=(_=l.parameters)==null?void 0:_.docs)==null?void 0:O.source}}};var R,T,q;u.parameters={...u.parameters,docs:{...(R=u.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    children: "Full Width Button",
    fullWidth: true
  },
  decorators: [Story => <div style={{
    width: "300px"
  }}>
        <Story />
      </div>]
}`,...(q=(T=u.parameters)==null?void 0:T.docs)==null?void 0:q.source}}};var J,K,Q;m.parameters={...m.parameters,docs:{...(J=m.parameters)==null?void 0:J.docs,source:{originalSource:`{
  args: {
    children: "Link Button",
    href: "/example",
    variant: "ghost"
  }
}`,...(Q=(K=m.parameters)==null?void 0:K.docs)==null?void 0:Q.source}}};var U,X,Y;p.parameters={...p.parameters,docs:{...(U=p.parameters)==null?void 0:U.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-2">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="success">Success</Button>
    </div>
}`,...(Y=(X=p.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};var Z,$,rr;g.parameters={...g.parameters,docs:{...(Z=g.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-2">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
}`,...(rr=($=g.parameters)==null?void 0:$.docs)==null?void 0:rr.source}}};var er,sr,ar;h.parameters={...h.parameters,docs:{...(er=h.parameters)==null?void 0:er.docs,source:{originalSource:`{
  render: () => <Button variant="primary">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
        <path d="M12 5v14M19 12H5" />
      </svg>
      Add Item
    </Button>
}`,...(ar=(sr=h.parameters)==null?void 0:sr.docs)==null?void 0:ar.source}}};const lr=["Primary","Secondary","Danger","Ghost","Success","Small","Large","Disabled","Loading","FullWidth","AsLink","AllVariants","AllSizes","WithIcon"];export{g as AllSizes,p as AllVariants,m as AsLink,t as Danger,d as Disabled,u as FullWidth,n as Ghost,c as Large,l as Loading,s as Primary,a as Secondary,i as Small,o as Success,h as WithIcon,lr as __namedExportsOrder,dr as default};
