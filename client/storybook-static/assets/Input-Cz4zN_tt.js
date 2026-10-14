import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{r as o}from"./index-UiW3gZKV.js";const d=o.forwardRef(({label:t,hint:a,error:s,id:p,className:c="",...n},m)=>{const u=o.useId(),r=p||u,l=a?`${r}-hint`:void 0,i=s?`${r}-error`:void 0,f=[l,i].filter(Boolean).join(" ")||void 0;return e.jsxs("div",{className:"flex flex-col gap-1",children:[t&&e.jsxs("label",{htmlFor:r,className:"label",children:[t,n.required&&e.jsx("span",{className:"text-danger ml-1","aria-hidden":"true",children:"*"})]}),e.jsx("input",{ref:m,id:r,className:`input ${c}`,"aria-describedby":f,"aria-invalid":s?"true":"false","aria-errormessage":i,...n}),a&&!s&&e.jsx("p",{id:l,className:"form-hint",children:a}),s&&e.jsx("p",{id:i,className:"form-error",role:"alert",children:s})]})});d.displayName="Input";d.__docgenInfo={description:`Input - A styled text input component wrapping the .input utility class

Supports label, hint, error states, and full accessibility attributes.
Automatically generates unique IDs for association with label/hint/error.

@example
\`\`\`tsx
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  hint="We'll never share your email"
  error={errors.email?.message}
/>
\`\`\`

@component
@category Primitives`,methods:[],displayName:"Input",props:{label:{required:!1,tsType:{name:"string"},description:""},hint:{required:!1,tsType:{name:"string"},description:""},error:{required:!1,tsType:{name:"string"},description:""},id:{required:!1,tsType:{name:"string"},description:""},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["Omit"]};export{d as I};
