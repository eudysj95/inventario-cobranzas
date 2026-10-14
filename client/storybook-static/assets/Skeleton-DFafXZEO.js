import{j as c}from"./jsx-runtime-D_zvdyIk.js";import{r as u}from"./index-UiW3gZKV.js";const r=u.forwardRef(({variant:n="rectangular",width:a,height:t,className:l="",...s},i)=>{const o={text:"h-4 rounded",circular:"rounded-full",rectangular:"rounded-lg"},e={};return a&&(e.width=a),t&&(e.height=t),c.jsx("div",{ref:i,"data-testid":"skeleton",className:`animate-pulse bg-surface-hover ${o[n]} ${l}`,style:e,...s})});r.displayName="Skeleton";r.__docgenInfo={description:`Skeleton - A placeholder component for loading states

Displays a shimmering placeholder while content loads.
Supports text lines, circular (avatars), and rectangular (cards) variants.

@example
\`\`\`tsx
<Skeleton variant="text" width="60%" />
<Skeleton variant="circular" width="40px" height="40px" />
<Skeleton variant="rectangular" height="200px" />
\`\`\`

@component
@category Primitives`,methods:[],displayName:"Skeleton",props:{variant:{required:!1,tsType:{name:"union",raw:'"text" | "circular" | "rectangular"',elements:[{name:"literal",value:'"text"'},{name:"literal",value:'"circular"'},{name:"literal",value:'"rectangular"'}]},description:"",defaultValue:{value:'"rectangular"',computed:!1}},width:{required:!1,tsType:{name:"string"},description:""},height:{required:!1,tsType:{name:"string"},description:""},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["HTMLAttributes"]};export{r as S};
