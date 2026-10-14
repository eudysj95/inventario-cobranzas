import{j as d}from"./jsx-runtime-D_zvdyIk.js";import{r as o}from"./index-UiW3gZKV.js";const s=o.forwardRef(({children:e,className:a="",...r},t)=>d.jsx("div",{ref:t,className:`card ${a}`,...r,children:e}));s.displayName="Card";const n=o.forwardRef(({children:e,className:a="",...r},t)=>d.jsx("div",{ref:t,className:`card-header ${a}`,...r,children:e}));n.displayName="CardHeader";const c=o.forwardRef(({children:e,className:a="",...r},t)=>d.jsx("div",{ref:t,className:`card-body ${a}`,...r,children:e}));c.displayName="CardBody";const i=o.forwardRef(({children:e,className:a="",...r},t)=>d.jsx("div",{ref:t,className:`card-footer ${a}`,...r,children:e}));i.displayName="CardFooter";s.__docgenInfo={description:`Card - A container component with header, body, and footer sections

Wraps the .card utility classes. Use with CardHeader, CardBody, and CardFooter
for consistent layout.

@example
\`\`\`tsx
<Card>
  <CardHeader>
    <h3>Product Details</h3>
  </CardHeader>
  <CardBody>
    <p>Product description here</p>
  </CardBody>
  <CardFooter>
    <Button>Edit</Button>
    <Button variant="danger">Delete</Button>
  </CardFooter>
</Card>
\`\`\`

@component
@category Primitives`,methods:[],displayName:"Card",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},"data-testid":{required:!1,tsType:{name:"string"},description:""},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["HTMLAttributes"]};n.__docgenInfo={description:`CardHeader - Header section of a Card
@component
@category Primitives`,methods:[],displayName:"CardHeader",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["HTMLAttributes"]};c.__docgenInfo={description:`CardBody - Main content section of a Card
@component
@category Primitives`,methods:[],displayName:"CardBody",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["HTMLAttributes"]};i.__docgenInfo={description:`CardFooter - Footer section of a Card
@component
@category Primitives`,methods:[],displayName:"CardFooter",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["HTMLAttributes"]};export{s as C,n as a,c as b,i as c};
