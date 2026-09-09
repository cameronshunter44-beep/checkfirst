# CheckFirst

CheckFirst helps people understand the real cost of major financial decisions before they commit.

## Included checks
- Car purchase
- Home buying
- Solar financing
- Personal loans
- Big purchase financing
- Rent
- Job offer comparison

## V1 behavior
- Quick Check uses only fields visible in Quick mode.
- Full Check adds deeper costs and assumptions.
- Fixed-payment loan estimates use standard amortization math.
- Saved checks are stored in browser localStorage only and capped at 20.
- No current market rate, appraisal, approval, valuation or external quote is presented unless a real source is connected later.
- The app includes Privacy and Terms/Calculator Disclosures pages.

## Quality safeguards
- `npm run test:calc` verifies representative payment math and checks that hidden Full Check values cannot alter Quick Check results.
- `npm run build` runs calculation verification before the Next.js production build.
- Baseline security headers are configured in `next.config.js`.

## Run locally
```bash
npm install
npm run dev
```

## Verify calculations
```bash
npm run test:calc
```

## Production build
```bash
npm run build
```

Designed for Next.js deployment on Vercel.
