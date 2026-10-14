import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{r as s}from"./index-UiW3gZKV.js";import{r as U}from"./index-3b7XovMV.js";import{I as $}from"./IconButton-CqAFpNZL.js";import{B as l}from"./Button-COGFzxFC.js";import"./_commonjsHelpers-CqkleIqs.js";import"./index-BA8NevWa.js";const i=s.forwardRef(({open:a,onClose:n,title:t,footerActions:x,size:R="md",closeOnBackdrop:F=!0,closeOnEscape:y=!0,className:V="",children:_,...K},H)=>{const b=s.useRef(null),C=s.useRef(null);if(s.useEffect(()=>{if(!a)return;const r=b.current;if(!r)return;C.current=document.activeElement,r.focus();const k=o=>{if(o.key==="Escape"&&y&&n(),o.key==="Tab"){const v=r.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),c=v[0],d=v[v.length-1];o.shiftKey&&document.activeElement===c?(o.preventDefault(),d==null||d.focus()):!o.shiftKey&&document.activeElement===d&&(o.preventDefault(),c==null||c.focus())}};return document.addEventListener("keydown",k),document.body.style.overflow="hidden",()=>{var o;document.removeEventListener("keydown",k),document.body.style.overflow="",(o=C.current)==null||o.focus()}},[a,y,n]),!a)return null;const P={sm:"max-w-md",md:"max-w-lg",lg:"max-w-xl",xl:"max-w-2xl",full:"max-w-4xl"},W=e.jsx("div",{className:"modal-backdrop",onClick:r=>{F&&r.target===r.currentTarget&&n()},role:"presentation",children:e.jsxs("div",{ref:b,className:`modal ${P[R]} ${V}`,role:"dialog","aria-modal":"true","aria-labelledby":t?"modal-title":void 0,tabIndex:-1,...K,children:[(t||x)&&e.jsxs("div",{className:"modal-header",children:[t&&e.jsx("h2",{id:"modal-title",className:"modal-title",children:t}),e.jsx($,{"aria-label":"Close",icon:e.jsx("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M18 6L6 18M6 6l12 12"})}),variant:"ghost",size:"sm",onClick:n})]}),e.jsx("div",{className:"modal-body",children:_}),x&&e.jsx("div",{className:"modal-footer",children:x})]})});return U.createPortal(W,document.body)});i.displayName="Modal";i.__docgenInfo={description:`Modal - An accessible dialog component with backdrop, focus trap, and animations

Uses portal to render at document root. Implements focus trapping, Escape key handling,
backdrop click handling, and proper ARIA attributes for accessibility.

@example
\`\`\`tsx
<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Delete"
  footerActions={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="danger" onClick={handleDelete}>Delete</Button>
    </>
  }
>
  <p>Are you sure you want to delete this item?</p>
</Modal>
\`\`\`

@component
@category Primitives`,methods:[],displayName:"Modal",props:{open:{required:!0,tsType:{name:"boolean"},description:""},onClose:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},title:{required:!1,tsType:{name:"string"},description:""},footerActions:{required:!1,tsType:{name:"ReactNode"},description:""},size:{required:!1,tsType:{name:"union",raw:'"sm" | "md" | "lg" | "xl" | "full"',elements:[{name:"literal",value:'"sm"'},{name:"literal",value:'"md"'},{name:"literal",value:'"lg"'},{name:"literal",value:'"xl"'},{name:"literal",value:'"full"'}]},description:"",defaultValue:{value:'"md"',computed:!1}},closeOnBackdrop:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}},closeOnEscape:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["HTMLAttributes"]};const ne={title:"Primitives/Modal",component:i,parameters:{layout:"centered",docs:{description:{component:"An accessible dialog component with backdrop, focus trap, and animations. Uses portal to render at document root."}}},tags:["autodocs"],argTypes:{open:{control:"boolean"},title:{control:"text"},size:{control:"select",options:["sm","md","lg","xl","full"]},closeOnBackdrop:{control:"boolean"},closeOnEscape:{control:"boolean"},onClose:{action:"closed"}}},h=a=>{const[n,t]=s.useState(a.open);return e.jsxs(e.Fragment,{children:[e.jsx(l,{onClick:()=>t(!0),children:"Open Modal"}),e.jsx(i,{...a,open:n,onClose:()=>t(!1),footerActions:e.jsxs(e.Fragment,{children:[e.jsx(l,{variant:"ghost",onClick:()=>t(!1),children:"Cancel"}),e.jsx(l,{variant:"primary",onClick:()=>t(!1),children:"Confirm"})]}),children:e.jsx("p",{children:"This is the modal content. You can put any content here including forms, text, or other components."})})]})},m={render:h,args:{title:"Modal Title",open:!1}},u={render:h,args:{title:"Small Modal",size:"sm",open:!1}},p={render:h,args:{title:"Large Modal",size:"lg",open:!1}},f={render:h,args:{open:!1}},g={render:()=>{const[a,n]=s.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(l,{variant:"danger",onClick:()=>n(!0),children:"Delete Item"}),e.jsx(i,{open:a,onClose:()=>n(!1),title:"Confirm Deletion",size:"sm",footerActions:e.jsxs(e.Fragment,{children:[e.jsx(l,{variant:"ghost",onClick:()=>n(!1),children:"Cancel"}),e.jsx(l,{variant:"danger",onClick:()=>n(!1),children:"Delete"})]}),children:e.jsx("p",{children:"Are you sure you want to delete this item? This action cannot be undone."})})]})}};var j,M,w;m.parameters={...m.parameters,docs:{...(j=m.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: ModalStory,
  args: {
    title: "Modal Title",
    open: false
  }
}`,...(w=(M=m.parameters)==null?void 0:M.docs)==null?void 0:w.source}}};var O,S,T;u.parameters={...u.parameters,docs:{...(O=u.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: ModalStory,
  args: {
    title: "Small Modal",
    size: "sm",
    open: false
  }
}`,...(T=(S=u.parameters)==null?void 0:S.docs)==null?void 0:T.source}}};var D,I,B;p.parameters={...p.parameters,docs:{...(D=p.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: ModalStory,
  args: {
    title: "Large Modal",
    size: "lg",
    open: false
  }
}`,...(B=(I=p.parameters)==null?void 0:I.docs)==null?void 0:B.source}}};var A,E,z;f.parameters={...f.parameters,docs:{...(A=f.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: ModalStory,
  args: {
    open: false
  }
}`,...(z=(E=f.parameters)==null?void 0:E.docs)==null?void 0:z.source}}};var N,q,L;g.parameters={...g.parameters,docs:{...(N=g.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <>
        <Button variant="danger" onClick={() => setIsOpen(true)}>Delete Item</Button>
        <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Confirm Deletion" size="sm" footerActions={<>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => setIsOpen(false)}>Delete</Button>
            </>}>
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>
        </Modal>
      </>;
  }
}`,...(L=(q=g.parameters)==null?void 0:q.docs)==null?void 0:L.source}}};const te=["Default","Small","Large","WithoutTitle","ConfirmationDialog"];export{g as ConfirmationDialog,m as Default,p as Large,u as Small,f as WithoutTitle,te as __namedExportsOrder,ne as default};
