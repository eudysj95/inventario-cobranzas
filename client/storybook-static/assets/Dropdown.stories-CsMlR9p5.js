import{j as o}from"./jsx-runtime-D_zvdyIk.js";import{r as s,R as O}from"./index-UiW3gZKV.js";import{r as q}from"./index-3b7XovMV.js";import"./_commonjsHelpers-CqkleIqs.js";import"./index-BA8NevWa.js";function C({trigger:u,items:j,onSelect:c,position:R="bottom"}){var f;const[r,g]=s.useState(!1),p=s.useRef(null),l=s.useRef(null),T=()=>g(e=>!e),m=()=>g(!1);s.useEffect(()=>{const e=t=>{p.current&&!p.current.contains(t.target)&&m()};return r&&document.addEventListener("mousedown",e),()=>document.removeEventListener("mousedown",e)},[r]),s.useEffect(()=>{const e=t=>{var a;r&&t.key==="Escape"&&(m(),(a=l.current)==null||a.focus())};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[r]);const N=O.cloneElement(u,{ref:l,onClick:e=>{var t,a;e.stopPropagation(),T(),(a=(t=u.props).onClick)==null||a.call(t,e)},"aria-haspopup":"menu","aria-expanded":r}),b=r?o.jsx("div",{ref:p,role:"menu",className:`popover absolute ${R==="top"?"bottom-full mb-2":"top-full mt-2"} left-0 min-w-[160px] z-[var(--z-dropdown)]`,style:{minWidth:(f=l.current)!=null&&f.offsetWidth?`${l.current.offsetWidth}px`:"160px"},children:o.jsx("div",{className:"bg-surface border border-border rounded-lg shadow-lg py-1",children:j.map((e,t)=>e.type==="divider"?o.jsx("hr",{className:"border-border my-1",role:"separator"},`divider-${t}`):o.jsxs("button",{role:"menuitem",tabIndex:-1,className:`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${e.disabled?"opacity-50 cursor-not-allowed":"hover:bg-surface-hover"}`,onClick:()=>{e.disabled||(c==null||c(e),m())},disabled:e.disabled,"aria-disabled":e.disabled,children:[e.icon&&o.jsx("span",{className:"w-4 h-4 flex-shrink-0",children:e.icon}),e.label]},e.value))})}):null;return o.jsxs("div",{className:"relative inline-block",children:[N,b&&q.createPortal(b,document.body)]})}C.__docgenInfo={description:`Dropdown - An accessible dropdown menu component

Wraps a trigger element and shows a menu on click. Supports keyboard navigation,
dividers, disabled items, and outside-click dismissal.

@example
\`\`\`tsx
<Dropdown
  trigger={<Button variant="ghost">Actions</Button>}
  items={[
    { label: "Edit", value: "edit", icon: <EditIcon /> },
    { label: "Duplicate", value: "duplicate" },
    { type: "divider" },
    { label: "Delete", value: "delete", disabled: true },
  ]}
  onSelect={handleSelect}
/>
\`\`\`

@component
@category Primitives`,methods:[],displayName:"Dropdown",props:{trigger:{required:!0,tsType:{name:"ReactElement"},description:""},items:{required:!0,tsType:{name:"Array",elements:[{name:"DropdownItem"}],raw:"DropdownItem[]"},description:""},onSelect:{required:!1,tsType:{name:"signature",type:"function",raw:"(item: DropdownItem) => void",signature:{arguments:[{type:{name:"DropdownItem"},name:"item"}],return:{name:"void"}}},description:""},position:{required:!1,tsType:{name:"union",raw:'"top" | "bottom"',elements:[{name:"literal",value:'"top"'},{name:"literal",value:'"bottom"'}]},description:"",defaultValue:{value:'"bottom"',computed:!1}}}};const _={title:"Primitives/Dropdown",component:C,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{trigger:{control:{type:"select"},options:["click","hover"]},placement:{control:{type:"select"},options:["bottom-start","bottom-end","top-start","top-end"]}}},n={args:{trigger:o.jsx("button",{type:"button",children:"Open Dropdown"}),items:[{label:"Item 1",onClick:()=>console.log("Item 1")},{label:"Item 2",onClick:()=>console.log("Item 2")},{type:"separator"},{label:"Item 3",onClick:()=>console.log("Item 3"),danger:!0}]}},i={args:{...n.args,trigger:"hover"}},d={args:{...n.args,placement:"bottom-end"}};var v,y,w;n.parameters={...n.parameters,docs:{...(v=n.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    trigger: <button type="button">Open Dropdown</button>,
    items: [{
      label: 'Item 1',
      onClick: () => console.log('Item 1')
    }, {
      label: 'Item 2',
      onClick: () => console.log('Item 2')
    }, {
      type: 'separator'
    }, {
      label: 'Item 3',
      onClick: () => console.log('Item 3'),
      danger: true
    }]
  }
}`,...(w=(y=n.parameters)==null?void 0:y.docs)==null?void 0:w.source}}};var h,x,I;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    trigger: 'hover'
  }
}`,...(I=(x=i.parameters)==null?void 0:x.docs)==null?void 0:I.source}}};var k,D,E;d.parameters={...d.parameters,docs:{...(k=d.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    placement: 'bottom-end'
  }
}`,...(E=(D=d.parameters)==null?void 0:D.docs)==null?void 0:E.source}}};const $=["Default","HoverTrigger","BottomEnd"];export{d as BottomEnd,n as Default,i as HoverTrigger,$ as __namedExportsOrder,_ as default};
