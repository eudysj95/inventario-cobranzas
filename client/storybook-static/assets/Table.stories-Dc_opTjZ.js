import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{r as J}from"./index-UiW3gZKV.js";import{B as b}from"./Badge-BSvqjDBA.js";import"./_commonjsHelpers-CqkleIqs.js";const p=J.forwardRef(({columns:a,data:u,keyField:M,emptyMessage:W="No data available",striped:R=!1,hoverable:V=!1,caption:h,className:_="",children:P,...H},$)=>e.jsx("div",{ref:$,className:`table-wrap ${_}`,...H,children:e.jsxs("table",{className:"table",role:"table",children:[h&&e.jsx("caption",{className:"sr-only",children:h}),e.jsx("thead",{children:e.jsx("tr",{children:a.map(r=>e.jsx("th",{scope:"col",className:r.headerClassName,children:r.header},r.key))})}),e.jsx("tbody",{children:u.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:a.length,className:"text-center py-8 text-text-secondary",children:W})}):u.map((r,y)=>e.jsx("tr",{className:`${R&&y%2===1?"bg-surface-hover":""} ${V?"hover:bg-surface-hover":""}`,children:a.map(s=>e.jsx("td",{className:s.className,children:s.render?s.render(r[s.key],r,y):r[s.key]},s.key))},r[M]))})]})}));p.displayName="Table";p.__docgenInfo={description:`Table - A data table component wrapping the .table utility classes

Supports custom cell renderers, striped rows, hover effects, and empty states.
Uses the .table-wrap for horizontal scrolling on mobile.

@example
\`\`\`tsx
<Table
  columns={[
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role", render: (v) => <Badge>{v}</Badge> },
  ]}
  data={users}
  keyField="id"
  striped
  hoverable
  caption="User Directory"
/>
\`\`\`

@component
@category Primitives`,methods:[],displayName:"Table",props:{columns:{required:!0,tsType:{name:"Array",elements:[{name:"TableColumn",elements:[{name:"T"}],raw:"TableColumn<T>"}],raw:"TableColumn<T>[]"},description:""},data:{required:!0,tsType:{name:"Array",elements:[{name:"T"}],raw:"T[]"},description:""},keyField:{required:!0,tsType:{name:"string"},description:""},emptyMessage:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"No data available"',computed:!1}},striped:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},hoverable:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},caption:{required:!1,tsType:{name:"string"},description:""},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["HTMLAttributes"]};const G={title:"Primitives/Table",component:p,parameters:{layout:"centered",docs:{description:{component:"A data table component wrapping the .table utility classes. Supports custom cell renderers, striped rows, hover effects, and empty states."}}},tags:["autodocs"],argTypes:{striped:{control:"boolean"},hoverable:{control:"boolean"},emptyMessage:{control:"text"},caption:{control:"text"}}},t=[{key:"name",header:"Name"},{key:"email",header:"Email"},{key:"role",header:"Role",render:a=>e.jsx(b,{variant:a==="Admin"?"primary":"neutral",children:a})},{key:"status",header:"Status",render:a=>e.jsx(b,{variant:a==="Active"?"success":"warning",children:a})}],n=[{id:1,name:"John Doe",email:"john@example.com",role:"Admin",status:"Active"},{id:2,name:"Jane Smith",email:"jane@example.com",role:"User",status:"Active"},{id:3,name:"Bob Wilson",email:"bob@example.com",role:"User",status:"Inactive"},{id:4,name:"Alice Brown",email:"alice@example.com",role:"Editor",status:"Active"}],o={args:{columns:t,data:n,keyField:"id"}},i={args:{columns:t,data:n,keyField:"id",striped:!0}},l={args:{columns:t,data:n,keyField:"id",hoverable:!0}},d={args:{columns:t,data:n,keyField:"id",caption:"User Directory - 4 users",striped:!0,hoverable:!0}},c={args:{columns:t,data:[],keyField:"id",emptyMessage:"No users found. Click 'Add User' to get started."}},m={args:{columns:[{key:"name",header:"Name"},{key:"email",header:"Email"},{key:"actions",header:"Actions",render:()=>e.jsxs("div",{className:"flex gap-1",children:[e.jsx("button",{className:"btn btn-ghost btn-sm",children:"Edit"}),e.jsx("button",{className:"btn btn-ghost btn-sm text-danger",children:"Delete"})]})}],data:n,keyField:"id",striped:!0,hoverable:!0}};var g,f,v;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    columns,
    data,
    keyField: "id"
  }
}`,...(v=(f=o.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var x,k,N;i.parameters={...i.parameters,docs:{...(x=i.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    columns,
    data,
    keyField: "id",
    striped: true
  }
}`,...(N=(k=i.parameters)==null?void 0:k.docs)==null?void 0:N.source}}};var T,j,A;l.parameters={...l.parameters,docs:{...(T=l.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    columns,
    data,
    keyField: "id",
    hoverable: true
  }
}`,...(A=(j=l.parameters)==null?void 0:j.docs)==null?void 0:A.source}}};var F,S,E;d.parameters={...d.parameters,docs:{...(F=d.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    columns,
    data,
    keyField: "id",
    caption: "User Directory - 4 users",
    striped: true,
    hoverable: true
  }
}`,...(E=(S=d.parameters)==null?void 0:S.docs)==null?void 0:E.source}}};var q,w,C;c.parameters={...c.parameters,docs:{...(q=c.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    columns,
    data: [],
    keyField: "id",
    emptyMessage: "No users found. Click 'Add User' to get started."
  }
}`,...(C=(w=c.parameters)==null?void 0:w.docs)==null?void 0:C.source}}};var D,U,B;m.parameters={...m.parameters,docs:{...(D=m.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    columns: [{
      key: "name",
      header: "Name"
    }, {
      key: "email",
      header: "Email"
    }, {
      key: "actions",
      header: "Actions",
      render: () => <div className="flex gap-1">
          <button className="btn btn-ghost btn-sm">Edit</button>
          <button className="btn btn-ghost btn-sm text-danger">Delete</button>
        </div>
    }],
    data,
    keyField: "id",
    striped: true,
    hoverable: true
  }
}`,...(B=(U=m.parameters)==null?void 0:U.docs)==null?void 0:B.source}}};const K=["Default","Striped","Hoverable","WithCaption","Empty","WithActions"];export{o as Default,c as Empty,l as Hoverable,i as Striped,m as WithActions,d as WithCaption,K as __namedExportsOrder,G as default};
