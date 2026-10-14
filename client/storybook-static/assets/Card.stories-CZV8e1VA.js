import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{C as a,a as N,b as o,c as v}from"./Card-zE6i1ZWH.js";import{B as d}from"./Button-COGFzxFC.js";import"./index-UiW3gZKV.js";import"./_commonjsHelpers-CqkleIqs.js";const S={title:"Primitives/Card",component:a,parameters:{layout:"centered",docs:{description:{component:"A container component with header, body, and footer sections. Wraps the .card utility classes."}}},tags:["autodocs"],argTypes:{className:{control:"text"}}},r={render:()=>e.jsxs(a,{className:"w-80",children:[e.jsx(N,{children:e.jsx("h3",{className:"text-lg font-semibold",children:"Card Title"})}),e.jsx(o,{children:e.jsx("p",{className:"text-text-secondary",children:"This is the card body content. You can put any content here."})}),e.jsxs(v,{children:[e.jsx(d,{variant:"ghost",size:"sm",children:"Cancel"}),e.jsx(d,{size:"sm",children:"Save"})]})]})},s={render:()=>e.jsx(a,{className:"w-80",children:e.jsx(o,{children:e.jsx("p",{children:"Simple card without header or footer."})})})},t={render:()=>e.jsxs(a,{className:"w-80",children:[e.jsx("div",{className:"aspect-video bg-primary-light relative overflow-hidden rounded-t-lg",children:e.jsx("div",{className:"absolute inset-0 flex items-center justify-center text-primary",children:"Image Placeholder"})}),e.jsxs(o,{children:[e.jsx("h4",{className:"font-semibold",children:"Card with Image"}),e.jsx("p",{className:"text-text-secondary mt-1",children:"This card has an image at the top."})]})]})},n={render:()=>e.jsxs(a,{className:"w-80 hover:shadow-md transition-shadow cursor-pointer",children:[e.jsx(N,{children:e.jsx("h3",{className:"text-lg font-semibold",children:"Interactive Card"})}),e.jsx(o,{children:e.jsx("p",{className:"text-text-secondary",children:"Click this card to trigger an action."})})]})};var c,i,l;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <Card className="w-80">
      <CardHeader>
        <h3 className="text-lg font-semibold">Card Title</h3>
      </CardHeader>
      <CardBody>
        <p className="text-text-secondary">This is the card body content. You can put any content here.</p>
      </CardBody>
      <CardFooter>
        <Button variant="ghost" size="sm">Cancel</Button>
        <Button size="sm">Save</Button>
      </CardFooter>
    </Card>
}`,...(l=(i=r.parameters)==null?void 0:i.docs)==null?void 0:l.source}}};var m,h,p;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <Card className="w-80">
      <CardBody>
        <p>Simple card without header or footer.</p>
      </CardBody>
    </Card>
}`,...(p=(h=s.parameters)==null?void 0:h.docs)==null?void 0:p.source}}};var x,u,C;t.parameters={...t.parameters,docs:{...(x=t.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <Card className="w-80">
      <div className="aspect-video bg-primary-light relative overflow-hidden rounded-t-lg">
        <div className="absolute inset-0 flex items-center justify-center text-primary">
          Image Placeholder
        </div>
      </div>
      <CardBody>
        <h4 className="font-semibold">Card with Image</h4>
        <p className="text-text-secondary mt-1">This card has an image at the top.</p>
      </CardBody>
    </Card>
}`,...(C=(u=t.parameters)==null?void 0:u.docs)==null?void 0:C.source}}};var g,y,j;n.parameters={...n.parameters,docs:{...(g=n.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <Card className="w-80 hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <h3 className="text-lg font-semibold">Interactive Card</h3>
      </CardHeader>
      <CardBody>
        <p className="text-text-secondary">Click this card to trigger an action.</p>
      </CardBody>
    </Card>
}`,...(j=(y=n.parameters)==null?void 0:y.docs)==null?void 0:j.source}}};const T=["Default","Simple","WithImage","Interactive"];export{r as Default,n as Interactive,s as Simple,t as WithImage,T as __namedExportsOrder,S as default};
