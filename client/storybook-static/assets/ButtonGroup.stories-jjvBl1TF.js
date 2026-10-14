import{j as t}from"./jsx-runtime-D_zvdyIk.js";import{r as B}from"./index-UiW3gZKV.js";import"./_commonjsHelpers-CqkleIqs.js";const r=B.forwardRef(({children:y,vertical:h=!1,className:x="","aria-label":m,"aria-labelledby":g,...f},v)=>t.jsx("div",{ref:v,role:"group","aria-label":m,"aria-labelledby":g,className:`flex ${h?"flex-col":""} gap-1 ${x}`,...f,children:y}));r.displayName="ButtonGroup";r.__docgenInfo={description:`ButtonGroup - A container for grouping related buttons together

Provides proper accessibility semantics with role="group" and
optional accessible label. Uses flexbox for layout.

@example
\`\`\`tsx
<ButtonGroup aria-label="Text formatting">
  <Button variant="ghost"><BoldIcon /></Button>
  <Button variant="ghost"><ItalicIcon /></Button>
  <Button variant="ghost"><UnderlineIcon /></Button>
</ButtonGroup>
\`\`\`

@example
\`\`\`tsx
<ButtonGroup vertical aria-label="Navigation">
  <Button>Previous</Button>
  <Button>Next</Button>
</ButtonGroup>
\`\`\`

@component
@category Primitives`,methods:[],displayName:"ButtonGroup",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},vertical:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},"aria-label":{required:!1,tsType:{name:"string"},description:""},"aria-labelledby":{required:!1,tsType:{name:"string"},description:""},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["HTMLAttributes"]};const T={title:"Primitives/ButtonGroup",component:r,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["primary","secondary","outline"]},size:{control:{type:"select"},options:["sm","md","lg"]}}},e={args:{children:[t.jsx("button",{type:"button",children:"One"},"1"),t.jsx("button",{type:"button",children:"Two"},"2"),t.jsx("button",{type:"button",children:"Three"},"3")]}},o={args:{children:[t.jsx("button",{type:"button",children:t.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[t.jsx("polyline",{points:"4 17 10 11 4 5"}),t.jsx("line",{x1:"12",y1:"19",x2:"20",y2:"19"})]})},"1"),t.jsx("button",{type:"button",children:t.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[t.jsx("polyline",{points:"10 17 16 11 10 5"}),t.jsx("line",{x1:"4",y1:"19",x2:"12",y2:"19"})]})},"2"),t.jsx("button",{type:"button",children:t.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[t.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),t.jsx("polyline",{points:"19 12 12 19 5 12"})]})},"3")]}},n={args:{size:"sm",children:[t.jsx("button",{type:"button",children:"Left"},"1"),t.jsx("button",{type:"button",children:"Center"},"2"),t.jsx("button",{type:"button",children:"Right"},"3")]}};var s,i,a;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    children: [<button type="button" key="1">One</button>, <button type="button" key="2">Two</button>, <button type="button" key="3">Three</button>]
  }
}`,...(a=(i=e.parameters)==null?void 0:i.docs)==null?void 0:a.source}}};var l,u,p;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    children: [<button type="button" key="1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg></button>, <button type="button" key="2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="10 17 16 11 10 5" /><line x1="4" y1="19" x2="12" y2="19" /></svg></button>, <button type="button" key="3"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg></button>]
  }
}`,...(p=(u=o.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};var c,d,b;n.parameters={...n.parameters,docs:{...(c=n.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    size: 'sm',
    children: [<button type="button" key="1">Left</button>, <button type="button" key="2">Center</button>, <button type="button" key="3">Right</button>]
  }
}`,...(b=(d=n.parameters)==null?void 0:d.docs)==null?void 0:b.source}}};const G=["Default","WithIcons","Small"];export{e as Default,n as Small,o as WithIcons,G as __namedExportsOrder,T as default};
