export default function NotFound() {
  return <main style={{maxWidth:760,margin:'0 auto',padding:'90px 22px',textAlign:'center'}}>
    <div className="eyebrow">CHECKFIRST</div>
    <h1>Page not found</h1>
    <p className="muted">That page does not exist or may have moved.</p>
    <a className="primary" href="/" style={{display:'inline-block',textDecoration:'none',marginTop:12}}>Back to CheckFirst</a>
  </main>;
}
