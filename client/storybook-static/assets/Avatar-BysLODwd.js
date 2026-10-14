import{j as a}from"./jsx-runtime-D_zvdyIk.js";import{r as y}from"./index-UiW3gZKV.js";const i=y.forwardRef(({src:l,alt:o,name:s,size:r="md",shape:u="circle",status:t,className:m="",children:d,...c},p)=>{const f={xs:"w-6 h-6 text-xs",sm:"w-8 h-8 text-sm",md:"w-10 h-10 text-base",lg:"w-12 h-12 text-lg",xl:"w-16 h-16 text-xl"},g={circle:"rounded-full",square:"rounded-lg"},v={online:"bg-success",offline:"bg-border-strong",busy:"bg-danger",away:"bg-warning"},x=s?(w=>{var n;const e=w.trim().split(/\s+/);return e.length===1?((n=e[0][0])==null?void 0:n.toUpperCase())||"?":(e[0][0]+e[e.length-1][0]).toUpperCase()})(s):"?",h=t?a.jsx("span",{className:`absolute bottom-0 right-0 w-2.5 h-2.5 ${r==="xs"?"w-1.5 h-1.5":""} ${v[t]} border-2 border-surface rounded-full`,"aria-label":`Status: ${t}`}):null;return a.jsxs("div",{ref:p,className:`relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-primary-light text-primary font-medium ${f[r]} ${g[u]} ${m}`,...c,children:[l?a.jsx("img",{src:l,alt:o||s||"Avatar",className:"w-full h-full object-cover"}):a.jsx("span",{"aria-hidden":"true",children:x}),h,d]})});i.displayName="Avatar";i.__docgenInfo={description:`Avatar - A user profile image component with fallback initials and status indicator

Displays an image when src is provided, otherwise generates initials from name.
Supports status indicators (online/offline/busy/away) and multiple sizes.

@example
\`\`\`tsx
<Avatar src="/user.jpg" alt="John Doe" size="lg" status="online" />
<Avatar name="Jane Smith" size="sm" />
<Avatar name="Admin" shape="square" size="xl" />
\`\`\`

@component
@category Primitives`,methods:[],displayName:"Avatar",props:{src:{required:!1,tsType:{name:"string"},description:""},alt:{required:!1,tsType:{name:"string"},description:""},name:{required:!1,tsType:{name:"string"},description:""},size:{required:!1,tsType:{name:"union",raw:'"xs" | "sm" | "md" | "lg" | "xl"',elements:[{name:"literal",value:'"xs"'},{name:"literal",value:'"sm"'},{name:"literal",value:'"md"'},{name:"literal",value:'"lg"'},{name:"literal",value:'"xl"'}]},description:"",defaultValue:{value:'"md"',computed:!1}},shape:{required:!1,tsType:{name:"union",raw:'"circle" | "square"',elements:[{name:"literal",value:'"circle"'},{name:"literal",value:'"square"'}]},description:"",defaultValue:{value:'"circle"',computed:!1}},status:{required:!1,tsType:{name:"union",raw:'"online" | "offline" | "busy" | "away"',elements:[{name:"literal",value:'"online"'},{name:"literal",value:'"offline"'},{name:"literal",value:'"busy"'},{name:"literal",value:'"away"'}]},description:""},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["HTMLAttributes"]};export{i as A};
