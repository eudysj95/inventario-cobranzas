import{j as t}from"./jsx-runtime-D_zvdyIk.js";import{r as x}from"./index-UiW3gZKV.js";const o=x.forwardRef(({variant:u="primary",size:n="md",disabled:d=!1,loading:e=!1,fullWidth:f=!1,children:s,href:l,className:m="",...r},p)=>{const c=!!l,a=d||e,v=["btn",`btn-${u}`,n!=="md"&&`btn-${n}`,f&&"w-full",m].filter(Boolean).join(" "),i={ref:p,className:v,"aria-disabled":a||void 0,"aria-busy":e||void 0,...a?{tabIndex:-1}:{}};return c?t.jsxs("a",{...i,href:l,...r,onClick:b=>{a&&b.preventDefault()},children:[e&&t.jsx("span",{className:"spinner","aria-hidden":"true"}),s]}):t.jsxs("button",{...i,type:"button",disabled:a,...r,children:[e&&t.jsx("span",{className:"spinner","aria-hidden":"true"}),s]})});o.displayName="Button";o.__docgenInfo={description:`Button - A versatile button component wrapping the .btn utility classes

@example
\`\`\`tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Save
</Button>
\`\`\`

@example
\`\`\`tsx
<Button href="/login" variant="ghost">
  Sign in
</Button>
\`\`\`

@component
@category Primitives`,methods:[],displayName:"Button",props:{variant:{defaultValue:{value:'"primary"',computed:!1},required:!1},size:{defaultValue:{value:'"md"',computed:!1},required:!1},disabled:{defaultValue:{value:"false",computed:!1},required:!1},loading:{defaultValue:{value:"false",computed:!1},required:!1},fullWidth:{defaultValue:{value:"false",computed:!1},required:!1},className:{defaultValue:{value:'""',computed:!1},required:!1}}};export{o as B};
