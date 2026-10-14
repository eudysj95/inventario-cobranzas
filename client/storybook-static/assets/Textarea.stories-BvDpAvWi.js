import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{r as x}from"./index-UiW3gZKV.js";import"./_commonjsHelpers-CqkleIqs.js";const p=x.forwardRef(({label:u,hint:d,error:r,id:M,className:$="",...g},H)=>{const O=x.useId(),a=M||O,h=d?`${a}-hint`:void 0,m=r?`${a}-error`:void 0,P=[h,m].filter(Boolean).join(" ")||void 0;return e.jsxs("div",{className:"flex flex-col gap-1",children:[u&&e.jsxs("label",{htmlFor:a,className:"label",children:[u,g.required&&e.jsx("span",{className:"text-danger ml-1","aria-hidden":"true",children:"*"})]}),e.jsx("textarea",{ref:H,id:a,className:`textarea ${$}`,"aria-describedby":P,"aria-invalid":r?"true":"false","aria-errormessage":m,...g}),d&&!r&&e.jsx("p",{id:h,className:"form-hint",children:d}),r&&e.jsx("p",{id:m,className:"form-error",role:"alert",children:r})]})});p.displayName="Textarea";p.__docgenInfo={description:`Textarea - A styled multi-line text input component wrapping the .textarea utility class

Supports label, hint, error states, and full accessibility attributes.
Automatically generates unique IDs for association with label/hint/error.

@example
\`\`\`tsx
<Textarea
  label="Description"
  rows={4}
  placeholder="Enter product description"
  hint="Max 500 characters"
  error={errors.description?.message}
/>
\`\`\`

@component
@category Primitives`,methods:[],displayName:"Textarea",props:{label:{required:!1,tsType:{name:"string"},description:""},hint:{required:!1,tsType:{name:"string"},description:""},error:{required:!1,tsType:{name:"string"},description:""},id:{required:!1,tsType:{name:"string"},description:""},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["Omit"]};const k={title:"Primitives/Textarea",component:p,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{size:{control:{type:"select"},options:["sm","md","lg"]}}},s={args:{label:"Description",placeholder:"Enter description"}},t={args:{label:"Comments",required:!0,placeholder:"Your comments"}},o={args:{label:"Bio",error:"Maximum 500 characters"}},n={args:{label:"Address",help:"Include street, city, and postal code"}},l={args:{label:"Disabled",disabled:!0,value:"Cannot edit"}},i={args:{size:"sm",label:"Small",placeholder:"Small textarea"}},c={args:{size:"lg",label:"Large",placeholder:"Large textarea"}};var b,f,y;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    label: 'Description',
    placeholder: 'Enter description'
  }
}`,...(y=(f=s.parameters)==null?void 0:f.docs)==null?void 0:y.source}}};var S,q,T;t.parameters={...t.parameters,docs:{...(S=t.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    label: 'Comments',
    required: true,
    placeholder: 'Your comments'
  }
}`,...(T=(q=t.parameters)==null?void 0:q.docs)==null?void 0:T.source}}};var v,D,j;o.parameters={...o.parameters,docs:{...(v=o.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    label: 'Bio',
    error: 'Maximum 500 characters'
  }
}`,...(j=(D=o.parameters)==null?void 0:D.docs)==null?void 0:j.source}}};var N,E,I;n.parameters={...n.parameters,docs:{...(N=n.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    label: 'Address',
    help: 'Include street, city, and postal code'
  }
}`,...(I=(E=n.parameters)==null?void 0:E.docs)==null?void 0:I.source}}};var L,z,w;l.parameters={...l.parameters,docs:{...(L=l.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    label: 'Disabled',
    disabled: true,
    value: 'Cannot edit'
  }
}`,...(w=(z=l.parameters)==null?void 0:z.docs)==null?void 0:w.source}}};var A,B,C;i.parameters={...i.parameters,docs:{...(A=i.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    size: 'sm',
    label: 'Small',
    placeholder: 'Small textarea'
  }
}`,...(C=(B=i.parameters)==null?void 0:B.docs)==null?void 0:C.source}}};var R,W,_;c.parameters={...c.parameters,docs:{...(R=c.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    size: 'lg',
    label: 'Large',
    placeholder: 'Large textarea'
  }
}`,...(_=(W=c.parameters)==null?void 0:W.docs)==null?void 0:_.source}}};const G=["Default","Required","WithError","WithHelp","Disabled","Small","Large"];export{s as Default,l as Disabled,c as Large,t as Required,i as Small,o as WithError,n as WithHelp,G as __namedExportsOrder,k as default};
