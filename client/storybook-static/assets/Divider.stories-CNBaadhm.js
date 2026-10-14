import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{r as b}from"./index-UiW3gZKV.js";import"./_commonjsHelpers-CqkleIqs.js";const c=b.forwardRef(({orientation:a="horizontal",children:t,className:y="",...r},n)=>{const l=a==="horizontal",N=["border-border",l?"w-full my-2":"h-full mx-2",y].filter(Boolean).join(" ");return t&&l?e.jsxs("div",{className:"flex items-center gap-2 w-full",role:"separator","aria-orientation":"horizontal",children:[e.jsx("hr",{className:"flex-1 border-border",ref:n,...r}),e.jsx("span",{className:"text-xs text-text-secondary font-medium px-2 whitespace-nowrap",children:t}),e.jsx("hr",{className:"flex-1 border-border",...r})]}):t&&!l?e.jsxs("div",{className:"flex items-center gap-2 h-full",role:"separator","aria-orientation":"vertical",children:[e.jsx("hr",{className:"flex-1 border-border",ref:n,...r}),e.jsx("span",{className:"text-xs text-text-secondary font-medium py-2 whitespace-nowrap writing-mode-vertical-lr",children:t}),e.jsx("hr",{className:"flex-1 border-border",...r})]}):e.jsx("hr",{ref:n,className:N,role:"separator","aria-orientation":a,...r})});c.displayName="Divider";c.__docgenInfo={description:`Divider - A visual separator component with optional label

Renders as an <hr> element for semantic correctness and accessibility.
Supports horizontal (default) and vertical orientations with optional label.

@example
\`\`\`tsx
<Divider />
<Divider>Section Title</Divider>
<Divider orientation="vertical" className="h-8" />
\`\`\`

@component
@category Primitives`,methods:[],displayName:"Divider",props:{orientation:{required:!1,tsType:{name:"union",raw:'"horizontal" | "vertical"',elements:[{name:"literal",value:'"horizontal"'},{name:"literal",value:'"vertical"'}]},description:"",defaultValue:{value:'"horizontal"',computed:!1}},children:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["HTMLAttributes"]};const D={title:"Primitives/Divider",component:c,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{orientation:{control:{type:"select"},options:["horizontal","vertical"]}}},o={args:{}},s={args:{orientation:"vertical"},decorators:[a=>e.jsx("div",{style:{height:"100px"},children:e.jsx(a,{})})]},i={args:{children:"OR"}};var d,m,p;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {}
}`,...(p=(m=o.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var u,x,h;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  },
  decorators: [Story => <div style={{
    height: '100px'
  }}><Story /></div>]
}`,...(h=(x=s.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};var v,f,g;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    children: 'OR'
  }
}`,...(g=(f=i.parameters)==null?void 0:f.docs)==null?void 0:g.source}}};const R=["Horizontal","Vertical","WithText"];export{o as Horizontal,s as Vertical,i as WithText,R as __namedExportsOrder,D as default};
