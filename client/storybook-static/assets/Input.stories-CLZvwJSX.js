import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{I as a}from"./Input-Cz4zN_tt.js";import"./index-UiW3gZKV.js";import"./_commonjsHelpers-CqkleIqs.js";const P={title:"Primitives/Input",component:a,parameters:{layout:"centered",docs:{description:{component:"A styled text input component wrapping the .input utility class. Supports label, hint, error states, and full accessibility attributes."}}},tags:["autodocs"],argTypes:{label:{control:"text"},type:{control:"select",options:["text","email","password","number","tel","url"]},placeholder:{control:"text"},disabled:{control:"boolean"},required:{control:"boolean"},error:{control:"text"},hint:{control:"text"},value:{control:"text"},onChange:{action:"changed"}}},r={args:{label:"Email",placeholder:"you@example.com"}},t={args:{label:"Password",type:"password",placeholder:"Enter password",hint:"Must be at least 8 characters"}},l={args:{label:"Email",type:"email",value:"invalid-email",error:"Please enter a valid email address"}},s={args:{label:"Disabled Input",placeholder:"Cannot edit",disabled:!0}},o={args:{label:"Username",placeholder:"Enter username",required:!0}},n={render:()=>e.jsxs("div",{className:"flex flex-col gap-4 w-80",children:[e.jsx(a,{label:"Default",placeholder:"Default state"}),e.jsx(a,{label:"With Hint",placeholder:"Has hint",hint:"Helper text here"}),e.jsx(a,{label:"Error State",value:"invalid",error:"This field has an error"}),e.jsx(a,{label:"Disabled",placeholder:"Disabled",disabled:!0})]})};var i,d,c;r.parameters={...r.parameters,docs:{...(i=r.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    label: "Email",
    placeholder: "you@example.com"
  }
}`,...(c=(d=r.parameters)==null?void 0:d.docs)==null?void 0:c.source}}};var p,u,m;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    label: "Password",
    type: "password",
    placeholder: "Enter password",
    hint: "Must be at least 8 characters"
  }
}`,...(m=(u=t.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var h,b,x;l.parameters={...l.parameters,docs:{...(h=l.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: "Email",
    type: "email",
    value: "invalid-email",
    error: "Please enter a valid email address"
  }
}`,...(x=(b=l.parameters)==null?void 0:b.docs)==null?void 0:x.source}}};var g,f,v;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    label: "Disabled Input",
    placeholder: "Cannot edit",
    disabled: true
  }
}`,...(v=(f=s.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var D,E,y;o.parameters={...o.parameters,docs:{...(D=o.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    label: "Username",
    placeholder: "Enter username",
    required: true
  }
}`,...(y=(E=o.parameters)==null?void 0:E.docs)==null?void 0:y.source}}};var S,w,I;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4 w-80">
      <Input label="Default" placeholder="Default state" />
      <Input label="With Hint" placeholder="Has hint" hint="Helper text here" />
      <Input label="Error State" value="invalid" error="This field has an error" />
      <Input label="Disabled" placeholder="Disabled" disabled />
    </div>
}`,...(I=(w=n.parameters)==null?void 0:w.docs)==null?void 0:I.source}}};const A=["Default","WithHint","WithError","Disabled","Required","AllStates"];export{n as AllStates,r as Default,s as Disabled,o as Required,l as WithError,t as WithHint,A as __namedExportsOrder,P as default};
