import{j as a}from"./jsx-runtime-D_zvdyIk.js";import{r as h}from"./index-UiW3gZKV.js";import{u as B,N as S}from"./chunk-62JRHF6Z-B3MMLX5d.js";import"./_commonjsHelpers-CqkleIqs.js";const u={"/":"Inicio","/inventory":"Inventario","/clientes":"Clientes","/apartados":"Apartados","/credit-sales":"Venta a crédito","/venta":"Venta","/cobros":"Cobranzas","/proveedores":"Proveedores","/payments":"Pagos"},_=a.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2","aria-hidden":"true",children:[a.jsx("path",{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"}),a.jsx("polyline",{points:"9 22 9 12 15 12 15 22"})]});function H({labelMap:t={},maxItems:n=5,showHomeIcon:E=!1}){const m=B(),s=h.useMemo(()=>{const e=m.pathname;if(e==="/")return[{label:t["/"]??u["/"]??"Inicio",path:"/",isCurrent:!0}];const r=e.split("/").filter(Boolean),l=[];l.push({label:t["/"]??u["/"]??"Inicio",path:"/",isCurrent:!1});let o="";return r.forEach((i,I)=>{o+=`/${i}`;const L=I===r.length-1,w=t[o]??u[o]??D(i);l.push({label:w,path:o,isCurrent:L})}),l},[m.pathname,t]),V=h.useMemo(()=>{if(s.length<=n)return s;const e=s[0],r=s[s.length-1],l=n-2,o=Math.max(1,s.length-l-1),i=s.slice(o,s.length-1);return[e,{label:"…",path:"",isCurrent:!1,isEllipsis:!0},...i,r]},[s,n]);return a.jsx("nav",{className:"breadcrumbs","data-testid":"breadcrumbs",role:"navigation","aria-label":"Ruta de navegación",children:a.jsx("ol",{className:"breadcrumbs-list",children:V.map((e,r)=>a.jsxs("li",{className:"breadcrumbs-item",children:[r>0&&!e.isEllipsis&&a.jsx("span",{className:"breadcrumbs-separator","aria-hidden":"true",children:"/"}),e.isEllipsis?a.jsx("span",{className:"breadcrumbs-ellipsis","aria-hidden":"true",children:"…"}):e.isCurrent?a.jsx("span",{className:"breadcrumbs-current","aria-current":"page",children:e.label}):a.jsxs(S,{to:e.path,className:"breadcrumbs-link","aria-current":void 0,children:[E&&r===0&&a.jsx("span",{className:"breadcrumbs-home-icon","aria-hidden":"true",children:_}),e.label]})]},`${e.path}-${r}`))})})}function D(t){return t.split("-").map(n=>n.charAt(0).toUpperCase()+n.slice(1)).join(" ")}H.__docgenInfo={description:"",methods:[],displayName:"Breadcrumbs",props:{labelMap:{required:!1,tsType:{name:"Record",elements:[{name:"string"},{name:"string"}],raw:"Record<string, string>"},description:"",defaultValue:{value:"{}",computed:!1}},maxItems:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"5",computed:!1}},showHomeIcon:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};const R={title:"Layout/Breadcrumbs",component:H,parameters:{layout:"centered"},tags:["autodocs"]},c={args:{items:[{label:"Home",path:"/"},{label:"Inventario",path:"/inventory"},{label:"Nuevo Producto",path:"/inventory/new"}]}},d={args:{items:[{label:"Home",path:"/"}]}},p={args:{items:[{label:"Home",path:"/"},{label:"Ventas",path:"/sales"},{label:"Crédito",path:"/sales/credit"},{label:"Nueva Venta",path:"/sales/credit/new"}]}};var b,f,v;c.parameters={...c.parameters,docs:{...(b=c.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    items: [{
      label: 'Home',
      path: '/'
    }, {
      label: 'Inventario',
      path: '/inventory'
    }, {
      label: 'Nuevo Producto',
      path: '/inventory/new'
    }]
  }
}`,...(v=(f=c.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var g,N,x;d.parameters={...d.parameters,docs:{...(g=d.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    items: [{
      label: 'Home',
      path: '/'
    }]
  }
}`,...(x=(N=d.parameters)==null?void 0:N.docs)==null?void 0:x.source}}};var y,j,C;p.parameters={...p.parameters,docs:{...(y=p.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    items: [{
      label: 'Home',
      path: '/'
    }, {
      label: 'Ventas',
      path: '/sales'
    }, {
      label: 'Crédito',
      path: '/sales/credit'
    }, {
      label: 'Nueva Venta',
      path: '/sales/credit/new'
    }]
  }
}`,...(C=(j=p.parameters)==null?void 0:j.docs)==null?void 0:C.source}}};const T=["Default","HomeOnly","Deep"];export{p as Deep,c as Default,d as HomeOnly,T as __namedExportsOrder,R as default};
