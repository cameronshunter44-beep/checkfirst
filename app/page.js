'use client';

import { useEffect, useMemo, useState } from 'react';

const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);

const num = (v) => {
  const n = Number(String(v ?? '').replace(/[$,%\s,]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const payment = (principal, apr, months) => {
  if (principal <= 0 || months <= 0) return 0;
  const rate = apr / 1200;
  if (rate === 0) return principal / months;
  return (principal * rate) / (1 - Math.pow(1 + rate, -months));
};

const TOOL_CONFIGS = {
  car: {
    icon: '🚗',
    title: 'Car Purchase',
    description: 'Vehicle price, financing, trade equity and ownership costs.',
    defaults: { price: '32995', apr: '8.4', term: '72', down: '3000', trade: '8000', owed: '5400', tax: '7', fees: '699', addons: '1495', insurance: '175', fuel: '160', maint: '75', year: '2022', make: 'Toyota', model: 'Camry', miles: '48500' },
    fields: [
      ['Vehicle price','price','$','',false],['APR','apr','','%',false],['Loan term','term','',' months',false],['Down payment','down','$','',false],['Trade value','trade','$','',false],['Amount owed','owed','$','',false],
      ['Year','year','','',true],['Make','make','','',true],['Model','model','','',true],['Mileage','miles','',' miles',true],['Sales tax','tax','','%',true],['Dealer fees','fees','$','',true],['Add-ons','addons','$','',true],['Insurance / month','insurance','$','',true],['Fuel / month','fuel','$','',true],['Maintenance / month','maint','$','',true]
    ],
  },
  home: {
    icon: '🏠', title: 'Home Buying', description: 'Mortgage, taxes, insurance, closing costs and monthly carrying costs.',
    defaults: { price:'425000', down:'85000', apr:'6.4', years:'30', tax:'5200', insurance:'1800', hoa:'150', maint:'350', closing:'12000', utilities:'300' },
    fields: [['Home price','price','$','',false],['Down payment','down','$','',false],['APR','apr','','%',false],['Term','years','',' years',false],['Property tax / year','tax','$','',true],['Insurance / year','insurance','$','',true],['HOA / month','hoa','$','',true],['Maintenance / month','maint','$','',true],['Closing costs','closing','$','',true],['Utilities / month','utilities','$','',true]],
  },
  solar: {
    icon:'☀️', title:'Solar', description:'Cash price versus financed price and long-term loan cost.',
    defaults:{ cash:'27900', financed:'39800', apr:'4.99', years:'25', roof:'14', electric:'210' },
    fields:[['Cash price','cash','$','',false],['Financed price','financed','$','',false],['APR','apr','','%',false],['Loan term','years','',' years',false],['Roof age','roof','',' years',true],['Electric bill / month','electric','$','',true]],
  },
  loan: {
    icon:'💳', title:'Loan', description:'APR, fees, monthly payment and total repayment.',
    defaults:{ amount:'20000', apr:'11.5', term:'60', fees:'800' },
    fields:[['Amount borrowed','amount','$','',false],['APR','apr','','%',false],['Term','term','',' months',false],['Fees','fees','$','',true]],
  },
  purchase: {
    icon:'🛋️', title:'Big Purchase', description:'Furniture, appliances, electronics and store financing.',
    defaults:{ cash:'4200', financed:'4850', apr:'14.9', term:'48', delivery:'250', protection:'400' },
    fields:[['Cash price','cash','$','',false],['Financed amount','financed','$','',false],['APR','apr','','%',false],['Term','term','',' months',false],['Delivery/setup','delivery','$','',true],['Protection plan','protection','$','',true]],
  },
  rent: {
    icon:'🏢', title:'Rent', description:'Base rent, recurring fees, move-in cash and commute cost.',
    defaults:{ base:'1600', months:'12', utilities:'180', parking:'100', internet:'65', other:'45', insurance:'18', movein:'650', deposit:'1600', commute:'120' },
    fields:[['Base rent','base','$','',false],['Lease length','months','',' months',false],['Utilities','utilities','$','',true],['Parking','parking','$','',true],['Internet','internet','$','',true],['Other fees','other','$','',true],['Insurance','insurance','$','',true],['Move-in fees','movein','$','',true],['Deposit','deposit','$','',true],['Commute / month','commute','$','',true]],
  },
  job: {
    icon:'💼', title:'Job Offer', description:'Compare salary, bonus, benefits, commute and PTO.',
    defaults:{ asalary:'80000', abonus:'5000', abenefits:'9200', acommute:'2400', apto:'15', ahours:'5', bsalary:'92000', bbonus:'3000', bbenefits:'7000', bcommute:'6200', bpto:'12', bhours:'10' },
    fields:[['Offer A salary','asalary','$','',false],['Offer A bonus','abonus','$','',false],['Offer B salary','bsalary','$','',false],['Offer B bonus','bbonus','$','',false],['Offer A benefits','abenefits','$','',true],['Offer A commute / year','acommute','$','',true],['Offer A PTO days','apto','','',true],['Offer A commute hrs / week','ahours','',' hrs',true],['Offer B benefits','bbenefits','$','',true],['Offer B commute / year','bcommute','$','',true],['Offer B PTO days','bpto','','',true],['Offer B commute hrs / week','bhours','',' hrs',true]],
  },
};

function calculate(type, v) {
  if (type === 'car') {
    const price=num(v.price), tax=price*num(v.tax)/100, neg=Math.max(0,num(v.owed)-num(v.trade)), pos=Math.max(0,num(v.trade)-num(v.owed));
    const otd=price+tax+num(v.fees)+num(v.addons), financed=Math.max(0,otd-num(v.down)-pos+neg), monthly=payment(financed,num(v.apr),num(v.term)), total=monthly*num(v.term), interest=total-financed;
    return { primary:`${money(monthly)}/mo`, stats:[['Out-the-door',money(otd)],['Amount financed',money(financed)],['Total payments',money(total)],['Interest',money(interest)],['Ownership / month',`${money(monthly+num(v.insurance)+num(v.fuel)+num(v.maint))}/mo`],['Trade position',neg?`${money(neg)} negative`:`${money(pos)} positive`]], summary:{monthly,total,interest,financed}, warnings:[...(num(v.term)>=72?['Long loan term increases total interest.']:[]),...(num(v.addons)>0?[`${money(num(v.addons))} in add-ons entered.`]:[]),...(neg>0?[`${money(neg)} of negative equity is rolled forward.`]:[])] };
  }
  if (type === 'home') {
    const principal=Math.max(0,num(v.price)-num(v.down)), mortgage=payment(principal,num(v.apr),num(v.years)*12), interest=mortgage*num(v.years)*12-principal, taxIns=(num(v.tax)+num(v.insurance))/12, other=num(v.hoa)+num(v.maint)+num(v.utilities), monthly=mortgage+taxIns+other, cash=num(v.down)+num(v.closing);
    return { primary:`${money(monthly)}/mo`, stats:[['Mortgage',money(mortgage)],['Loan amount',money(principal)],['Mortgage interest',money(interest)],['Cash up front',money(cash)],['Tax + insurance',`${money(taxIns)}/mo`],['Other monthly',money(other)]], summary:{monthly,interest,cash}, warnings:[] };
  }
  if (type === 'solar') {
    const monthly=payment(num(v.financed),num(v.apr),num(v.years)*12), total=monthly*num(v.years)*12, interest=total-num(v.financed), gap=num(v.financed)-num(v.cash);
    const warnings=[]; if(num(v.cash)>0&&gap>num(v.cash)*.15)warnings.push('Financed price is more than 15% above the entered cash price.'); if(num(v.years)>=20)warnings.push('This is a very long financing term.'); if(num(v.roof)>=12)warnings.push('Roof age may matter if panels need removal for future roof work.');
    return { primary:money(num(v.financed)), subtitle:`${money(gap)} above entered cash price`, stats:[['Payment',`${money(monthly)}/mo`],['Total payments',money(total)],['Interest',money(interest)],['Cash vs financed gap',money(gap)]], summary:{monthly,total,interest,gap}, warnings };
  }
  if (type === 'loan') {
    const monthly=payment(num(v.amount),num(v.apr),num(v.term)), total=monthly*num(v.term)+num(v.fees), interest=monthly*num(v.term)-num(v.amount);
    return { primary:`${money(monthly)}/mo`, stats:[['Total repayment',money(total)],['Interest',money(interest)],['Fees',money(num(v.fees))],['Cost above principal',money(total-num(v.amount))]], summary:{monthly,total,interest}, warnings:num(v.apr)>15?['The entered APR is above 15%.']:[] };
  }
  if (type === 'purchase') {
    const monthly=payment(num(v.financed),num(v.apr),num(v.term)), extras=num(v.delivery)+num(v.protection), total=monthly*num(v.term)+extras, interest=monthly*num(v.term)-num(v.financed), above=total-num(v.cash);
    return { primary:`${money(monthly)}/mo`, stats:[['Cash price',money(num(v.cash))],['Total paid',money(total)],['Interest',money(interest)],['Extras',money(extras)],['Above cash price',money(above)]], summary:{monthly,total,above}, warnings:num(v.cash)>0&&above>num(v.cash)*.25?['Total entered cost is more than 25% above the cash price.']:[] };
  }
  if (type === 'rent') {
    const extras=num(v.utilities)+num(v.parking)+num(v.internet)+num(v.other)+num(v.insurance)+num(v.commute), months=Math.max(1,num(v.months)), effective=num(v.base)+extras+num(v.movein)/months, cash=num(v.base)+num(v.movein)+num(v.deposit);
    return { primary:`${money(effective)}/mo`, stats:[['Base rent',money(num(v.base))],['Recurring extras',money(extras)],['Annual cost',money(effective*12)],['Move-in cash',money(cash)],['Deposit',money(num(v.deposit))]], summary:{monthly:effective,annual:effective*12,cash}, warnings:[] };
  }
  const A=num(v.asalary)+num(v.abonus)+num(v.abenefits)-num(v.acommute), B=num(v.bsalary)+num(v.bbonus)+num(v.bbenefits)-num(v.bcommute), diff=B-A;
  return { primary:money(Math.abs(diff)), subtitle:`${diff>=0?'Offer B':'Offer A'} has the higher entered annual value.`, stats:[['Offer A value',money(A)],['Offer B value',money(B)],['A commute hours / year',`${Math.round(num(v.ahours)*48)} hrs`],['B commute hours / year',`${Math.round(num(v.bhours)*48)} hrs`],['A PTO value',money(num(v.apto)*(num(v.asalary)/260))],['B PTO value',money(num(v.bpto)*(num(v.bsalary)/260))]], summary:{difference:diff,A,B}, warnings:['Salary is only one part of a job offer; benefits, commute and time also matter.'] };
}

function Field({ spec, value, setValue, mode }) {
  const [label,key,prefix,suffix,fullOnly]=spec;
  if (fullOnly && mode === 'quick') return null;
  return <label className="field"><span>{label}</span><div className="input">{prefix&&<b>{prefix}</b>}<input value={value} onChange={e=>setValue(key,e.target.value)} />{suffix&&<b>{suffix}</b>}</div></label>;
}

function Stat({ label, value }) { return <div className="stat"><small>{label}</small><b>{value}</b></div>; }

export default function Page() {
  const [mounted,setMounted]=useState(false);
  const [active,setActive]=useState(null);
  const [mode,setMode]=useState('quick');
  const [saved,setSaved]=useState([]);

  useEffect(()=>{
    setMounted(true);
    try { setSaved(JSON.parse(window.localStorage.getItem('cf_saved') || '[]')); } catch { setSaved([]); }
  },[]);

  const persist = (item) => {
    const next=[{id:Date.now(),time:new Date().toLocaleString(),...item},...saved].slice(0,20);
    setSaved(next);
    try { window.localStorage.setItem('cf_saved',JSON.stringify(next)); } catch {}
  };

  const removeSaved = (id) => {
    const next=saved.filter(x=>x.id!==id); setSaved(next);
    try { window.localStorage.setItem('cf_saved',JSON.stringify(next)); } catch {}
  };

  if (!mounted) return <main><div className="section"><div className="center"><div className="eyebrow">CHECKFIRST</div><h2>Loading…</h2></div></div></main>;

  return <main>
    <nav><div className="nav"><button className="brand" onClick={()=>setActive(null)}><i>✓</i>CheckFirst</button><div><button className="ghost" onClick={()=>setActive('saved')}>Saved Checks</button><button className="primary" onClick={()=>setActive(null)}>Start a Free Check →</button></div></div></nav>
    {active==='saved' ? <Saved items={saved} remove={removeSaved} back={()=>setActive(null)} /> : active ? <Tool type={active} mode={mode} setMode={setMode} save={persist} saved={()=>setActive('saved')} back={()=>setActive(null)} /> : <Home open={t=>{setMode('quick');setActive(t)}} />}
    <footer>CheckFirst is an educational planning tool. Estimates only. Not legal, tax, lending, insurance, investment, or professional advice.</footer>
  </main>;
}

function Home({ open }) {
  return <><section className="hero"><div><div className="eyebrow">CHECK BEFORE YOU COMMIT</div><h1>Understand the <em>real cost</em> before you sign.</h1><p>Cars, homes, solar, loans, financed purchases, apartments and job offers. Change the numbers and see the impact instantly.</p><div className="pills"><span>✓ Free checks</span><span>⚡ Live results</span><span>🔒 No account required</span></div></div><div className="visual"><div className="float a"><small>Car financing</small><b>$10,109</b><i>estimated interest</i></div><div className="float b"><small>Solar quote</small><b>$11,900</b><i>cash vs financed gap</i></div><div className="float c"><small>Apartment</small><b>$2,046/mo</b><i>effective cost</i></div></div></section><section className="section"><div className="center"><div className="eyebrow">WHAT ARE YOU CHECKING?</div><h2>Choose the decision in front of you.</h2><p>Start with a 60-second Quick Check or switch to Full Check for more context.</p></div><div className="cards">{Object.entries(TOOL_CONFIGS).map(([id,t])=><article key={id}><div className="icon">{t.icon}</div><h3>{t.title}</h3><p>{t.description}</p><button onClick={()=>open(id)}>Open check →</button></article>)}</div><div className="trust"><div><b>Transparent math</b><p>See the numbers behind the result.</p></div><div><b>Quick or Full</b><p>Start simple, then add more context.</p></div><div><b>Save and compare</b><p>Keep scenarios on your device.</p></div><div><b>You decide</b><p>The tool informs; it does not make the decision.</p></div></div></section></>;
}

function Tool({ type, mode, setMode, save, saved, back }) {
  const config=TOOL_CONFIGS[type];
  const [v,setV]=useState(config.defaults);
  useEffect(()=>setV(config.defaults),[type]);
  const result=useMemo(()=>calculate(type,v),[type,v]);
  const setValue=(key,value)=>setV(prev=>({...prev,[key]:value}));
  return <section className="workspace"><div className="head"><div><div className="eyebrow">CHECKFIRST REPORT</div><h2>{config.title}</h2><p>{config.description}</p></div><button className="ghost" onClick={back}>← All Checks</button></div><div className="modes"><button className={mode==='quick'?'on':''} onClick={()=>setMode('quick')}>Quick Check · ~60 sec</button><button className={mode==='full'?'on':''} onClick={()=>setMode('full')}>Full Check · deeper report</button></div><div className="work"><div className="panel"><h3>Enter the details</h3><div className="grid">{config.fields.map(spec=><Field key={spec[1]} spec={spec} value={v[spec[1]]} setValue={setValue} mode={mode} />)}</div></div><div className="panel"><div className="result"><small>CHECKFIRST RESULT</small><strong>{result.primary}</strong>{result.subtitle&&<p>{result.subtitle}</p>}</div><div className="stats">{result.stats.map(([label,value])=><Stat key={label} label={label} value={value} />)}</div>{result.warnings.length>0&&<div className="flags">{result.warnings.map((w,i)=><div className="flag" key={i}><b>Worth checking</b><p>{w}</p></div>)}</div>}<div className="actions"><button className="primary" onClick={()=>save({type:config.title,label:config.title,summary:result.summary})}>Save Check</button><button onClick={()=>window.print()}>Export Report</button><button onClick={saved}>Compare Saved</button></div></div></div></section>;
}

function Saved({ items, remove, back }) {
  const groups={}; items.forEach(item=>{(groups[item.type]??=[]).push(item)});
  const pair=Object.values(groups).find(group=>group.length>=2);
  return <section className="workspace"><div className="head"><div><div className="eyebrow">SAVED CHECKS</div><h2>Recent checks</h2><p>Saved only on this browser for now.</p></div><button className="ghost" onClick={back}>← Home</button></div><div className="panel">{items.length===0?<p>No saved checks yet.</p>:items.map(item=><div className="row" key={item.id}><div><b>{item.type}</b><small>{item.time}</small></div><button className="ghost" onClick={()=>remove(item.id)}>Delete</button></div>)}</div><div className="panel" style={{marginTop:16}}><h3>Comparison</h3>{pair?<div className="stats">{Object.keys(pair[0].summary||{}).filter(k=>typeof pair[0].summary[k]==='number'&&typeof pair[1].summary?.[k]==='number').map(k=><div className="stat" key={k}><small>{k}</small><b>{money(pair[0].summary[k])}</b><small>vs</small><b>{money(pair[1].summary[k])}</b></div>)}</div>:<p>Save two checks of the same type to compare them here.</p>}</div></section>;
}
