import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{r as n,R as K}from"./index-UiW3gZKV.js";import"./_commonjsHelpers-CqkleIqs.js";const B=n.createContext(null);function V(){const r=n.useContext(B);if(!r)throw new Error("Tabs compounds must be used within a Tabs component");return r}function v({children:r,defaultIndex:o=0,index:p,onChange:s}){const[x,f]=n.useState(o),T=p!==void 0,a=T?p:x,u=n.useRef(`tabs-${Math.random().toString(36).slice(2)}`).current,c=n.useRef([]),b=n.useRef([]),h=n.useRef(0),j=n.useRef(0),A=i=>{T||f(i),s==null||s(i)},H=i=>{const t=h.current++;return c.current[t]=i,t},M=i=>{c.current[i]=null},U=i=>{const t=j.current++;return b.current[t]=i,t},W=i=>{b.current[i]=null};return n.useEffect(()=>{const i=t=>{var w;const g=c.current.filter(Boolean),N=g[a];if(!N||t.target!==N)return;let m=a;t.key==="ArrowRight"||t.key==="ArrowDown"?m=(a+1)%g.length:t.key==="ArrowLeft"||t.key==="ArrowUp"?m=(a-1+g.length)%g.length:t.key==="Home"?m=0:t.key==="End"&&(m=g.length-1),m!==a&&(t.preventDefault(),A(m),(w=g[m])==null||w.focus())};return document.addEventListener("keydown",i),()=>document.removeEventListener("keydown",i)},[a,T,s]),e.jsx(B.Provider,{value:{activeIndex:a,setActiveIndex:A,tabsId:u,registerTab:H,unregisterTab:M,registerPanel:U,unregisterPanel:W},children:e.jsx("div",{children:r})})}const y=n.forwardRef(({children:r,className:o="",...p},s)=>e.jsx("div",{ref:s,role:"tablist",className:`flex gap-1 border-b border-border ${o}`,...p,children:r}));y.displayName="TabList";const d=n.forwardRef(({children:r,disabled:o=!1,className:p="",...s},x)=>{const{activeIndex:f,setActiveIndex:T,tabsId:a,registerTab:u,unregisterTab:c}=V(),b=n.useRef(-1),h=n.useRef(!1);n.useEffect(()=>(!h.current&&x.current&&(b.current=u(x.current),h.current=!0),()=>{h.current&&(c(b.current),h.current=!1)}),[u,c,x]);const j=b.current===f;return e.jsx("button",{ref:x,role:"tab",id:`${a}-tab-${b.current}`,"aria-selected":j,"aria-controls":`${a}-panel-${b.current}`,tabIndex:j?0:-1,disabled:o,className:`
          px-4 py-2 text-sm font-medium
          transition-colors
          ${j?"text-primary border-b-2 border-primary -mb-px":"text-text-secondary hover:text-text"}
          ${o?"opacity-50 cursor-not-allowed":""}
          ${p}
        `,onClick:()=>!o&&T(b.current),...s,children:r})});d.displayName="Tab";const l=n.forwardRef(({children:r,className:o="",...p},s)=>{const{activeIndex:x,tabsId:f,registerPanel:T,unregisterPanel:a}=V(),u=n.useRef(-1),c=n.useRef(!1);return n.useEffect(()=>(!c.current&&s.current&&(u.current=T(s.current),c.current=!0),()=>{c.current&&(a(u.current),c.current=!1)}),[T,a,s]),u.current===x?e.jsx("div",{ref:s,role:"tabpanel",id:`${f}-panel-${u.current}`,"aria-labelledby":`${f}-tab-${u.current}`,tabIndex:0,className:`py-4 ${o}`,...p,children:r}):null});l.displayName="TabPanel";v.__docgenInfo={description:"",methods:[],displayName:"Tabs",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""},defaultIndex:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},index:{required:!1,tsType:{name:"number"},description:""},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(index: number) => void",signature:{arguments:[{type:{name:"number"},name:"index"}],return:{name:"void"}}},description:""}}};y.__docgenInfo={description:"",methods:[],displayName:"TabList",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["HTMLAttributes"]};d.__docgenInfo={description:"",methods:[],displayName:"Tab",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["HTMLAttributes"]};l.__docgenInfo={description:"",methods:[],displayName:"TabPanel",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""},className:{defaultValue:{value:'""',computed:!1},required:!1}},composes:["HTMLAttributes"]};const G={title:"Primitives/Tabs",component:v,parameters:{layout:"centered",docs:{description:{component:"An accessible tab component with keyboard navigation. Uses compound components: TabList, Tab, TabPanel."}}},tags:["autodocs"]},P={render:()=>e.jsxs(v,{defaultIndex:0,children:[e.jsxs(y,{children:[e.jsx(d,{children:"Profile"}),e.jsx(d,{children:"Settings"}),e.jsx(d,{children:"Billing"})]}),e.jsxs(l,{children:[e.jsx("h3",{children:"Profile"}),e.jsx("p",{children:"Profile content goes here."})]}),e.jsxs(l,{children:[e.jsx("h3",{children:"Settings"}),e.jsx("p",{children:"Settings content goes here."})]}),e.jsxs(l,{children:[e.jsx("h3",{children:"Billing"}),e.jsx("p",{children:"Billing content goes here."})]})]})},I={render:()=>e.jsxs(v,{defaultIndex:0,children:[e.jsxs(y,{children:[e.jsx(d,{children:"Active Tab"}),e.jsx(d,{disabled:!0,children:"Disabled Tab"}),e.jsx(d,{children:"Another Tab"})]}),e.jsx(l,{children:e.jsx("p",{children:"Active tab content"})}),e.jsx(l,{children:e.jsx("p",{children:"Disabled tab content"})}),e.jsx(l,{children:e.jsx("p",{children:"Another tab content"})})]})},R={render:()=>{const[r,o]=K.useState(0);return e.jsxs("div",{children:[e.jsxs("div",{className:"mb-2 text-sm text-text-secondary",children:["Current index: ",r]}),e.jsxs(v,{index:r,onChange:o,children:[e.jsxs(y,{children:[e.jsx(d,{children:"Tab 1"}),e.jsx(d,{children:"Tab 2"}),e.jsx(d,{children:"Tab 3"})]}),e.jsx(l,{children:e.jsx("p",{children:"Content 1"})}),e.jsx(l,{children:e.jsx("p",{children:"Content 2"})}),e.jsx(l,{children:e.jsx("p",{children:"Content 3"})})]})]})}};var L,C,$;P.parameters={...P.parameters,docs:{...(L=P.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: () => <Tabs defaultIndex={0}>
      <TabList>
        <Tab>Profile</Tab>
        <Tab>Settings</Tab>
        <Tab>Billing</Tab>
      </TabList>
      <TabPanel>
        <h3>Profile</h3>
        <p>Profile content goes here.</p>
      </TabPanel>
      <TabPanel>
        <h3>Settings</h3>
        <p>Settings content goes here.</p>
      </TabPanel>
      <TabPanel>
        <h3>Billing</h3>
        <p>Billing content goes here.</p>
      </TabPanel>
    </Tabs>
}`,...($=(C=P.parameters)==null?void 0:C.docs)==null?void 0:$.source}}};var S,E,q;I.parameters={...I.parameters,docs:{...(S=I.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <Tabs defaultIndex={0}>
      <TabList>
        <Tab>Active Tab</Tab>
        <Tab disabled>Disabled Tab</Tab>
        <Tab>Another Tab</Tab>
      </TabList>
      <TabPanel>
        <p>Active tab content</p>
      </TabPanel>
      <TabPanel>
        <p>Disabled tab content</p>
      </TabPanel>
      <TabPanel>
        <p>Another tab content</p>
      </TabPanel>
    </Tabs>
}`,...(q=(E=I.parameters)==null?void 0:E.docs)==null?void 0:q.source}}};var D,k,_;R.parameters={...R.parameters,docs:{...(D=R.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => {
    const [index, setIndex] = React.useState(0);
    return <div>
        <div className="mb-2 text-sm text-text-secondary">
          Current index: {index}
        </div>
        <Tabs index={index} onChange={setIndex}>
          <TabList>
            <Tab>Tab 1</Tab>
            <Tab>Tab 2</Tab>
            <Tab>Tab 3</Tab>
          </TabList>
          <TabPanel><p>Content 1</p></TabPanel>
          <TabPanel><p>Content 2</p></TabPanel>
          <TabPanel><p>Content 3</p></TabPanel>
        </Tabs>
      </div>;
  }
}`,...(_=(k=R.parameters)==null?void 0:k.docs)==null?void 0:_.source}}};const J=["Default","WithDisabledTab","Controlled"];export{R as Controlled,P as Default,I as WithDisabledTab,J as __namedExportsOrder,G as default};
