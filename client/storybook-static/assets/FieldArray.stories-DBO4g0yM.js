import{j as i}from"./jsx-runtime-D_zvdyIk.js";import{r as o}from"./index-UiW3gZKV.js";import"./_commonjsHelpers-CqkleIqs.js";function g({name:l,render:v,initialValues:b=[],addButtonLabel:q="Add",minItems:I=0,maxItems:m=1/0,className:A=""}){const[t,n]=o.useState(b),N=o.useId(),h=()=>{t.length<m&&n([...t,""])},x=a=>{t.length>I&&n(t.filter((e,R)=>R!==a))},F=a=>{if(a>0){const e=[...t];[e[a-1],e[a]]=[e[a],e[a-1]],n(e)}},V=a=>{if(a<t.length-1){const e=[...t];[e[a],e[a+1]]=[e[a+1],e[a]],n(e)}};return i.jsxs("div",{className:`flex flex-col gap-2 ${A}`,"data-field-array":l,children:[t.map((a,e)=>i.jsx("div",{className:"flex items-start gap-2",children:v({index:e,remove:()=>x(e),moveUp:()=>F(e),moveDown:()=>V(e)})},`${N}-${e}`)),i.jsxs("button",{type:"button",className:"btn btn-ghost btn-sm self-start",onClick:h,disabled:t.length>=m,"aria-label":`Add ${l}`,children:["+ ",q]})]})}g.__docgenInfo={description:`FieldArray - A component for managing dynamic arrays of form fields

Provides add/remove/move functionality with configurable min/max limits.
Each field receives render props for index and manipulation functions.

@example
\`\`\`tsx
<FieldArray
  name="tags"
  initialValues={["react", "typescript"]}
  render={({ index, remove }) => (
    <div className="flex gap-2">
      <Input placeholder={\`Tag \${index + 1}\`} />
      <IconButton aria-label={\`Remove tag \${index + 1}\`} icon={<XIcon />} onClick={remove} />
    </div>
  )}
  addButtonLabel="Add Tag"
  maxItems={5}
/>
\`\`\`

@component
@category Primitives`,methods:[],displayName:"FieldArray",props:{name:{required:!0,tsType:{name:"string"},description:""},render:{required:!0,tsType:{name:"signature",type:"function",raw:"(props: FieldArrayRenderProps) => React.ReactNode",signature:{arguments:[{type:{name:"FieldArrayRenderProps"},name:"props"}],return:{name:"ReactReactNode",raw:"React.ReactNode"}}},description:""},initialValues:{required:!1,tsType:{name:"Array",elements:[{name:"string"}],raw:"string[]"},description:"",defaultValue:{value:"[]",computed:!1}},addButtonLabel:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Add"',computed:!1}},minItems:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},maxItems:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"Infinity",computed:!0}},className:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}}}};const _={title:"Primitives/FieldArray",component:g,parameters:{layout:"centered"},tags:["autodocs"]},r={args:{name:"items",fields:[{name:"name",label:"Name",type:"text",required:!0},{name:"quantity",label:"Quantity",type:"number",required:!0}],initialValues:[{name:"Item 1",quantity:1},{name:"Item 2",quantity:2}]}},s={args:{name:"items",fields:[{name:"name",label:"Name",type:"text",required:!0}],initialValues:[]}};var d,u,c;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    name: 'items',
    fields: [{
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true
    }, {
      name: 'quantity',
      label: 'Quantity',
      type: 'number',
      required: true
    }],
    initialValues: [{
      name: 'Item 1',
      quantity: 1
    }, {
      name: 'Item 2',
      quantity: 2
    }]
  }
}`,...(c=(u=r.parameters)==null?void 0:u.docs)==null?void 0:c.source}}};var p,f,y;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    name: 'items',
    fields: [{
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true
    }],
    initialValues: []
  }
}`,...(y=(f=s.parameters)==null?void 0:f.docs)==null?void 0:y.source}}};const $=["Default","Empty"];export{r as Default,s as Empty,$ as __namedExportsOrder,_ as default};
