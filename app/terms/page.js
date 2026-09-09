export const metadata = { title: 'Terms & Disclosures — CheckFirst' };

export default function TermsPage() {
  return <main style={{maxWidth:860,margin:'0 auto',padding:'64px 22px',lineHeight:1.7}}>
    <a href="/" style={{color:'#58f0b0'}}>← Back to CheckFirst</a>
    <h1>Terms & Calculator Disclosures</h1>
    <p><strong>Last updated: September 9, 2026.</strong></p>
    <p>CheckFirst is an educational decision-support tool. Results are estimates based on the values a user enters and are not offers, approvals, appraisals, valuations, quotes, or professional advice.</p>
    <h2>Calculations</h2>
    <p>Loan-payment estimates use standard amortization math based on entered principal, annual percentage rate and term. Actual lender calculations may differ because of timing, compounding conventions, taxes, insurance, fees, escrow, promotional terms, variable rates, rebates, credits, prepayment rules, and other contract terms.</p>
    <h2>Market comparisons</h2>
    <p>Unless a screen explicitly identifies a live external data source and date, CheckFirst does not claim that a price, rate, score, warning, or example is a current market benchmark. Users should verify current offers with the relevant lender, seller, employer, landlord, contractor, insurer, government agency, or qualified professional.</p>
    <h2>No recommendation</h2>
    <p>A lower estimated cost does not necessarily mean a transaction is suitable for a particular person. Users remain responsible for reviewing contracts and making their own decisions.</p>
    <h2>Accuracy</h2>
    <p>CheckFirst is provided on an as-is basis. Inputs, assumptions, software defects, or omitted transaction terms can affect results. Important decisions should be independently verified before signing or paying.</p>
  </main>;
}
