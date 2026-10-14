import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{r as x,R as s}from"./index-UiW3gZKV.js";import"./_commonjsHelpers-CqkleIqs.js";const V=x.createContext(null);function R(){const t=x.useContext(V);if(!t)throw new Error("Accordion compounds must be used within an Accordion component");return t}function E({children:t,type:l="single",defaultValue:r=[],value:o,onChange:a,className:h=""}){const[c,p]=x.useState(Array.isArray(r)?r:[r].filter(Boolean)),u=o!==void 0,A=u?Array.isArray(o)?o:[o].filter(Boolean):c,i=d=>{u||p(d),a==null||a(l==="single"?d[0]:d)},m=new Set;return e.jsx(V.Provider,{value:{openValues:A,setOpenValues:i,type:l,disabledValues:m},children:e.jsx("div",{className:h,children:t})})}const M=x.forwardRef(({value:t,disabled:l=!1,children:r,className:o="",...a},h)=>{const{openValues:c,setOpenValues:p,type:u,disabledValues:A}=R(),i=c.includes(t),m=l||A.has(t),d=()=>{m||p(u==="single"?i?[]:[t]:i?c.filter(n=>n!==t):[...c,t])};return e.jsxs("div",{ref:h,className:`border border-border rounded-lg overflow-hidden ${o}`,...a,children:[e.jsxs("button",{type:"button",className:"w-full px-4 py-3 text-left font-medium flex items-center justify-between gap-2",onClick:d,disabled:m,"aria-expanded":i,"aria-controls":`${t}-content`,id:`${t}-trigger`,children:[s.Children.map(r,n=>s.isValidElement(n)&&n.type===C?s.cloneElement(n,{children:n.props.children}):n),e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",className:`flex-shrink-0 transition-transform duration-200 ${i?"rotate-180":""}`,"aria-hidden":"true",children:e.jsx("path",{d:"M6 9l6 6 6-6"})})]}),e.jsx("div",{id:`${t}-content`,role:"region","aria-labelledby":`${t}-trigger`,className:`overflow-hidden transition-all duration-200 ${i?"max-h-96 opacity-100 pb-4":"max-h-0 opacity-0 pb-0"}`,hidden:!i,children:e.jsx("div",{className:"px-4",children:s.Children.map(r,n=>s.isValidElement(n)&&n.type===S?s.cloneElement(n,{children:n.props.children}):null)})})]})});M.displayName="AccordionItem";const C=({children:t})=>e.jsx(e.Fragment,{children:t});C.displayName="AccordionTrigger";const S=({children:t})=>e.jsx(e.Fragment,{children:t});S.displayName="AccordionContent";E.__docgenInfo={description:"",methods:[],displayName:"Accordion",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""},type:{required:!1,tsType:{name:"union",raw:'"single" | "multiple"',elements:[{name:"literal",value:'"single"'},{name:"literal",value:'"multiple"'}]},description:"",defaultValue:{value:'"single"',computed:!1}},defaultValue:{required:!1,tsType:{name:"union",raw:"string | string[]",elements:[{name:"string"},{name:"Array",elements:[{name:"string"}],raw:"string[]"}]},description:"",defaultValue:{value:"[]",computed:!1}},value:{required:!1,tsType:{name:"union",raw:"string | string[]",elements:[{name:"string"},{name:"Array",elements:[{name:"string"}],raw:"string[]"}]},description:""},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: string | string[]) => void",signature:{arguments:[{type:{name:"union",raw:"string | string[]",elements:[{name:"string"},{name:"Array",elements:[{name:"string"}],raw:"string[]"}]},name:"value"}],return:{name:"void"}}},description:""},className:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}}}};M.__docgenInfo={description:"",methods:[],displayName:"AccordionItem",props:{value:{required:!0,tsType:{name:"string"},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},children:{required:!0,tsType:{name:"ReactNode"},description:""},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["HTMLAttributes"]};C.__docgenInfo={description:"",methods:[],displayName:"AccordionTrigger",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""}},composes:["HTMLAttributes"]};S.__docgenInfo={description:"",methods:[],displayName:"AccordionContent",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""}},composes:["HTMLAttributes"]};const B={title:"Primitives/Accordion",component:E,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{type:{control:{type:"select"},options:["single","multiple"]}}},f={args:{items:[{id:"1",title:"Section 1",content:e.jsx("p",{children:"Content for section 1"})},{id:"2",title:"Section 2",content:e.jsx("p",{children:"Content for section 2"})},{id:"3",title:"Section 3",content:e.jsx("p",{children:"Content for section 3"})}]}},g={args:{type:"multiple",items:[{id:"1",title:"Section 1",content:e.jsx("p",{children:"Content for section 1"})},{id:"2",title:"Section 2",content:e.jsx("p",{children:"Content for section 2"})},{id:"3",title:"Section 3",content:e.jsx("p",{children:"Content for section 3"})}]}},y={args:{items:[{id:"1",title:"Account Settings",content:e.jsx("p",{children:"Manage your account settings"})},{id:"2",title:"Notifications",content:e.jsx("p",{children:"Configure notification preferences"})},{id:"3",title:"Security",content:e.jsx("p",{children:"Security and privacy settings"})}]}};var j,b,v;f.parameters={...f.parameters,docs:{...(j=f.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    items: [{
      id: '1',
      title: 'Section 1',
      content: <p>Content for section 1</p>
    }, {
      id: '2',
      title: 'Section 2',
      content: <p>Content for section 2</p>
    }, {
      id: '3',
      title: 'Section 3',
      content: <p>Content for section 3</p>
    }]
  }
}`,...(v=(b=f.parameters)==null?void 0:b.docs)==null?void 0:v.source}}};var N,T,w;g.parameters={...g.parameters,docs:{...(N=g.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    type: 'multiple',
    items: [{
      id: '1',
      title: 'Section 1',
      content: <p>Content for section 1</p>
    }, {
      id: '2',
      title: 'Section 2',
      content: <p>Content for section 2</p>
    }, {
      id: '3',
      title: 'Section 3',
      content: <p>Content for section 3</p>
    }]
  }
}`,...(w=(T=g.parameters)==null?void 0:T.docs)==null?void 0:w.source}}};var q,_,I;y.parameters={...y.parameters,docs:{...(q=y.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    items: [{
      id: '1',
      title: 'Account Settings',
      content: <p>Manage your account settings</p>
    }, {
      id: '2',
      title: 'Notifications',
      content: <p>Configure notification preferences</p>
    }, {
      id: '3',
      title: 'Security',
      content: <p>Security and privacy settings</p>
    }]
  }
}`,...(I=(_=y.parameters)==null?void 0:_.docs)==null?void 0:I.source}}};const D=["Default","Multiple","WithIcons"];export{f as Default,g as Multiple,y as WithIcons,D as __namedExportsOrder,B as default};
