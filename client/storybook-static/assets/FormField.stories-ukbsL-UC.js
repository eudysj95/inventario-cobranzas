import{F as D}from"./FormField-DBkHzi2c.js";import"./jsx-runtime-D_zvdyIk.js";import"./index-UiW3gZKV.js";import"./_commonjsHelpers-CqkleIqs.js";const q={title:"Primitives/FormField",component:D,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{type:{control:{type:"select"},options:["text","email","password","number","tel","url"]}}},e={args:{label:"Email",type:"email",placeholder:"Enter email"}},r={args:{label:"Name",required:!0,placeholder:"Enter name"}},a={args:{label:"Email",type:"email",error:"Invalid email format"}},s={args:{label:"Password",type:"password",help:"Must be at least 8 characters"}},t={args:{label:"Disabled",disabled:!0,value:"Cannot edit"}};var o,l,n;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'Enter email'
  }
}`,...(n=(l=e.parameters)==null?void 0:l.docs)==null?void 0:n.source}}};var i,m,c;r.parameters={...r.parameters,docs:{...(i=r.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    label: 'Name',
    required: true,
    placeholder: 'Enter name'
  }
}`,...(c=(m=r.parameters)==null?void 0:m.docs)==null?void 0:c.source}}};var p,d,u;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    type: 'email',
    error: 'Invalid email format'
  }
}`,...(u=(d=a.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var b,g,h;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    label: 'Password',
    type: 'password',
    help: 'Must be at least 8 characters'
  }
}`,...(h=(g=s.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};var E,y,f;t.parameters={...t.parameters,docs:{...(E=t.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    label: 'Disabled',
    disabled: true,
    value: 'Cannot edit'
  }
}`,...(f=(y=t.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};const W=["Default","Required","WithError","WithHelp","Disabled"];export{e as Default,t as Disabled,r as Required,a as WithError,s as WithHelp,W as __namedExportsOrder,q as default};
