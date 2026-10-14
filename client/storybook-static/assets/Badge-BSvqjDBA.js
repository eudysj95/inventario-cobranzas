import{j as a}from"./jsx-runtime-D_zvdyIk.js";import{r as u}from"./index-UiW3gZKV.js";const n=u.forwardRef(({variant:s="neutral",size:t="md",dot:e=!1,className:l="",children:r,...i},o)=>{const d=["chip",`chip-${s}`,t==="sm"&&"chip-sm",e&&"flex items-center gap-1",l].filter(Boolean).join(" ");return a.jsxs("span",{ref:o,className:d,...i,children:[e&&a.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-current","aria-hidden":"true"}),r]})});n.displayName="Badge";n.__docgenInfo={description:`Badge - A small status indicator component wrapping the .chip utility classes

Used for labels, status indicators, counts, and categorization.
Supports a dot variant for status indicators (online/offline, etc.).

@example
\`\`\`tsx
<Badge variant="success">Active</Badge>
<Badge variant="danger" dot>Offline</Badge>
<Badge variant="warning" size="sm">Pending</Badge>
\`\`\`

@component
@category Primitives`,methods:[],displayName:"Badge",props:{variant:{required:!1,tsType:{name:"union",raw:'"primary" | "success" | "warning" | "danger" | "info" | "neutral"',elements:[{name:"literal",value:'"primary"'},{name:"literal",value:'"success"'},{name:"literal",value:'"warning"'},{name:"literal",value:'"danger"'},{name:"literal",value:'"info"'},{name:"literal",value:'"neutral"'}]},description:"",defaultValue:{value:'"neutral"',computed:!1}},size:{required:!1,tsType:{name:"union",raw:'"sm" | "md"',elements:[{name:"literal",value:'"sm"'},{name:"literal",value:'"md"'}]},description:"",defaultValue:{value:'"md"',computed:!1}},dot:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["HTMLAttributes"]};export{n as B};
