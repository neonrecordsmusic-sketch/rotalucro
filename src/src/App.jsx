import { useState, useEffect, useReducer, useMemo, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { LayoutDashboard, Plus, Settings, Car, TrendingUp, Fuel, Utensils, Wrench, Droplets, MoreHorizontal, ChevronRight, ArrowUpRight, ArrowDownRight, Check, Trash2, Save, Download, Smartphone, MapPin, Zap, Timer, CreditCard, Banknote, QrCode, FileText, Play, Pause, Square, RotateCcw, Sun, Moon, PlusCircle, X, Calendar, Tag, DollarSign } from "lucide-react";

// DATA
const CATS=[{id:"c1",name:"Combustível",type:"OUT",icon:"fuel",sys:1},{id:"c2",name:"Alimentação",type:"OUT",icon:"food",sys:1},{id:"c3",name:"Manutenção",type:"OUT",icon:"wrench",sys:1},{id:"c4",name:"Lavagem",type:"OUT",icon:"wash",sys:1},{id:"c5",name:"Outros",type:"OUT",icon:"other",sys:1},{id:"c6",name:"Uber",type:"IN",icon:"uber",sys:1},{id:"c7",name:"99",type:"IN",icon:"99",sys:1},{id:"c8",name:"Indriver",type:"IN",icon:"indriver",sys:1},{id:"c9",name:"Particular",type:"IN",icon:"particular",sys:1}];
const PMS=[{id:"p1",name:"Pix"},{id:"p2",name:"Dinheiro"},{id:"p3",name:"Cartão"}];
const DSET={dailyGoal:300,monthlyGoal:6000,yearlyGoal:58370,dailyHoursGoal:10,monthlyHoursGoal:220,vehicle:{make:"",model:"",year:"",fuelType:"gasolina",consumptionKmL:10,maintenanceCostKm:.15},fuelPrice:5.89,theme:"dark"};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).substr(2,5);
const R$=v=>"R$ "+(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
const fD=d=>new Date(d+"T12:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"});
const fDF=d=>new Date(d+"T12:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"});
const td=()=>new Date().toISOString().split("T")[0];
const fT=ms=>{const t=Math.floor(ms/1e3),h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;};
const fH=ms=>(ms/36e5).toFixed(1);

function pStart(p){const d=new Date();if(p==="day")return td();if(p==="week"){d.setDate(d.getDate()-d.getDay());return d.toISOString().split("T")[0];}if(p==="month")return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`;return`${d.getFullYear()}-01-01`;}
function filt(t,p,a,b){if(p==="custom"&&a&&b)return t.filter(x=>x.date>=a&&x.date<=b);return t.filter(x=>x.date>=pStart(p));}

function reducer(s,a){
  switch(a.type){
    case"AT":return{...s,transactions:[a.d,...s.transactions]};
    case"DT":return{...s,transactions:s.transactions.filter(t=>t.id!==a.d)};
    case"SS":return{...s,settings:{...s.settings,...a.d}};
    case"SV":return{...s,settings:{...s.settings,vehicle:{...s.settings.vehicle,...a.d}}};
    case"AC":return{...s,categories:[...s.categories,a.d]};
    case"DC":return{...s,categories:s.categories.filter(c=>c.id!==a.d)};
    case"LD":return{...s,...a.d};
    case"SM":return{...s,transactions:[...a.d,...s.transactions]};
    default:return s;
  }
}

function mkDemo(){
  const ap=["c6","c7","c8","c9"],ex=["c1","c2","c3","c4","c5"],pm=["p1","p2","p3"],t=[];
  for(let i=0;i<50;i++){const d=new Date();d.setDate(d.getDate()-Math.floor(Math.random()*90));const ds=d.toISOString().split("T")[0];
  for(let r=0;r<2+Math.floor(Math.random()*3);r++){const g=12+Math.random()*50,tp=Math.random()>.7?Math.floor(Math.random()*12):0,ks=1e3+Math.floor(Math.random()*5e4),ke=ks+5+Math.floor(Math.random()*35);
  t.push({id:uid()+i+r,type:"IN",categoryId:ap[0|Math.random()*4],paymentMethodId:"",value:+(g+tp).toFixed(2),grossValue:+g.toFixed(2),tips:tp,kmStart:ks,kmEnd:ke,appSource:["UBER","99","INDRIVER","PARTICULAR"][0|Math.random()*4],date:ds,timestamp:d.toISOString(),hoursWorked:+(.3+Math.random()*1.5).toFixed(1)});}
  if(Math.random()>.3){const ec=ex[0|Math.random()*5];let v=15+Math.random()*80;if(ec==="c1")v=80+Math.random()*200;
  t.push({id:uid()+"e"+i,type:"OUT",categoryId:ec,paymentMethodId:pm[0|Math.random()*3],value:+v.toFixed(2),grossValue:0,tips:0,kmStart:0,kmEnd:0,appSource:"",date:ds,timestamp:d.toISOString(),hoursWorked:0});}}
  return t.sort((a,b)=>b.timestamp.localeCompare(a.timestamp));
}

const IC=({icon,size=16})=>{const m={fuel:Fuel,food:Utensils,wrench:Wrench,wash:Droplets,other:MoreHorizontal,uber:Car,"99":Smartphone,indriver:MapPin,particular:Zap,custom:Tag};const I=m[icon]||Tag;return<I size={size}/>;};

// STYLES
const Sty=({th})=><style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
:root{--bg:${th==="dark"?"#121212":"#f4f4f5"};--bg3:${th==="dark"?"#222":"#fff"};--bd:${th==="dark"?"#333":"#d4d4d8"};--t1:${th==="dark"?"#fff":"#09090b"};--t2:${th==="dark"?"#ccc":"#3f3f46"};--t3:${th==="dark"?"#888":"#a1a1aa"};--sh:${th==="dark"?"none":"0 1px 3px rgba(0,0,0,.06)"};--or:#e8531e;--or2:#ff6b35;--gr:#22c55e;--gr2:#16a34a;--grb:rgba(34,197,94,.15);--rd:#ef4444;--rd2:#dc2626;--rdb:rgba(239,68,68,.15);--yl:#eab308;--f:'Outfit',sans-serif;--m:'JetBrains Mono',monospace;--r:12px;--rs:8px}*{margin:0;padding:0;box-sizing:border-box}body{background:var(--bg);color:var(--t1);font-family:var(--f);-webkit-font-smoothing:antialiased}.app{max-width:430px;margin:0 auto;min-height:100vh;background:var(--bg);padding-bottom:76px;position:relative}.hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 6px}.logo{font-weight:900;font-size:28px;letter-spacing:2px;color:var(--or);text-transform:uppercase}.logo span{color:var(--or2)}.tabs{display:flex;margin:6px 12px;background:var(--bg3);border-radius:8px;overflow:hidden;border:1px solid var(--bd);box-shadow:var(--sh)}.tab{flex:1;padding:8px 0;border:none;background:0;color:var(--t3);font-family:var(--f);font-size:11px;font-weight:600;cursor:pointer;transition:.2s}.tab.on{background:var(--or);color:#fff}.cr{display:flex;gap:6px;padding:0 12px;margin:6px 0 8px;align-items:center}.cr input{flex:1;padding:7px;background:var(--bg3);border:1px solid var(--bd);border-radius:var(--rs);color:var(--t1);font-size:12px;outline:0}.cr input:focus{border-color:var(--or)}.cr span{font-size:11px;color:var(--t3)}.tc{padding:0 12px;display:flex;flex-direction:column;gap:8px;margin-bottom:10px}.rw{display:flex;gap:8px}.sc{flex:1;border-radius:var(--r);padding:10px 12px}.sc.f{background:linear-gradient(135deg,#166534,#15803d)}.sc.d{background:linear-gradient(135deg,#991b1b,#dc2626)}.sc.s{background:linear-gradient(135deg,#581c87,#7c3aed)}.sl{font-size:11px;color:rgba(255,255,255,.75);margin-bottom:3px}.sv{font-family:var(--m);font-size:18px;font-weight:700;color:#fff}.ms{margin:0 12px 10px;background:var(--bg3);border:1px solid var(--bd);border-radius:var(--r);padding:12px;box-shadow:var(--sh)}.mr{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}.ml{font-size:12px;color:var(--t3)}.mv{font-family:var(--m);font-size:14px;font-weight:600;color:var(--yl)}.pr{display:flex;align-items:center;gap:10px;margin-top:8px}.pp{font-family:var(--m);font-weight:800;font-size:22px}.pt{flex:1;height:10px;background:var(--bg);border-radius:8px;overflow:hidden}.pf{height:100%;border-radius:8px;transition:width .8s}.mg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:0 12px;margin-bottom:8px}.mc{background:var(--bg3);border:1px solid var(--bd);border-radius:var(--rs);padding:8px;text-align:center;box-shadow:var(--sh)}.mcl{font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}.mcv{font-family:var(--m);font-size:14px;font-weight:700}.mcv2{font-family:var(--m);font-size:13px;font-weight:600;color:var(--or)}.stl{font-size:13px;font-weight:700;color:var(--t2);padding:0 16px;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px}.cc{margin:0 12px 12px;background:var(--bg3);border:1px solid var(--bd);border-radius:var(--r);padding:14px;box-shadow:var(--sh)}.cct{font-size:12px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px}
.bn{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:${th==="dark"?"rgba(26,26,26,.95)":"rgba(244,244,245,.95)"};backdrop-filter:blur(16px);border-top:1px solid var(--bd);display:flex;z-index:100;padding:0 0 env(safe-area-inset-bottom,4px)}.bi{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 0 6px;border:none;background:0;color:var(--t3);font-family:var(--f);font-size:10px;cursor:pointer}.bi.on{color:var(--or)}.ba{flex:1;display:flex;align-items:center;justify-content:center;border:none;background:0;cursor:pointer}.bac{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--or),var(--or2));display:flex;align-items:center;justify-content:center;margin-top:-18px;box-shadow:0 4px 16px rgba(232,83,30,.45)}
.tl{padding:0 12px}.dy{font-size:11px;color:var(--t3);font-weight:600;padding:8px 4px 4px;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between}.ti{display:flex;align-items:center;gap:10px;padding:10px 4px;border-bottom:1px solid ${th==="dark"?"rgba(51,51,51,.5)":"rgba(0,0,0,.06)"}}.tic{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}.tic.i{background:var(--grb);color:var(--gr)}.tic.o{background:var(--rdb);color:var(--rd)}.tif{flex:1;min-width:0}.tin{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tim{font-size:10px;color:var(--t3);margin-top:1px;display:flex;gap:5px}.tv{font-family:var(--m);font-weight:700;font-size:14px;flex-shrink:0}.tv.i{color:var(--gr)}.tv.o{color:var(--rd)}.del{background:0;border:0;color:var(--t3);padding:6px;cursor:pointer;border-radius:8px;flex-shrink:0}.del:hover{color:var(--rd);background:var(--rdb)}
.fp{padding:16px 14px}.ft{font-size:22px;font-weight:800;margin-bottom:16px}.tog{display:flex;background:var(--bg3);border-radius:40px;padding:3px;margin-bottom:16px;border:1px solid var(--bd)}.tb2{flex:1;padding:10px;border:none;border-radius:40px;font-family:var(--f);font-size:14px;font-weight:700;cursor:pointer;background:0;color:var(--t3);display:flex;align-items:center;justify-content:center;gap:6px}.tb2.gi{background:var(--grb);color:var(--gr)}.tb2.ro{background:var(--rdb);color:var(--rd)}.fg{margin-bottom:14px}.fl{font-size:11px;color:var(--t3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:5px;display:block}.fi{width:100%;padding:11px 12px;background:var(--bg3);border:1px solid var(--bd);border-radius:var(--rs);color:var(--t1);font-family:var(--f);font-size:15px;outline:0}.fi:focus{border-color:var(--or)}.fi::placeholder{color:var(--t3)}.fr{display:flex;gap:8px}.fr>.fg{flex:1}.pls{display:flex;flex-wrap:wrap;gap:6px}.p{padding:7px 13px;border-radius:40px;border:1px solid var(--bd);background:var(--bg3);color:var(--t2);font-family:var(--f);font-size:12px;cursor:pointer;display:flex;align-items:center;gap:5px;transition:.2s}.p.on{border-color:var(--or);background:rgba(232,83,30,.15);color:var(--or)}.p.g.on{border-color:var(--gr);background:var(--grb);color:var(--gr)}.p.r.on{border-color:var(--rd);background:var(--rdb);color:var(--rd)}.btn{width:100%;padding:14px;border:none;border-radius:var(--r);font-family:var(--f);font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;color:#fff}.btn.g{background:linear-gradient(135deg,var(--gr),var(--gr2))}.btn.r{background:linear-gradient(135deg,var(--rd),var(--rd2))}.btn.o{background:linear-gradient(135deg,var(--or),var(--or2))}.btn:active{transform:scale(.98)}.btn:disabled{opacity:.4}
.s2{margin:0 12px 12px;background:var(--bg3);border:1px solid var(--bd);border-radius:var(--r);overflow:hidden;box-shadow:var(--sh)}.sr{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid var(--bd)}.sr:last-child{border-bottom:none}.srl{font-size:13px;font-weight:500}.si{width:90px;padding:6px 8px;background:var(--bg);border:1px solid var(--bd);border-radius:var(--rs);color:var(--t1);font-family:var(--m);font-size:13px;text-align:right;outline:0}.si:focus{border-color:var(--or)}.fb{display:flex;gap:6px;padding:0 12px;margin-bottom:10px;overflow-x:auto;scrollbar-width:none}.fb::-webkit-scrollbar{display:none}.fc{flex-shrink:0;padding:6px 12px;border-radius:40px;border:1px solid var(--bd);background:var(--bg3);color:var(--t2);font-size:12px;cursor:pointer;font-weight:500}.fc.on{border-color:var(--or);background:rgba(232,83,30,.15);color:var(--or)}.em{text-align:center;padding:40px 20px;color:var(--t3)}.emi{width:50px;height:50px;border-radius:50%;background:var(--bg3);display:flex;align-items:center;justify-content:center;margin:0 auto 10px}
.tst{position:fixed;top:16px;left:50%;transform:translateX(-50%);background:var(--gr);color:#fff;padding:10px 20px;border-radius:40px;font-size:14px;font-weight:600;z-index:200;display:flex;align-items:center;gap:6px;animation:ai .3s,ao .3s 1.7s}@keyframes ai{from{opacity:0;transform:translateX(-50%) translateY(-16px)}}@keyframes ao{to{opacity:0;transform:translateX(-50%) translateY(-16px)}}
.tp{display:flex;flex-direction:column;align-items:center;padding:20px 16px}.ring{position:relative;width:220px;height:220px;margin:8px 0}.ring svg{transform:rotate(-90deg)}.rc{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}.tcs{display:flex;gap:14px;margin:20px 0 24px}.tbx{width:64px;height:64px;border-radius:50%;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer}.tbx:active{transform:scale(.92)}.tbx.pl{background:linear-gradient(135deg,var(--gr),var(--gr2));box-shadow:0 4px 20px rgba(34,197,94,.4)}.tbx.pa{background:linear-gradient(135deg,var(--yl),#d97706)}.tbx.sp{background:linear-gradient(135deg,var(--rd),var(--rd2))}.tbx.rs{background:var(--bg3);border:1px solid var(--bd)}.ttl{background:var(--bg3);border:1px solid var(--bd);border-radius:var(--r);padding:14px;margin-bottom:12px;width:100%;max-width:400px;text-align:center;box-shadow:var(--sh)}.ttll{font-size:11px;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}.ttlv{font-family:var(--m);font-size:28px;font-weight:700;color:var(--or)}.lk{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:400px;margin-bottom:16px}.lkc{background:var(--bg3);border:1px solid var(--bd);border-radius:var(--rs);padding:10px;text-align:center;box-shadow:var(--sh)}.lkl{font-size:9px;color:var(--t3);text-transform:uppercase;margin-bottom:2px}.lkv{font-family:var(--m);font-size:16px;font-weight:700}.tss{width:100%;max-width:400px}.tsi{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--bg3);border:1px solid var(--bd);border-radius:var(--rs);margin-bottom:6px}.mob{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:150;display:flex;align-items:flex-end;justify-content:center}.mod{background:var(--bg3);border-radius:20px 20px 0 0;width:100%;max-width:430px;padding:20px 16px 32px}.modt{font-size:18px;font-weight:700;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center}.modc{background:0;border:0;color:var(--t3);cursor:pointer}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}::-webkit-scrollbar{width:0}`}</style>;

// DASHBOARD
function Dash({state,dispatch,ts}){
  const[pe,sPe]=useState("month");const[cA,sCA]=useState("");const[cB,sCB]=useState("");
  const{transactions:tx,categories:ca,settings:se}=state;
  const fl=useMemo(()=>filt(tx,pe,cA,cB),[tx,pe,cA,cB]);
  const inc=useMemo(()=>fl.filter(t=>t.type==="IN"),[fl]);
  const exp=useMemo(()=>fl.filter(t=>t.type==="OUT"),[fl]);
  const tI=inc.reduce((a,t)=>a+t.value,0),tE=exp.reduce((a,t)=>a+t.value,0),bal=tI-tE;
  const goal=pe==="day"?se.dailyGoal:pe==="year"?se.yearlyGoal:se.monthlyGoal;
  const perf=goal>0?Math.min(tI/goal*100,150):0;
  const trips=inc.length,hrs=inc.reduce((a,t)=>a+(t.hoursWorked||0),0);
  const km=inc.reduce((a,t)=>a+Math.max(0,(t.kmEnd||0)-(t.kmStart||0)),0);
  const aT=trips>0?tI/trips:0,aH=hrs>0?tI/hrs:0,aK=km>0?tI/km:0;
  const hG=pe==="day"?se.dailyHoursGoal:se.monthlyHoursGoal;
  const hP=hG>0?Math.min(hrs/hG*100,150):0;
  const eBC=useMemo(()=>{const m={};exp.forEach(t=>{const c=ca.find(x=>x.id===t.categoryId);m[c?.name||"Outros"]=(m[c?.name||"Outros"]||0)+t.value;});return Object.entries(m).map(([n,v])=>({name:n,value:+v.toFixed(2)}));},[exp,ca]);
  const iBA=useMemo(()=>{const m={};inc.forEach(t=>{const l={UBER:"Uber","99":"99",INDRIVER:"Indriver",PARTICULAR:"Particular"}[t.appSource]||"Outros";m[l]=(m[l]||0)+t.value;});return Object.entries(m).map(([n,v])=>({name:n,value:+v.toFixed(2)})).sort((a,b)=>b.value-a.value);},[inc]);
  const mB=useMemo(()=>{const mt={};(pe==="year"?filt(tx,"year"):fl).forEach(t=>{const m=t.date.substring(0,7);if(!mt[m])mt[m]={month:m,ent:0,sai:0};t.type==="IN"?mt[m].ent+=t.value:mt[m].sai+=t.value;});return Object.values(mt).sort((a,b)=>a.month.localeCompare(b.month)).map(m=>({...m,label:new Date(m.month+"-15").toLocaleDateString("pt-BR",{month:"short"}).replace(".",""),ent:+m.ent.toFixed(0),sai:+m.sai.toFixed(0)}));},[tx,fl,pe]);
  const EC=["#ef4444","#f97316","#eab308","#06b6d4","#a855f7","#ec4899"],INC=["#22c55e","#3b82f6","#a855f7","#eab308","#06b6d4"];
  const pc=perf>=100?"var(--gr)":perf>=60?"var(--yl)":"var(--rd)",hc=hP>=100?"var(--gr)":hP>=60?"var(--yl)":"var(--rd)";
  const pL={day:"Dia",week:"Semana",month:"Mês",year:"Ano",custom:"Período"}[pe];
  const has=tx.length>0;
  const tt={background:se.theme==="dark"?"#222":"#fff",border:"1px solid "+(se.theme==="dark"?"#444":"#ddd"),borderRadius:8,color:se.theme==="dark"?"#fff":"#111",fontFamily:"var(--m)",fontSize:11};
  return<div>
    <div className="hdr"><div className="logo">Rota<span>Lucro</span></div>{!has&&<button className="p on" style={{fontSize:11,padding:"6px 10px"}} onClick={()=>dispatch({type:"SM",d:mkDemo()})}><Zap size={12}/> Demo</button>}</div>
    <div className="tabs">{["day","week","month","year","custom"].map(p=><button key={p} className={`tab ${pe===p?"on":""}`} onClick={()=>sPe(p)}>{{day:"Diário",week:"Semanal",month:"Mensal",year:"Anual",custom:"Custom"}[p]}</button>)}</div>
    {pe==="custom"&&<div className="cr"><Calendar size={14} color="var(--t3)"/><input type="date" value={cA} onChange={e=>sCA(e.target.value)}/><span>até</span><input type="date" value={cB} onChange={e=>sCB(e.target.value)}/></div>}
    <div className="tc"><div className="rw"><div className="sc f" style={{flex:2}}><div className="sl">Faturamento {pL}</div><div className="sv">{R$(tI)}</div></div></div><div className="rw"><div className="sc d"><div className="sl">Despesas</div><div className="sv">{R$(tE)}</div></div><div className="sc s"><div className="sl">Saldo</div><div className="sv">{R$(bal)}</div></div></div></div>
    <div className="ms"><div className="mr"><span className="ml">Meta Faturamento</span><span className="mv">{R$(goal)}</span></div><div className="pr"><div className="pp" style={{color:pc}}>{perf.toFixed(0)}%</div><div className="pt"><div className="pf" style={{width:`${Math.min(perf,100)}%`,background:`linear-gradient(90deg,${pc},${pc}aa)`}}/></div></div>{has&&<div style={{fontSize:10,color:"var(--t3)",marginTop:4}}>Falta: {R$(Math.max(0,goal-tI))}</div>}</div>
    {has&&hG>0&&<div className="ms" style={{marginTop:-2}}><div className="mr"><span className="ml">Meta Horas</span><span className="mv">{hrs.toFixed(1)}h / {hG}h</span></div><div className="pr"><div className="pp" style={{color:hc,fontSize:20}}>{hP.toFixed(0)}%</div><div className="pt"><div className="pf" style={{width:`${Math.min(hP,100)}%`,background:`linear-gradient(90deg,${hc},${hc}aa)`}}/></div></div></div>}
    {has&&<><div className="mg">{[["Viagens",trips],["Horas",hrs.toFixed(1)],["KM",km.toLocaleString("pt-BR")]].map(([l,v])=><div key={l} className="mc"><div className="mcl">{l}</div><div className="mcv">{v}</div></div>)}</div><div className="mg">{[["Média/Viagem",R$(aT)],["Ganho/Hora",R$(aH)],["Média/KM",R$(aK)]].map(([l,v])=><div key={l} className="mc"><div className="mcl">{l}</div><div className="mcv2">{v}</div></div>)}</div></>}
    {iBA.length>0&&<div className="cc"><div className="cct">Faturamento por App</div><div style={{display:"flex",alignItems:"center",gap:8}}><ResponsiveContainer width="50%" height={150}><PieChart><Pie data={iBA} cx="50%" cy="50%" innerRadius={38} outerRadius={62} dataKey="value" stroke="none" paddingAngle={2}>{iBA.map((_,i)=><Cell key={i} fill={INC[i%INC.length]}/>)}</Pie><Tooltip formatter={v=>R$(v)} contentStyle={tt}/></PieChart></ResponsiveContainer><div style={{flex:1}}><div style={{fontFamily:"var(--m)",fontSize:16,fontWeight:700,marginBottom:8}}>{R$(tI)}</div>{iBA.map((e,i)=><div key={e.name} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><div style={{width:10,height:10,borderRadius:3,background:INC[i%INC.length],flexShrink:0}}/><span style={{fontSize:11,color:"var(--t2)",flex:1}}>{e.name}</span><span style={{fontFamily:"var(--m)",fontSize:11,fontWeight:600}}>{R$(e.value)}</span></div>)}</div></div></div>}
    {mB.length>1&&<div className="cc"><div className="cct">Entradas x Saídas</div><ResponsiveContainer width="100%" height={160}><BarChart data={mB} barGap={2} barCategoryGap="20%"><CartesianGrid strokeDasharray="3 3" stroke={se.theme==="dark"?"#333":"#e0e0e0"}/><XAxis dataKey="label" tick={{fill:"#888",fontSize:10}} axisLine={{stroke:se.theme==="dark"?"#333":"#ddd"}} tickLine={false}/><YAxis tick={{fill:"#888",fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1e3).toFixed(0)}k`}/><Tooltip formatter={v=>R$(v)} contentStyle={tt}/><Bar dataKey="ent" fill="#22c55e" radius={[4,4,0,0]} name="Entradas"/><Bar dataKey="sai" fill="#ef4444" radius={[4,4,0,0]} name="Saídas"/></BarChart></ResponsiveContainer></div>}
    {eBC.length>0&&<div className="cc"><div className="cct">Despesas por Categoria</div><div style={{display:"flex",alignItems:"center",gap:8}}><ResponsiveContainer width="50%" height={150}><PieChart><Pie data={eBC} cx="50%" cy="50%" innerRadius={38} outerRadius={62} dataKey="value" stroke="none" paddingAngle={2}>{eBC.map((_,i)=><Cell key={i} fill={EC[i%EC.length]}/>)}</Pie><Tooltip formatter={v=>R$(v)} contentStyle={tt}/></PieChart></ResponsiveContainer><div style={{flex:1}}><div style={{fontFamily:"var(--m)",fontSize:16,fontWeight:700,color:"var(--rd)",marginBottom:8}}>{R$(tE)}</div>{eBC.map((e,i)=><div key={e.name} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><div style={{width:10,height:10,borderRadius:3,background:EC[i%EC.length],flexShrink:0}}/><span style={{fontSize:11,color:"var(--t2)",flex:1}}>{e.name}</span><span style={{fontFamily:"var(--m)",fontSize:11,fontWeight:600}}>{R$(e.value)}</span></div>)}</div></div></div>}
    {has&&<><div className="stl">Últimos Lançamentos</div><div className="tl">{tx.slice(0,5).map(t=>{const c=ca.find(x=>x.id===t.categoryId);return<div key={t.id} className="ti"><div className={`tic ${t.type==="IN"?"i":"o"}`}><IC icon={c?.icon||"other"}/></div><div className="tif"><div className="tin">{c?.name||"—"}</div><div className="tim"><span>{fD(t.date)}</span>{t.appSource&&<span>· {t.appSource}</span>}</div></div><div className={`tv ${t.type==="IN"?"i":"o"}`}>{t.type==="IN"?"+":"−"}{R$(t.value)}</div></div>})}</div></>}
    {!has&&<div className="em"><div className="emi"><TrendingUp size={22}/></div><div style={{fontSize:14,marginBottom:4}}>Nenhum lançamento</div><div style={{fontSize:12}}>Toque no + ou carregue dados demo</div></div>}
  </div>;
}

// TIMER
function Tmr({ts,setTs,toast,state}){
  const{running:rn,elapsed:el,sessions:ss,startTime:sT}=ts;
  const[dp,sDp]=useState(el);const ref=useRef(null);
  useEffect(()=>{if(rn&&sT)ref.current=setInterval(()=>sDp(el+(Date.now()-sT)),200);else sDp(el);return()=>{if(ref.current)clearInterval(ref.current)};},[rn,el,sT]);
  const start=()=>setTs(p=>({...p,running:true,startTime:Date.now()}));
  const pause=()=>{const n=Date.now();setTs(p=>({...p,running:false,elapsed:p.elapsed+(n-(p.startTime||n)),startTime:null}));};
  const stop=()=>{const n=Date.now(),tot=rn?el+(n-(sT||n)):el;if(tot>6e4){setTs(p=>({...p,running:false,elapsed:0,startTime:null,sessions:[{id:uid(),duration:tot,date:td(),endTime:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})},...p.sessions]}));toast(`Sessão de ${fT(tot)} salva!`);}else setTs(p=>({...p,running:false,elapsed:0,startTime:null}));};
  const reset=()=>setTs(p=>({...p,running:false,elapsed:0,startTime:null}));
  const tS=ss.filter(s=>s.date===td()),tT=tS.reduce((a,x)=>a+x.duration,0)+(rn?dp:el);
  const prog=Math.min(dp/36e5,12),circ=2*Math.PI*96,dash=circ-(prog/12)*circ;
  const tTx=state.transactions.filter(t=>t.date===td()&&t.type==="IN"),tInc=tTx.reduce((a,t)=>a+t.value,0),tHrs=tT/36e5,lGH=tHrs>0?tInc/tHrs:0;
  return<div className="tp">
    <div className="ft" style={{alignSelf:"flex-start"}}>Dirigindo</div>
    <div style={{fontSize:12,color:"var(--t3)",alignSelf:"flex-start",marginBottom:8}}>Controle sua jornada</div>
    <div className="ring"><svg width="220" height="220" viewBox="0 0 220 220"><circle cx="110" cy="110" r="96" fill="none" stroke="var(--bd)" strokeWidth="6"/><circle cx="110" cy="110" r="96" fill="none" stroke={rn?"var(--or)":"var(--t3)"} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round" style={{transition:"stroke-dashoffset .5s"}}/></svg><div className="rc"><div style={{fontFamily:"var(--m)",fontSize:48,fontWeight:700}}>{fT(dp)}</div><div style={{fontSize:12,color:"var(--t3)"}}>{fH(dp)}h</div></div></div>
    <div className="tcs"><button className="tbx rs" onClick={reset}><RotateCcw size={22} color="var(--t3)"/></button>{!rn?<button className="tbx pl" onClick={start}><Play size={26} color="#fff" style={{marginLeft:3}}/></button>:<button className="tbx pa" onClick={pause}><Pause size={26} color="#fff"/></button>}<button className="tbx sp" onClick={stop}><Square size={20} color="#fff"/></button></div>
    <div className="lk"><div className="lkc"><div className="lkl">Ganho/Hora</div><div className="lkv" style={{color:"var(--gr)"}}>{R$(lGH)}</div></div><div className="lkc"><div className="lkl">Faturamento</div><div className="lkv" style={{color:"var(--or)"}}>{R$(tInc)}</div></div><div className="lkc"><div className="lkl">Viagens</div><div className="lkv">{tTx.length}</div></div><div className="lkc"><div className="lkl">Horas</div><div className="lkv">{fH(tT)}h</div></div></div>
    <div className="ttl"><div className="ttll">Total Hoje</div><div className="ttlv">{fT(tT)}</div></div>
    {ss.length>0&&<><div className="stl" style={{alignSelf:"flex-start",paddingLeft:0}}>Sessões Recentes</div><div className="tss">{ss.slice(0,8).map(s=><div key={s.id} className="tsi"><div><div style={{fontFamily:"var(--m)",fontSize:14,fontWeight:600}}>{fT(s.duration)}</div><div style={{fontSize:11,color:"var(--t3)"}}>{fDF(s.date)} · {s.endTime}</div></div><div style={{fontFamily:"var(--m)",fontSize:13,color:"var(--or)",fontWeight:600}}>{fH(s.duration)}h</div></div>)}</div></>}
  </div>;
}

// NEW TXN
function NT({state,dispatch,toast,ts}){
  const{categories:ca,paymentMethods:pm,settings:se}=state;
  const[ty,sTy]=useState("IN");const[ci,sCi]=useState("c6");const[pi,sPi]=useState("p1");
  const[gr,sGr]=useState("");const[tp,sTp]=useState("");const[vl,sVl]=useState("");
  const[ks,sKs]=useState("");const[ke,sKe]=useState("");const[ap,sAp]=useState("UBER");
  const[dt,sDt]=useState(td());const[hr,sHr]=useState("");
  const fc=ca.filter(c=>c.type===ty);
  useEffect(()=>{sCi(fc[0]?.id||"");},[ty]);
  const tH=useMemo(()=>(ts.sessions.filter(s=>s.date===td()).reduce((a,x)=>a+x.duration,0)/36e5).toFixed(1),[ts.sessions]);
  const sub=()=>{const v=ty==="IN"?parseFloat(gr||0)+parseFloat(tp||0):parseFloat(vl||0);if(v<=0)return;dispatch({type:"AT",d:{id:uid(),type:ty,categoryId:ci,paymentMethodId:ty==="OUT"?pi:"",value:v,grossValue:parseFloat(gr||0),tips:parseFloat(tp||0),kmStart:parseInt(ks||0),kmEnd:parseInt(ke||0),appSource:ty==="IN"?ap:"",date:dt,timestamp:new Date().toISOString(),hoursWorked:parseFloat(hr||0)}});toast(ty==="IN"?"Ganho registrado!":"Despesa registrada!");sGr("");sTp("");sVl("");sKs("");sKe("");sHr("");};
  const cK=se.vehicle.consumptionKmL>0?(se.fuelPrice/se.vehicle.consumptionKmL)+se.vehicle.maintenanceCostKm:0;
  return<div className="fp"><div className="ft">Novo Lançamento</div>
    <div className="tog"><button className={`tb2 ${ty==="IN"?"gi":""}`} onClick={()=>sTy("IN")}><ArrowUpRight size={16}/> Ganho</button><button className={`tb2 ${ty==="OUT"?"ro":""}`} onClick={()=>sTy("OUT")}><ArrowDownRight size={16}/> Despesa</button></div>
    <div className="fg"><label className="fl">{ty==="IN"?"Aplicativo":"Categoria"}</label><div className="pls">{fc.map(c=><button key={c.id} className={`p ${ty==="IN"?"g":"r"} ${ci===c.id?"on":""}`} onClick={()=>sCi(c.id)}><IC icon={c.icon} size={13}/> {c.name}</button>)}</div></div>
    {ty==="IN"&&<><div className="fg"><label className="fl">Plataforma</label><div className="pls">{["UBER","99","INDRIVER","PARTICULAR"].map(a=><button key={a} className={`p g ${ap===a?"on":""}`} onClick={()=>sAp(a)}>{a==="PARTICULAR"?"Particular":a}</button>)}</div></div>
    <div className="fr"><div className="fg"><label className="fl">Valor bruto (R$)</label><input className="fi" type="number" inputMode="decimal" placeholder="0,00" value={gr} onChange={e=>sGr(e.target.value)}/></div><div className="fg"><label className="fl">Gorjeta (R$)</label><input className="fi" type="number" inputMode="decimal" placeholder="0,00" value={tp} onChange={e=>sTp(e.target.value)}/></div></div>
    <div className="fr"><div className="fg"><label className="fl">KM Inicial</label><input className="fi" type="number" inputMode="numeric" placeholder="0" value={ks} onChange={e=>sKs(e.target.value)}/></div><div className="fg"><label className="fl">KM Final</label><input className="fi" type="number" inputMode="numeric" placeholder="0" value={ke} onChange={e=>sKe(e.target.value)}/></div></div>
    <div className="fr"><div className="fg" style={{flex:1}}><label className="fl">Horas</label><div style={{display:"flex",gap:6}}><input className="fi" type="number" inputMode="decimal" step="0.5" placeholder="0" value={hr} onChange={e=>sHr(e.target.value)} style={{flex:1}}/>{parseFloat(tH)>0&&<button className="p on" style={{fontSize:10,padding:"6px 10px",flexShrink:0}} onClick={()=>sHr(tH)}><Timer size={12}/> {tH}h</button>}</div></div><div className="fg"><label className="fl">Data</label><input className="fi" type="date" value={dt} onChange={e=>sDt(e.target.value)}/></div></div></>}
    {ty==="OUT"&&<><div className="fg"><label className="fl">Valor (R$)</label><input className="fi" type="number" inputMode="decimal" placeholder="0,00" value={vl} onChange={e=>sVl(e.target.value)}/></div><div className="fg"><label className="fl">Data</label><input className="fi" type="date" value={dt} onChange={e=>sDt(e.target.value)}/></div><div className="fg"><label className="fl">Pagamento</label><div className="pls">{pm.map(p=><button key={p.id} className={`p ${pi===p.id?"on":""}`} onClick={()=>sPi(p.id)}>{p.name==="Pix"?<QrCode size={13}/>:p.name==="Cartão"?<CreditCard size={13}/>:<Banknote size={13}/>} {p.name}</button>)}</div></div>{cK>0&&<div style={{background:"rgba(232,83,30,.12)",borderRadius:"var(--rs)",padding:"10px 12px",marginBottom:14,fontSize:12,color:"var(--or)",display:"flex",alignItems:"center",gap:8}}><Fuel size={14}/> Custo/KM: <strong style={{fontFamily:"var(--m)"}}>{R$(cK)}</strong></div>}</>}
    <button className={`btn ${ty==="IN"?"g":"r"}`} onClick={sub} disabled={ty==="IN"?!gr:!vl}><Check size={18}/> {ty==="IN"?"Registrar Ganho":"Registrar Despesa"}</button></div>;
}

// HISTORY
function Hist({state,dispatch}){
  const{transactions:tx,categories:ca}=state;const[f,sF]=useState("ALL");
  const fl=useMemo(()=>{let t=[...tx];if(f==="IN")t=t.filter(x=>x.type==="IN");if(f==="OUT")t=t.filter(x=>x.type==="OUT");return t.sort((a,b)=>b.date.localeCompare(a.date)||b.timestamp.localeCompare(a.timestamp));},[tx,f]);
  const gr=useMemo(()=>{const m={};fl.forEach(t=>{if(!m[t.date])m[t.date]=[];m[t.date].push(t);});return Object.entries(m).sort((a,b)=>b[0].localeCompare(a[0]));},[fl]);
  return<div><div style={{padding:"16px 16px 6px"}}><div className="ft">Histórico</div></div>
    <div className="fb">{[["ALL","Todos"],["IN","Ganhos"],["OUT","Despesas"]].map(([k,l])=><button key={k} className={`fc ${f===k?"on":""}`} onClick={()=>sF(k)}>{l}</button>)}</div>
    <div className="tl">{gr.length===0&&<div className="em"><div className="emi"><FileText size={22}/></div><div style={{fontSize:14}}>Sem lançamentos</div></div>}
    {gr.map(([dt,ts])=>{const dI=ts.filter(t=>t.type==="IN").reduce((a,t)=>a+t.value,0),dO=ts.filter(t=>t.type==="OUT").reduce((a,t)=>a+t.value,0);return<div key={dt}><div className="dy"><span>{fDF(dt)}</span><span style={{fontFamily:"var(--m)",fontSize:11}}><span style={{color:"var(--gr)"}}>+{R$(dI)}</span>{dO>0&&<span style={{color:"var(--rd)",marginLeft:6}}>−{R$(dO)}</span>}</span></div>{ts.map(t=>{const c=ca.find(x=>x.id===t.categoryId);return<div key={t.id} className="ti"><div className={`tic ${t.type==="IN"?"i":"o"}`}><IC icon={c?.icon||"other"}/></div><div className="tif"><div className="tin">{c?.name||"—"}</div><div className="tim">{t.appSource&&<span>{t.appSource}</span>}{t.kmEnd>t.kmStart&&<span>· {t.kmEnd-t.kmStart}km</span>}{t.hoursWorked>0&&<span>· {t.hoursWorked}h</span>}</div></div><div className={`tv ${t.type==="IN"?"i":"o"}`}>{t.type==="IN"?"+":"−"}{R$(t.value)}</div><button className="del" onClick={()=>dispatch({type:"DT",d:t.id})}><Trash2 size={13}/></button></div>})}</div>})}</div></div>;
}

// SETTINGS
function Cfg({state,dispatch,toast}){
  const s=state.settings;
  const[dg,sDg]=useState(s.dailyGoal),[mg,sMg]=useState(s.monthlyGoal),[yg,sYg]=useState(s.yearlyGoal);
  const[dh,sDh]=useState(s.dailyHoursGoal),[mh,sMh]=useState(s.monthlyHoursGoal);
  const[fp,sFp]=useState(s.fuelPrice),[ck,sCk]=useState(s.vehicle.consumptionKmL),[mk,sMk]=useState(s.vehicle.maintenanceCostKm);
  const[ma,sMa]=useState(s.vehicle.make),[mo,sMo]=useState(s.vehicle.model),[yr,sYr]=useState(s.vehicle.year),[ft,sFt]=useState(s.vehicle.fuelType);
  const[sm,sSm]=useState(false);const[cn,sCn]=useState("");const[ct,sCt]=useState("OUT");
  const cK=ck>0?(fp/ck)+mk:0;
  const save=()=>{dispatch({type:"SS",d:{dailyGoal:+dg,monthlyGoal:+mg,yearlyGoal:+yg,dailyHoursGoal:+dh,monthlyHoursGoal:+mh,fuelPrice:+fp}});dispatch({type:"SV",d:{make:ma,model:mo,year:yr,fuelType:ft,consumptionKmL:+ck,maintenanceCostKm:+mk}});toast("Salvo!");};
  const exp=()=>{const j=JSON.stringify(state,null,2),b=new Blob([j],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=`rotalucro_${td()}.json`;a.click();URL.revokeObjectURL(u);toast("Backup exportado!");};
  const tTh=()=>dispatch({type:"SS",d:{theme:s.theme==="dark"?"light":"dark"}});
  const addC=()=>{if(!cn.trim())return;dispatch({type:"AC",d:{id:uid(),name:cn.trim(),type:ct,icon:"custom",sys:0}});sCn("");toast("Categoria criada!");};
  return<div><div style={{padding:"16px 16px 6px"}}><div className="ft">Configurações</div></div>
    <div className="stl">Aparência</div><div className="s2"><div className="sr" style={{cursor:"pointer"}} onClick={tTh}><span className="srl" style={{display:"flex",alignItems:"center",gap:8}}>{s.theme==="dark"?<Moon size={16}/>:<Sun size={16}/>}{s.theme==="dark"?"Modo Escuro":"Modo Claro"}</span><div className="p on" style={{padding:"4px 10px",fontSize:11}}>{s.theme==="dark"?"Escuro":"Claro"}</div></div></div>
    <div className="stl">Metas Financeiras</div><div className="s2">
      <div className="sr"><span className="srl">Meta diária</span><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:12,color:"var(--t3)"}}>R$</span><input className="si" type="number" value={dg} onChange={e=>sDg(e.target.value)}/></div></div>
      <div className="sr"><span className="srl">Meta mensal</span><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:12,color:"var(--t3)"}}>R$</span><input className="si" type="number" value={mg} onChange={e=>sMg(e.target.value)}/></div></div>
      <div className="sr"><span className="srl">Meta anual</span><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:12,color:"var(--t3)"}}>R$</span><input className="si" type="number" value={yg} onChange={e=>sYg(e.target.value)}/></div></div></div>
    <div className="stl">Metas de Horas</div><div className="s2"><div className="sr"><span className="srl">Horas/dia</span><input className="si" type="number" step="0.5" value={dh} onChange={e=>sDh(e.target.value)}/></div><div className="sr"><span className="srl">Horas/mês</span><input className="si" type="number" value={mh} onChange={e=>sMh(e.target.value)}/></div></div>
    <div className="stl" style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingRight:16}}>Categorias<button className="p on" style={{fontSize:10,padding:"4px 10px"}} onClick={()=>sSm(true)}><PlusCircle size={12}/> Nova</button></div>
    <div className="s2">{state.categories.filter(c=>!c.sys).map(c=><div key={c.id} className="sr"><span className="srl" style={{display:"flex",alignItems:"center",gap:8}}><IC icon={c.icon} size={14}/>{c.name}<span style={{fontSize:10,color:"var(--t3)"}}>({c.type==="IN"?"Entrada":"Saída"})</span></span><button className="del" onClick={()=>{dispatch({type:"DC",d:c.id});toast("Removida");}}><Trash2 size={13}/></button></div>)}{state.categories.filter(c=>!c.sys).length===0&&<div className="sr"><span style={{fontSize:12,color:"var(--t3)"}}>Nenhuma personalizada</span></div>}</div>
    <div className="stl">Veículo</div><div className="s2">
      <div className="sr"><span className="srl">Marca</span><input className="si" style={{width:110}} value={ma} onChange={e=>sMa(e.target.value)} placeholder="Fiat"/></div>
      <div className="sr"><span className="srl">Modelo</span><input className="si" style={{width:110}} value={mo} onChange={e=>sMo(e.target.value)} placeholder="Argo"/></div>
      <div className="sr"><span className="srl">Ano</span><input className="si" style={{width:70}} type="number" value={yr} onChange={e=>sYr(e.target.value)}/></div>
      <div className="sr"><span className="srl">Combustível</span><div className="pls" style={{gap:4}}>{["gasolina","etanol","diesel","GNV"].map(f=><button key={f} className={`p ${ft===f?"on":""}`} style={{padding:"3px 8px",fontSize:10}} onClick={()=>sFt(f)}>{f}</button>)}</div></div>
      <div className="sr"><span className="srl">Consumo (km/l)</span><input className="si" type="number" step="0.1" value={ck} onChange={e=>sCk(e.target.value)}/></div>
      <div className="sr"><span className="srl">Preço comb.</span><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:12,color:"var(--t3)"}}>R$</span><input className="si" type="number" step="0.01" value={fp} onChange={e=>sFp(e.target.value)}/></div></div>
      <div className="sr"><span className="srl">Manut./km</span><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:12,color:"var(--t3)"}}>R$</span><input className="si" type="number" step="0.01" value={mk} onChange={e=>sMk(e.target.value)}/></div></div></div>
    {cK>0&&<div style={{margin:"0 12px 12px",background:"rgba(232,83,30,.12)",borderRadius:"var(--rs)",padding:"12px",fontSize:13,color:"var(--or)",display:"flex",alignItems:"center",gap:8}}><Car size={16}/><div>Custo/KM: <strong style={{fontFamily:"var(--m)"}}>{R$(cK)}</strong></div></div>}
    <div className="stl">Dados</div><div className="s2"><div className="sr" style={{cursor:"pointer"}} onClick={exp}><span className="srl" style={{display:"flex",alignItems:"center",gap:8}}><Download size={15}/> Exportar backup</span><ChevronRight size={16} color="var(--t3)"/></div></div>
    <div style={{padding:"0 12px 16px"}}><button className="btn o" onClick={save}><Save size={18}/> Salvar</button></div>
    <div style={{textAlign:"center",padding:"4px 0 16px",fontSize:10,color:"var(--t3)"}}>RotaLucro v2.0</div>
    {sm&&<div className="mob" onClick={()=>sSm(false)}><div className="mod" onClick={e=>e.stopPropagation()}><div className="modt">Nova Categoria<button className="modc" onClick={()=>sSm(false)}><X size={20}/></button></div><div className="fg"><label className="fl">Nome</label><input className="fi" placeholder="Ex: Seguro, IPVA..." value={cn} onChange={e=>sCn(e.target.value)}/></div><div className="fg"><label className="fl">Tipo</label><div className="tog" style={{marginBottom:12}}><button className={`tb2 ${ct==="IN"?"gi":""}`} onClick={()=>sCt("IN")}>Entrada</button><button className={`tb2 ${ct==="OUT"?"ro":""}`} onClick={()=>sCt("OUT")}>Saída</button></div></div><button className="btn o" onClick={()=>{addC();sSm(false);}} disabled={!cn.trim()}><PlusCircle size={18}/> Criar</button></div></div>}
  </div>;
}

// APP
export default function App(){
  const[state,dispatch]=useReducer(reducer,{transactions:[],categories:CATS,paymentMethods:PMS,settings:DSET});
  const[pg,sPg]=useState("dash");const[tm,sTm]=useState(null);
  const toast=m=>{sTm(m);setTimeout(()=>sTm(null),2000);};
  const[ts,sTs]=useState({running:false,elapsed:0,startTime:null,sessions:[]});
  useEffect(()=>{try{localStorage.setItem("rl6",JSON.stringify(state))}catch{}},[state]);
  useEffect(()=>{(()=>{try{const r=localStorage.getItem("rl6");if(r){const p=JSON.parse(r);if(p.transactions?.length>0)dispatch({type:"LD",d:p})}}catch{}})()},[]);
  useEffect(()=>{try{localStorage.setItem("rl6t",JSON.stringify(ts))}catch{}},[ts]);
  useEffect(()=>{(()=>{try{const r=localStorage.getItem("rl6t");if(r){const p=JSON.parse(r);if(p.sessions?.length>0)sTs(v=>({...v,sessions:p.sessions}))}}catch{}})()},[]);
  return<><Sty th={state.settings.theme||"dark"}/>
    <div className="app">
      {pg==="dash"&&<Dash state={state} dispatch={dispatch} ts={ts}/>}
      {pg==="timer"&&<Tmr ts={ts} setTs={sTs} toast={toast} state={state}/>}
      {pg==="new"&&<NT state={state} dispatch={dispatch} toast={toast} ts={ts}/>}
      {pg==="hist"&&<Hist state={state} dispatch={dispatch}/>}
      {pg==="cfg"&&<Cfg state={state} dispatch={dispatch} toast={toast}/>}
      <nav className="bn">
        <button className={`bi ${pg==="dash"?"on":""}`} onClick={()=>sPg("dash")}><LayoutDashboard size={20}/><span>Painel</span></button>
        <button className={`bi ${pg==="timer"?"on":""}`} onClick={()=>sPg("timer")}><Timer size={20}/><span>Dirigindo{ts.running&&<span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:"var(--gr)",marginLeft:3,animation:"pulse 1s infinite"}}/>}</span></button>
        <button className="ba" onClick={()=>sPg("new")}><div className="bac"><Plus size={22} color="#fff"/></div></button>
        <button className={`bi ${pg==="hist"?"on":""}`} onClick={()=>sPg("hist")}><FileText size={20}/><span>Transações</span></button>
        <button className={`bi ${pg==="cfg"?"on":""}`} onClick={()=>sPg("cfg")}><Settings size={20}/><span>Config</span></button>
      </nav>
    </div>
    {tm&&<div className="tst"><Check size={14}/>{tm}</div>}
  </>;
}
