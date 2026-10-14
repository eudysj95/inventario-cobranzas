import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{r as s}from"./index-UiW3gZKV.js";import{I as N}from"./IconButton-CqAFpNZL.js";const v=s.forwardRef(({title:n,description:r,variant:h="info",action:i,onClose:t,duration:a=4e3,className:g="",...u},x)=>{const w=["alert",{success:"alert-success",error:"alert-error",warning:"alert-warning",info:"alert-info"}[h],g].filter(Boolean).join(" "),[c,d]=s.useState(!1),[m,b]=s.useState(100),o=s.useRef(),l=s.useRef(Date.now()),p=s.useRef(0);s.useEffect(()=>{if(a<=0)return;const j=()=>{if(c)return;const k=Date.now()-l.current-p.current,f=Math.max(0,100-k/a*100);b(f),f<=0&&t&&t()};return o.current=window.setInterval(j,50),()=>{o.current&&window.clearInterval(o.current)}},[a,c,t]);const y=()=>{d(!0),p.current+=Date.now()-l.current},T=()=>{d(!1),l.current=Date.now()};return e.jsxs("div",{ref:x,className:w,role:"status","aria-live":"polite","aria-atomic":"true",onMouseEnter:y,onMouseLeave:T,style:{position:"relative",minWidth:"300px",maxWidth:"400px"},...u,children:[e.jsxs("div",{className:"flex-1",children:[n&&e.jsx("div",{className:"font-medium",children:n}),r&&e.jsx("div",{className:"text-sm opacity-90",children:r}),!n&&!r&&e.jsx("span",{className:"flex-1",children:u.children})]}),e.jsxs("div",{className:"flex items-center gap-2 ml-4",children:[i&&e.jsx("button",{type:"button",className:"btn btn-ghost btn-sm",onClick:i.onClick,children:i.label}),t&&e.jsx(N,{"aria-label":"Close toast",icon:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M18 6L6 18M6 6l12 12"})}),variant:"ghost",size:"sm",onClick:t})]}),a>0&&e.jsx("div",{className:"toast-progress",role:"progressbar","aria-valuenow":Math.round(m),"aria-valuemin":0,"aria-valuemax":100,style:{position:"absolute",bottom:0,left:0,height:"3px",background:"currentColor",opacity:.4,width:`${m}%`,transition:"width 0.1s linear",borderRadius:"0 0 inherit inherit"}})]})});v.displayName="Toast";v.__docgenInfo={description:`Toast - A notification toast component wrapping the .alert utility classes

Used for transient notifications with optional action button and close button.
Designed to be used with ToastProvider for managed stacking and auto-dismiss.
Supports auto-dismiss with progress bar, pause on hover.

@example
\`\`\`tsx
<Toast
  title="Changes saved"
  description="Your changes have been saved successfully"
  variant="success"
  action={{ label: "Undo", onClick: handleUndo }}
  onClose={handleClose}
  duration={4000}
/>
\`\`\`

@component
@category Primitives`,methods:[],displayName:"Toast",props:{title:{required:!1,tsType:{name:"string"},description:""},description:{required:!1,tsType:{name:"string"},description:""},variant:{required:!1,tsType:{name:"union",raw:'"success" | "error" | "warning" | "info"',elements:[{name:"literal",value:'"success"'},{name:"literal",value:'"error"'},{name:"literal",value:'"warning"'},{name:"literal",value:'"info"'}]},description:"",defaultValue:{value:'"info"',computed:!1}},action:{required:!1,tsType:{name:"signature",type:"object",raw:"{ label: string; onClick: () => void }",signature:{properties:[{key:"label",value:{name:"string",required:!0}},{key:"onClick",value:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}},required:!0}}]}},description:""},onClose:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},duration:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"4000",computed:!1}},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["HTMLAttributes"]};export{v as T};
