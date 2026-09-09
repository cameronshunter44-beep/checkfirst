'use client';

import { useEffect, useMemo, useState } from 'react';
import { calculate, money } from '../lib/calculations.js';

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
    questions: ['What is the true out-the-door price before discussing monthly payment?', 'Which add-ons are optional, and can each one be removed?', 'Is this APR the best available financing offer, or should I compare a bank or credit union?', 'How is my trade-in being valued separately from the new purchase?', 'Is there any prepayment penalty or unusual loan condition?'],
  },
  home: {
    icon: '🏠', title: 'Home Buying', description: 'Mortgage, taxes, insurance, closing costs and monthly carrying costs.',
    defaults: { price:'425000', down:'85000', apr:'6.4', years:'30', tax:'5200', insurance:'1800', hoa:'150', maint:'350', closing:'12000', utilities:'300' },
    fields: [['Home price','price','$','',false],['Down payment','down','$','',false],['APR','apr','','%',false],['Term','years','',' years',false],['Property tax / year','tax','$','',true],['Insurance / year','insurance','$','',true],['HOA / month','hoa','$','',true],['Maintenance / month','maint','$','',true],['Closing costs','closing','$','',true],['Utilities / month','utilities','$','',true]],
    questions: ['Does this payment include taxes, insurance and any mortgage insurance?', 'What are the full estimated closing costs and lender fees?', 'Is the rate locked, and are points being paid to obtain it?', 'What repairs or maintenance are likely in the first year?', 'Are there HOA assessments, restrictions or upcoming fee increases?'],
  },
  solar: {
    icon:'☀️', title:'Solar', description:'Cash price versus financed price and long-term loan cost.',
    defaults:{ cash:'27900', financed:'39800', apr:'4.99', years:'25', roof:'14', electric:'210' },
    fields:[['Cash price','cash','$','',false],['Financed price','financed','$','',false],['APR','apr','','%',false],['Loan term','years','',' years',false],['Roof age','roof','',' years',true],['Electric bill / month','electric','$','',true]],
    questions: ['Why is the financed price different from the cash price?', 'What production level is guaranteed in writing?', 'What happens if the roof needs replacement?', 'Who owns the equipment and what happens if the home is sold?', 'Which incentives or utility savings are guaranteed versus estimated?'],
  },
  loan: {
    icon:'💳', title:'Loan', description:'APR, fees, monthly payment and total repayment.',
    defaults:{ amount:'20000', apr:'11.5', term:'60', fees:'800' },
    fields:[['Amount borrowed','amount','$','',false],['APR','apr','','%',false],['Term','term','',' months',false],['Fees','fees','$','',true]],
    questions: ['What is the APR including lender fees, not only the interest rate?', 'Is the rate fixed for the entire term?', 'Are there origination, late, payoff or prepayment fees?', 'What is the exact total repayment if I make every scheduled payment?', 'Can I get a better total cost with a shorter term or another lender?'],
  },
  purchase: {
    icon:'🛋️', title:'Big Purchase', description:'Furniture, appliances, electronics and store financing.',
    defaults:{ cash:'4200', financed:'4850', apr:'14.9', term:'48', delivery:'250', protection:'400' },
    fields:[['Cash price','cash','$','',false],['Financed amount','financed','$','',false],['APR','apr','','%',false],['Term','term','',' months',false],['Delivery/setup','delivery','$','',true],['Protection plan','protection','$','',true]],
    questions: ['Is there a lower cash price than the financed price?', 'Is the promotion true 0% financing or deferred interest?', 'When does any promotional rate expire?', 'Are delivery, setup or protection plans optional?', 'What is the return policy if the item is financed?'],
  },
  rent: {
    icon:'🏢', title:'Rent', description:'Base rent, recurring fees, move-in cash and commute cost.',
    defaults:{ base:'1600', months:'12', utilities:'180', parking:'100', internet:'65', other:'45', insurance:'18', movein:'650', deposit:'1600', commute:'120' },
    fields:[['Base rent','base','$','',false],['Lease length','months','',' months',false],['Utilities','utilities','$','',true],['Parking','parking','$','',true],['Internet','internet','$','',true],['Other fees','other','$','',true],['Insurance','insurance','$','',true],['Move-in fees','movein','$','',true],['Deposit','deposit','$','',true],['Commute / month','commute','$','',true]],
    questions: ['Which monthly fees are mandatory in addition to rent?', 'Which utilities are included and what have they historically cost?', 'What is required at move-in?', 'Under what conditions can the security deposit be withheld?', 'What are the renewal, early-termination and rent-increase terms?'],
  },
  job: {
    icon:'💼', title:'Job Offer', description:'Compare salary, bonus, benefits, commute and PTO.',
    defaults:{ asalary:'80000', abonus:'5000', abenefits:'9200', acommute:'2400', apto:'15', ahours:'5', bsalary:'92000', bbonus:'3000', bbenefits:'7000', bcommute:'6200', bpto:'12', bhours:'10' },
    fields:[['Offer A salary','asalary','$','',false],['Offer A bonus','abonus','$','',false],['Offer B salary','bsalary','$','',false],['Offer B bonus','bbonus','$','',false],['Offer A benefits','abenefits','$','',true],['Offer A commute / year','acommute','$','',true],['Offer A PTO days','apto','','',true],['Offer A commute hrs / week','ahours','',' hrs',true],['Offer B benefits','bbenefits','$','',true],['Offer B commute / year','bcommute','$','',true],['Offer B PTO days','bpto','','',true],['Offer B commute hrs / week','bhours','',' hrs',true]],
    questions: ['What health-plan premiums, deductibles and employer contributions apply?', 'How does the retirement match vest?', 'Is the bonus guaranteed, target-based or discretionary?', 'What are the actual schedule, remote-work and travel expectations?', 'Which offer gives the better path for skills, promotion and future earnings?'],
  },
};

const TEXT_KEYS = new Set(['make','model']);

function Field({ spec, value, setValue, mode }) {
  const [label,key,prefix,suffix,fullOnly] = spec;
  if (fullOnly && mode === 'quick') return null;
  const textField = TEXT_KEYS.has(key);
  return <label className="field">
    <span>{label}</span>
    <div className="input">
      {prefix && <b>{prefix}</b>}
      <input
        aria-label={label}
        value={value}
        inputMode={textField ? 'text' : 'decimal'}
        autoComplete="off"
        spellCheck={false}
        onChange={e => setValue(key, e.target.value)}
      />
      {suffix && <b>{suffix}</b>}
    </div>
  </label>;
}

function Stat({ label, value }) {
  return <div className="stat"><small>{label}</small><b>{value}</b></div>;
}

function saveLabel(type, values) {
  if (type === 'car') {
    const vehicle = [values.year, values.make, values.model].filter(Boolean).join(' ').trim();
    return vehicle || 'Car purchase';
  }
  if (type === 'home') return `${money(Number(values.price) || 0)} home`;
  if (type === 'solar') return `${money(Number(values.financed) || 0)} solar offer`;
  if (type === 'loan') return `${money(Number(values.amount) || 0)} loan`;
  if (type === 'purchase') return `${money(Number(values.cash) || 0)} purchase`;
  if (type === 'rent') return `${money(Number(values.base) || 0)}/mo rent`;
  return 'Offer A vs Offer B';
}

export default function Page() {
  const [mounted,setMounted] = useState(false);
  const [active,setActive] = useState(null);
  const [mode,setMode] = useState('quick');
  const [saved,setSaved] = useState([]);

  useEffect(() => {
    setMounted(true);
    try {
      const parsed = JSON.parse(window.localStorage.getItem('cf_saved') || '[]');
      setSaved(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSaved([]);
    }
  }, []);

  const persist = (item) => {
    const next = [{ id: Date.now(), time: new Date().toLocaleString(), ...item }, ...saved].slice(0, 20);
    setSaved(next);
    try { window.localStorage.setItem('cf_saved', JSON.stringify(next)); } catch {}
  };

  const removeSaved = (id) => {
    const next = saved.filter(x => x.id !== id);
    setSaved(next);
    try { window.localStorage.setItem('cf_saved', JSON.stringify(next)); } catch {}
  };

  const clearSaved = () => {
    if (!window.confirm('Delete all saved CheckFirst checks from this browser?')) return;
    setSaved([]);
    try { window.localStorage.removeItem('cf_saved'); } catch {}
  };

  if (!mounted) return <main><div className="section"><div className="center"><div className="eyebrow">CHECKFIRST</div><h2>Loading…</h2></div></div></main>;

  return <main>
    <nav aria-label="Main navigation"><div className="nav">
      <button className="brand" onClick={() => setActive(null)} aria-label="CheckFirst home"><i>✓</i>CheckFirst</button>
      <div><button className="ghost" onClick={() => setActive('saved')}>Saved Checks</button><button className="primary" onClick={() => setActive(null)}>Start a Free Check →</button></div>
    </div></nav>

    {active === 'saved'
      ? <Saved items={saved} remove={removeSaved} clear={clearSaved} back={() => setActive(null)} />
      : active
        ? <Tool type={active} mode={mode} setMode={setMode} save={persist} saved={() => setActive('saved')} back={() => setActive(null)} />
        : <Home open={type => { setMode('quick'); setActive(type); }} />}

    <footer>
      <div>CheckFirst is an educational planning tool. Results are estimates based on the values you enter, not offers, approvals, appraisals or professional advice.</div>
      <div className="footer-links"><a href="/privacy">Privacy</a><a href="/terms">Terms & Disclosures</a></div>
    </footer>
  </main>;
}

function Home({ open }) {
  return <>
    <section className="hero"><div>
      <div className="eyebrow">CHECK BEFORE YOU COMMIT</div>
      <h1>Understand the <em>real cost</em> before you sign.</h1>
      <p>Cars, homes, solar, loans, financed purchases, apartments and job offers. Change the numbers and see the impact instantly.</p>
      <div className="pills"><span>✓ Free checks</span><span>⚡ Live recalculation</span><span>🔒 Local saves</span></div>
    </div><div className="visual" aria-hidden="true">
      <div className="float a"><small>Car financing</small><b>$10,109</b><i>estimated interest</i></div>
      <div className="float b"><small>Solar quote</small><b>$11,900</b><i>cash vs financed gap</i></div>
      <div className="float c"><small>Apartment</small><b>$2,046/mo</b><i>effective cost</i></div>
    </div></section>

    <section className="section"><div className="center">
      <div className="eyebrow">WHAT ARE YOU CHECKING?</div>
      <h2>Choose the decision in front of you.</h2>
      <p>Quick Check uses only the fields you can see. Full Check adds the deeper costs that are easy to miss.</p>
    </div>
    <div className="cards">{Object.entries(TOOL_CONFIGS).map(([id,t]) => <article key={id}>
      <div className="icon" aria-hidden="true">{t.icon}</div><h3>{t.title}</h3><p>{t.description}</p><button onClick={() => open(id)}>Open check →</button>
    </article>)}</div>
    <div className="trust">
      <div><b>Transparent math</b><p>Results come from the numbers you enter, not a hidden approval score.</p></div>
      <div><b>Quick or Full</b><p>Hidden Full Check fields never change a Quick Check result.</p></div>
      <div><b>Private by default</b><p>Saved checks stay in this browser in the current V1.</p></div>
      <div><b>No fake live data</b><p>CheckFirst does not label estimates as current market benchmarks unless a source is actually connected.</p></div>
    </div></section>
  </>;
}

function Tool({ type, mode, setMode, save, saved, back }) {
  const config = TOOL_CONFIGS[type];
  const [v,setV] = useState(config.defaults);
  useEffect(() => setV(config.defaults), [type, config.defaults]);
  const result = useMemo(() => calculate(type, v, mode), [type, v, mode]);
  const setValue = (key,value) => setV(prev => ({ ...prev, [key]: value }));
  const reset = () => setV({ ...config.defaults });

  return <section className="workspace">
    <div className="head"><div><div className="eyebrow">CHECKFIRST REPORT</div><h2>{config.title}</h2><p>{config.description}</p></div><button className="ghost" onClick={back}>← All Checks</button></div>
    <div className="modes" role="group" aria-label="Check depth">
      <button className={mode === 'quick' ? 'on' : ''} onClick={() => setMode('quick')}>Quick Check · ~60 sec</button>
      <button className={mode === 'full' ? 'on' : ''} onClick={() => setMode('full')}>Full Check · deeper report</button>
    </div>
    <div className="mode-note">{mode === 'quick' ? 'Quick Check uses only the inputs visible below. Full-only defaults do not affect this result.' : 'Full Check includes every visible field below. Verify each figure against the actual quote, contract or offer.'}</div>

    <div className="work">
      <div className="panel"><div className="panel-title"><h3>Enter the details</h3><button className="link-button" onClick={reset}>Reset</button></div><div className="grid">{config.fields.map(spec => <Field key={spec[1]} spec={spec} value={v[spec[1]]} setValue={setValue} mode={mode} />)}</div><p className="input-note">Use non-negative estimates. Invalid or negative numeric values are treated as zero in calculations.</p></div>
      <div className="panel report-panel">
        <div className="result"><small>CHECKFIRST RESULT</small><strong>{result.primary}</strong>{result.subtitle && <p>{result.subtitle}</p>}</div>
        <div className="stats">{result.stats.map(([label,value]) => <Stat key={label} label={label} value={value} />)}</div>
        {result.warnings.length > 0 && <div className="flags">{result.warnings.map((warning,index) => <div className="flag" key={`${warning}-${index}`}><b>Worth checking</b><p>{warning}</p></div>)}</div>}
        <div className="actions"><button className="primary" onClick={() => save({ type: config.title, label: saveLabel(type,v), mode, summary: result.summary })}>Save Check</button><button onClick={() => window.print()}>Print / Save PDF</button><button onClick={saved}>Compare Saved</button></div>
      </div>
    </div>

    <div className="lower-grid">
      <div className="panel"><h3>Questions to ask before committing</h3><ol className="questions">{config.questions.map(question => <li key={question}>{question}</li>)}</ol></div>
      <div className="panel"><h3>What this result assumes</h3><ul className="questions"><li>All calculations use the values you entered; CheckFirst is not currently pulling a live lender, dealer, landlord, employer or market quote.</li><li>Loan calculations assume a standard fixed-rate amortizing payment unless the screen says otherwise.</li><li>Real contracts can include taxes, fees, timing rules, rebates, escrow, insurance, variable terms and other details that change the final cost.</li><li>Use this as a second-opinion planning tool and verify important numbers before signing or paying.</li></ul></div>
    </div>
  </section>;
}

function Saved({ items, remove, clear, back }) {
  const groups = {};
  items.forEach(item => { (groups[item.type] ??= []).push(item); });
  const pair = Object.values(groups).find(group => group.length >= 2);
  const comparableKeys = pair
    ? Object.keys(pair[0].summary || {}).filter(key => typeof pair[0].summary?.[key] === 'number' && typeof pair[1].summary?.[key] === 'number')
    : [];

  return <section className="workspace">
    <div className="head"><div><div className="eyebrow">SAVED CHECKS</div><h2>Recent checks</h2><p>Saved only in this browser in the current V1. CheckFirst keeps up to 20.</p></div><div className="head-actions"><button className="ghost" onClick={back}>← Home</button>{items.length > 0 && <button className="danger" onClick={clear}>Clear all</button>}</div></div>
    <div className="panel">{items.length === 0 ? <p>No saved checks yet.</p> : items.map(item => <div className="row" key={item.id}><div><b>{item.label || item.type}</b><small>{item.type}{item.mode ? ` · ${item.mode === 'full' ? 'Full' : 'Quick'} Check` : ''} · {item.time}</small></div><button className="ghost" onClick={() => remove(item.id)}>Delete</button></div>)}</div>
    <div className="panel compare"><h3>Comparison</h3>{pair && comparableKeys.length > 0 ? <><p className="muted">Comparing the two most recent saved checks of the same type: {pair[0].type}.</p><div className="stats">{comparableKeys.map(key => <div className="stat" key={key}><small>{key.replace(/([A-Z])/g,' $1').replace(/^./,c => c.toUpperCase())}</small><b>{money(pair[0].summary[key])}</b><small>vs</small><b>{money(pair[1].summary[key])}</b></div>)}</div></> : <p>Save two checks of the same type to compare them here.</p>}</div>
  </section>;
}
