import{j as r}from"./jsx-runtime-D_zvdyIk.js";import{r as f,R as l}from"./index-UiW3gZKV.js";function y({children:i,label:t,hint:s,error:e,required:d=!1,id:c,className:m=""}){const p=f.useId(),a=c||p,o=s?`${a}-hint`:void 0,n=e?`${a}-error`:void 0,u=l.isValidElement(i)?l.cloneElement(i,{"aria-describedby":[o,n].filter(Boolean).join(" ")||void 0,"aria-invalid":e?"true":"false","aria-errormessage":n,id:a}):i;return r.jsxs("div",{className:`flex flex-col gap-1 ${m}`,children:[t&&r.jsxs("label",{htmlFor:a,className:"label",children:[t,d&&r.jsx("span",{className:"text-danger ml-1","aria-hidden":"true",children:"*"})]}),u,s&&!e&&r.jsx("p",{id:o,className:"form-hint",children:s}),e&&r.jsx("p",{id:n,className:"form-error",role:"alert",children:e})]})}y.__docgenInfo={description:`FormField - A wrapper component for consistent form field layout

Provides standardized spacing, label association, hint/error display,
and accessibility attributes. Works with any form input component.

@example
\`\`\`tsx
<FormField label="Email" required hint="We'll never share your email" error={errors.email}>
  <Input type="email" placeholder="you@example.com" />
</FormField>
\`\`\`

@component
@category Primitives`,methods:[],displayName:"FormField",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},label:{required:!1,tsType:{name:"string"},description:""},hint:{required:!1,tsType:{name:"string"},description:""},error:{required:!1,tsType:{name:"string"},description:""},required:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},id:{required:!1,tsType:{name:"string"},description:""},className:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}}}};export{y as F};
