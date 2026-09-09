export const metadata = { title: 'Privacy — CheckFirst' };

export default function PrivacyPage() {
  return <main style={{maxWidth:860,margin:'0 auto',padding:'64px 22px',lineHeight:1.7}}>
    <a href="/" style={{color:'#58f0b0'}}>← Back to CheckFirst</a>
    <h1>Privacy</h1>
    <p><strong>Last updated: September 9, 2026.</strong></p>
    <p>CheckFirst is currently designed so that its core calculators run in your browser. The values you type into a check are used to calculate the results shown to you.</p>
    <h2>Saved checks</h2>
    <p>If you choose to save a check, the current version stores that saved check in your browser's local storage on that device. CheckFirst does not currently require an account for these checks.</p>
    <h2>Information you enter</h2>
    <p>Do not enter passwords, Social Security numbers, bank-account numbers, full payment-card numbers, or other highly sensitive information into calculator fields.</p>
    <h2>Hosting and technical data</h2>
    <p>The website is hosted by Vercel. Like most web hosts, hosting infrastructure may process technical information needed to serve and secure the site, such as requests, device or browser information, and network information.</p>
    <h2>Financial information</h2>
    <p>CheckFirst provides estimates and educational comparisons. It is not a lender, broker, financial adviser, insurer, attorney, tax adviser, or credit-repair service.</p>
    <h2>Future features</h2>
    <p>If accounts, document uploads, payments, analytics, or third-party data connections are added, this notice should be updated before those features are made available to users.</p>
  </main>;
}
