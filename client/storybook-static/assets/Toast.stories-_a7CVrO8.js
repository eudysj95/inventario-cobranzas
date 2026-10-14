import{j as s}from"./jsx-runtime-D_zvdyIk.js";import{T as e}from"./Toast-CZDNvPF9.js";import"./index-UiW3gZKV.js";import"./_commonjsHelpers-CqkleIqs.js";import"./IconButton-CqAFpNZL.js";const U={title:"Primitives/Toast",component:e,parameters:{layout:"centered",docs:{description:{component:"A notification toast component wrapping the .alert utility classes. Used for transient notifications with optional action button and close button."}}},tags:["autodocs"],argTypes:{variant:{control:"select",options:["success","error","warning","info"]},message:{control:"text"},action:{control:"object"},onClose:{action:"closed"}}},a={args:{message:"Changes saved successfully!",variant:"success"}},r={args:{message:"Failed to save changes. Please try again.",variant:"error"}},t={args:{message:"Your session will expire in 5 minutes.",variant:"warning"}},n={args:{message:"New feature available! Check out the updates.",variant:"info"}},o={args:{message:"Item deleted",variant:"success",action:{label:"Undo",onClick:()=>alert("Undo clicked!")}}},c={render:()=>s.jsxs("div",{className:"flex flex-col gap-2 w-80",children:[s.jsx(e,{message:"Success toast",variant:"success"}),s.jsx(e,{message:"Error toast",variant:"error"}),s.jsx(e,{message:"Warning toast",variant:"warning"}),s.jsx(e,{message:"Info toast",variant:"info"})]})};var i,m,l;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    message: "Changes saved successfully!",
    variant: "success"
  }
}`,...(l=(m=a.parameters)==null?void 0:m.docs)==null?void 0:l.source}}};var g,d,u;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    message: "Failed to save changes. Please try again.",
    variant: "error"
  }
}`,...(u=(d=r.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var p,v,f;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    message: "Your session will expire in 5 minutes.",
    variant: "warning"
  }
}`,...(f=(v=t.parameters)==null?void 0:v.docs)==null?void 0:f.source}}};var x,h,w;n.parameters={...n.parameters,docs:{...(x=n.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    message: "New feature available! Check out the updates.",
    variant: "info"
  }
}`,...(w=(h=n.parameters)==null?void 0:h.docs)==null?void 0:w.source}}};var S,j,T;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    message: "Item deleted",
    variant: "success",
    action: {
      label: "Undo",
      onClick: () => alert("Undo clicked!")
    }
  }
}`,...(T=(j=o.parameters)==null?void 0:j.docs)==null?void 0:T.source}}};var b,y,C;c.parameters={...c.parameters,docs:{...(b=c.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-2 w-80">
      <Toast message="Success toast" variant="success" />
      <Toast message="Error toast" variant="error" />
      <Toast message="Warning toast" variant="warning" />
      <Toast message="Info toast" variant="info" />
    </div>
}`,...(C=(y=c.parameters)==null?void 0:y.docs)==null?void 0:C.source}}};const N=["Success","Error","Warning","Info","WithAction","AllVariants"];export{c as AllVariants,r as Error,n as Info,a as Success,t as Warning,o as WithAction,N as __namedExportsOrder,U as default};
