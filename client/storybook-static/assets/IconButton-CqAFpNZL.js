import{j as n}from"./jsx-runtime-D_zvdyIk.js";import{r as y}from"./index-UiW3gZKV.js";const t=y.forwardRef(({icon:s,"aria-label":r,"aria-labelledby":i,variant:o="ghost",size:l="md",disabled:d=!1,loading:e=!1,round:u=!1,className:m="",children:c,...p},f)=>{const a=d||e,b=["btn",`btn-${o}`,l!=="md"&&`btn-${l}`,u&&"rounded-full",m].filter(Boolean).join(" ");return n.jsxs("button",{ref:f,className:b,disabled:a,"aria-label":r,"aria-labelledby":i,"aria-disabled":a||void 0,"aria-busy":e||void 0,tabIndex:a?-1:void 0,...p,children:[e?n.jsx("span",{className:"spinner","aria-hidden":"true"}):n.jsx("span",{"aria-hidden":"true",children:s}),c]})});t.displayName="IconButton";t.__docgenInfo={description:`IconButton - A button that displays only an icon, with proper accessibility

@example
\`\`\`tsx
<IconButton
  aria-label="Delete item"
  icon={<TrashIcon />}
  variant="danger"
  onClick={handleDelete}
/>
\`\`\`

@example
\`\`\`tsx
<IconButton
  aria-label="Close modal"
  icon={<XIcon />}
  variant="ghost"
  round
  onClick={handleClose}
/>
\`\`\`

@component
@category Primitives`,methods:[],displayName:"IconButton",props:{icon:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},"aria-label":{required:!1,tsType:{name:"string"},description:""},"aria-labelledby":{required:!1,tsType:{name:"string"},description:""},variant:{required:!1,tsType:{name:"union",raw:'"primary" | "secondary" | "danger" | "ghost"',elements:[{name:"literal",value:'"primary"'},{name:"literal",value:'"secondary"'},{name:"literal",value:'"danger"'},{name:"literal",value:'"ghost"'}]},description:"",defaultValue:{value:'"ghost"',computed:!1}},size:{required:!1,tsType:{name:"union",raw:'"sm" | "md" | "lg"',elements:[{name:"literal",value:'"sm"'},{name:"literal",value:'"md"'},{name:"literal",value:'"lg"'}]},description:"",defaultValue:{value:'"md"',computed:!1}},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},loading:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},round:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["Omit"]};export{t as I};
