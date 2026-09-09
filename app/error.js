'use client';

export default function ErrorPage({ reset }) {
  return <main style={{maxWidth:760,margin:'0 auto',padding:'90px 22px',textAlign:'center'}}>
    <div className="eyebrow">CHECKFIRST</div>
    <h1>Something went wrong</h1>
    <p className="muted">The page hit an unexpected error. Your browser-saved checks are not automatically deleted by this screen.</p>
    <button className="primary" onClick={() => reset()} style={{marginTop:12}}>Try again</button>
  </main>;
}
