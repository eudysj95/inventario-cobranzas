import{j as t}from"./jsx-runtime-D_zvdyIk.js";import{S as r}from"./Skeleton-DFafXZEO.js";import"./index-UiW3gZKV.js";import"./_commonjsHelpers-CqkleIqs.js";const k={title:"Primitives/Skeleton",component:r,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["text","rectangular","circular"]}}},e={args:{variant:"text",width:"100%",count:3}},a={args:{variant:"rectangular",width:"200px",height:"100px"}},s={args:{variant:"circular",size:"48px"}},n={render:()=>t.jsxs("div",{style:{width:"300px"},children:[t.jsx(r,{variant:"rectangular",width:"100%",height:"150px"}),t.jsxs("div",{style:{padding:"16px"},children:[t.jsx(r,{variant:"text",width:"60%"}),t.jsx(r,{variant:"text",width:"40%"}),t.jsx(r,{variant:"text",width:"80%"})]})]})};var i,o,c;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    variant: 'text',
    width: '100%',
    count: 3
  }
}`,...(c=(o=e.parameters)==null?void 0:o.docs)==null?void 0:c.source}}};var d,p,l;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    variant: 'rectangular',
    width: '200px',
    height: '100px'
  }
}`,...(l=(p=a.parameters)==null?void 0:p.docs)==null?void 0:l.source}}};var x,u,m;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    variant: 'circular',
    size: '48px'
  }
}`,...(m=(u=s.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var g,h,v;n.parameters={...n.parameters,docs:{...(g=n.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div style={{
    width: '300px'
  }}>
      <Skeleton variant="rectangular" width="100%" height="150px" />
      <div style={{
      padding: '16px'
    }}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="80%" />
      </div>
    </div>
}`,...(v=(h=n.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};const C=["Text","Rectangular","Circular","Card"];export{n as Card,s as Circular,a as Rectangular,e as Text,C as __namedExportsOrder,k as default};
