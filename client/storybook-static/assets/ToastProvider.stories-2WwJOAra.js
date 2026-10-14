import{j as s}from"./jsx-runtime-D_zvdyIk.js";import{T as n,u}from"./ToastProvider-Da1D-Lp6.js";import{B as o}from"./Button-COGFzxFC.js";import"./index-UiW3gZKV.js";import"./_commonjsHelpers-CqkleIqs.js";import"./index-3b7XovMV.js";import"./index-BA8NevWa.js";import"./Toast-CZDNvPF9.js";import"./IconButton-CqAFpNZL.js";function h(){const{toast:t,dismissAll:m}=u();return s.jsxs("div",{className:"space-y-2",children:[s.jsx(o,{onClick:()=>t({variant:"success",title:"Success!",description:"Operation completed successfully"}),children:"Show Success"}),s.jsx(o,{onClick:()=>t({variant:"error",title:"Error!",description:"Something went wrong"}),variant:"destructive",children:"Show Error"}),s.jsx(o,{onClick:()=>t({variant:"warning",title:"Warning!",description:"Please be careful"}),variant:"outline",children:"Show Warning"}),s.jsx(o,{onClick:()=>t({variant:"info",title:"Info",description:"Just an informational message"}),variant:"secondary",children:"Show Info"}),s.jsx(o,{onClick:()=>t({variant:"success",title:"Saved",description:"Your changes were saved",action:{label:"Undo",onClick:()=>alert("Undo clicked!")}}),children:"Show With Action"}),s.jsx(o,{onClick:()=>t({variant:"success",title:"No Auto-dismiss",description:"This toast stays until dismissed",duration:0}),children:"Show Persistent"}),s.jsx(o,{onClick:m,variant:"ghost",children:"Dismiss All"})]})}const C={title:"Primitives/ToastProvider",component:n,parameters:{layout:"centered",docs:{description:{component:"ToastProvider manages toast notifications via portal. Wrap your app with it and use the useToast hook to show toasts."}}},tags:["autodocs"],decorators:[t=>s.jsx(n,{children:s.jsx(t,{})})]},r={render:()=>s.jsx(h,{})},e={render:()=>{const{toast:t}=u();return s.jsx(o,{onClick:()=>{t({variant:"success",title:"Toast 1",description:"First toast"}),t({variant:"error",title:"Toast 2",description:"Second toast"}),t({variant:"warning",title:"Toast 3",description:"Third toast"})},children:"Show 3 Toasts"})}};var i,a,c;r.parameters={...r.parameters,docs:{...(i=r.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => <ToastDemo />
}`,...(c=(a=r.parameters)==null?void 0:a.docs)==null?void 0:c.source}}};var d,l,p;e.parameters={...e.parameters,docs:{...(d=e.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => {
    const {
      toast
    } = useToast();
    return <Button onClick={() => {
      toast({
        variant: "success",
        title: "Toast 1",
        description: "First toast"
      });
      toast({
        variant: "error",
        title: "Toast 2",
        description: "Second toast"
      });
      toast({
        variant: "warning",
        title: "Toast 3",
        description: "Third toast"
      });
    }}>
        Show 3 Toasts
      </Button>;
  }
}`,...(p=(l=e.parameters)==null?void 0:l.docs)==null?void 0:p.source}}};const y=["Default","MultipleToasts"];export{r as Default,e as MultipleToasts,y as __namedExportsOrder,C as default};
