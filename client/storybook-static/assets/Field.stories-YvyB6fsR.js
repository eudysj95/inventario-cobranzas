import{j as r}from"./jsx-runtime-D_zvdyIk.js";import{r as H,R as u}from"./index-UiW3gZKV.js";import"./_commonjsHelpers-CqkleIqs.js";function D({children:o,label:p,hint:d,error:e,required:R=!1,id:W,className:S=""}){const _=H.useId(),a=W||_,m=d&&!e?`${a}-hint`:void 0,c=e?`${a}-error`:void 0,A=u.isValidElement(o)?u.cloneElement(o,{"aria-describedby":[m,c].filter(Boolean).join(" ")||void 0,"aria-invalid":e?"true":"false","aria-errormessage":c,id:a}):o;return r.jsxs("div",{className:`field ${S}`,"data-testid":"field",children:[p&&r.jsxs("label",{htmlFor:a,className:"field-label",children:[p,R&&r.jsx("span",{className:"field-required","aria-hidden":"true",children:"*"})]}),A,d&&!e&&r.jsx("p",{id:m,className:"field-hint",children:d}),e&&r.jsx("p",{id:c,className:"field-error",role:"alert",children:e})]})}D.__docgenInfo={description:`Field - A wrapper for form fields providing consistent label, hint, error display, and accessibility

Features:
- Label with required indicator
- Hint text (hidden when error is present)
- Error message with aria-live="assertive" via role="alert"
- Automatic ID generation for label-input association
- aria-describedby linking input to hint/error
- aria-invalid on error

@example
\`\`\`tsx
<Field label="Email" required hint="We'll never share your email" error={errors.email}>
  <Input type="email" {...register("email")} />
</Field>
\`\`\``,methods:[],displayName:"Field",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""},label:{required:!1,tsType:{name:"string"},description:""},hint:{required:!1,tsType:{name:"string"},description:""},error:{required:!1,tsType:{name:"string"},description:""},required:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},id:{required:!1,tsType:{name:"string"},description:""},className:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}}}};const M={title:"Forms/Field",component:D,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{type:{control:{type:"select"},options:["text","email","password","number","tel","url"]}}},s={args:{label:"Email",type:"email",placeholder:"Enter email"}},i={args:{label:"Name",required:!0,placeholder:"Enter name"}},t={args:{label:"Email",type:"email",error:"Invalid email format"}},l={args:{label:"Password",type:"password",help:"Must be at least 8 characters"}},n={args:{label:"Disabled",disabled:!0,value:"Cannot edit"}};var f,b,h;s.parameters={...s.parameters,docs:{...(f=s.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'Enter email'
  }
}`,...(h=(b=s.parameters)==null?void 0:b.docs)==null?void 0:h.source}}};var g,y,v;i.parameters={...i.parameters,docs:{...(g=i.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    label: 'Name',
    required: true,
    placeholder: 'Enter name'
  }
}`,...(v=(y=i.parameters)==null?void 0:y.docs)==null?void 0:v.source}}};var E,q,x;t.parameters={...t.parameters,docs:{...(E=t.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    type: 'email',
    error: 'Invalid email format'
  }
}`,...(x=(q=t.parameters)==null?void 0:q.docs)==null?void 0:x.source}}};var N,w,F;l.parameters={...l.parameters,docs:{...(N=l.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    label: 'Password',
    type: 'password',
    help: 'Must be at least 8 characters'
  }
}`,...(F=(w=l.parameters)==null?void 0:w.docs)==null?void 0:F.source}}};var I,j,T;n.parameters={...n.parameters,docs:{...(I=n.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    label: 'Disabled',
    disabled: true,
    value: 'Cannot edit'
  }
}`,...(T=(j=n.parameters)==null?void 0:j.docs)==null?void 0:T.source}}};const P=["Default","Required","WithError","WithHelp","Disabled"];export{s as Default,n as Disabled,i as Required,t as WithError,l as WithHelp,P as __namedExportsOrder,M as default};
